import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/compliance/dashboard?organization_id={id}
 * Get compliance dashboard data including completion rates and statistics
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const url = new URL(request.url)
    const organizationId = url.searchParams.get('organization_id')
    const departmentId = url.searchParams.get('department_id')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Build base query for employees
    let employeeQuery = supabase
      .from('employees')
      .select('id, employee_id, position_title, department_id, employment_status')
      .eq('organization_id', organizationId)
      .eq('employment_status', 'active') as any

    if (departmentId) {
      employeeQuery = employeeQuery.eq('department_id', departmentId) as any
    }

    const { data: employees, error: empError } = await employeeQuery as any

    if (empError) {
      console.error('Error fetching employees:', empError)
      return NextResponse.json(
        { error: empError.message },
        { status: 500 }
      )
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        data: {
          total_employees: 0,
          overall_completion_rate: 0,
          departments: [],
          policies: [],
          recent_completions: []
        }
      })
    }

    const employeeIds = (employees as any[]).map((emp: any) => emp.id)

    // Fetch policy assignments for these employees
    const { data: assignments, error: assignError } = await supabase
      .from('employee_policy_assignments')
      .select(`
        id,
        user_id,
        policy_bundle_id,
        assigned_at,
        due_at,
        completed_at,
        status,
        department_id
      `)
      .in('user_id', (employees as any[]).map((emp: any) => emp.id)) as any

    if (assignError) {
      console.error('Error fetching policy assignments:', assignError)
      return NextResponse.json(
        { error: assignError.message },
        { status: 500 }
      )
    }

    // Type the assignments array
    type AssignmentRow = {
      id: string
      user_id: string
      policy_bundle_id: string
      assigned_at: string
      due_at: string
      completed_at: string | null
      status: string
      department_id: string
      employee_id?: string
      policy_id?: string
      policy?: any
    }

    const typedAssignments = (assignments || []) as AssignmentRow[]

    // Calculate statistics
    const totalAssignments = typedAssignments.length
    const completedAssignments = typedAssignments.filter(a => a.status === 'completed').length
    const overdueAssignments = typedAssignments.filter(a => {
      if (a.status === 'completed') return false
      if (!a.due_at) return false
      return new Date(a.due_at) < new Date()
    }).length

    const overallCompletionRate = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

    // Calculate per-department statistics
    const departmentStats = new Map<string, {
      department_id: string
      total_assignments: number
      completed_assignments: number
      completion_rate: number
      employee_count: number
    }>()

    (employees as any[]).forEach((emp: any) => {
      if (!departmentStats.has(emp.department_id)) {
        departmentStats.set(emp.department_id, {
          department_id: emp.department_id,
          total_assignments: 0,
          completed_assignments: 0,
          completion_rate: 0,
          employee_count: 0
        })
      }
      const stats = departmentStats.get(emp.department_id)!
      stats.employee_count++
    })

    typedAssignments.forEach(assignment => {
      const employee = (employees as any[]).find((e: any) => e.id === assignment.user_id)
      if (!employee) return

      const stats = departmentStats.get(employee.department_id)!
      stats.total_assignments++
      if (assignment.status === 'completed') {
        stats.completed_assignments++
      }
    })

    // Calculate completion rates
    departmentStats.forEach(stats => {
      stats.completion_rate = stats.total_assignments > 0
        ? Math.round((stats.completed_assignments / stats.total_assignments) * 100)
        : 0
    })

    // Fetch department names
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .eq('organization_id', organizationId) as any

    const departmentMap = new Map((departments as any[] || []).map((d: any) => [d.id, d.name]))

    const departmentData = Array.from(departmentStats.values()).map(stats => ({
      ...stats,
      department_name: departmentMap.get(stats.department_id) || 'Unknown Department'
    }))

    // Calculate per-policy statistics
    const policyStats = new Map<string, {
      policy_id: string
      policy_title: string
      category: string
      total_assigned: number
      total_completed: number
      completion_rate: number
    }>()

    typedAssignments.forEach(assignment => {
      if (!assignment.policy_id) return

      if (!policyStats.has(assignment.policy_id)) {
        policyStats.set(assignment.policy_id, {
          policy_id: assignment.policy_id,
          policy_title: assignment.policy?.title || 'Unknown Policy',
          category: assignment.policy?.category || 'general',
          total_assigned: 0,
          total_completed: 0,
          completion_rate: 0
        })
      }

      const stats = policyStats.get(assignment.policy_id)!
      stats.total_assigned++
      if (assignment.status === 'completed') {
        stats.total_completed++
      }
    })

    // Calculate completion rates
    policyStats.forEach(stats => {
      stats.completion_rate = stats.total_assigned > 0
        ? Math.round((stats.total_completed / stats.total_assigned) * 100)
        : 0
    })

    const policyData = Array.from(policyStats.values())
      .sort((a, b) => a.completion_rate - b.completion_rate) // Lowest completion first

    // Get recent completions
    const recentCompletions = typedAssignments
      .filter(a => a.status === 'completed' && a.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 10)
      .map(assignment => {
        const employee = (employees as any[]).find((e: any) => e.id === assignment.user_id)
        return {
          employee_id: employee?.employee_id || 'Unknown',
          position_title: employee?.position_title || 'Unknown',
          policy_title: assignment.policy?.title || 'Unknown Policy',
          completed_at: assignment.completed_at
        }
      })

    // Return dashboard data
    return NextResponse.json({
      data: {
        total_employees: employees.length,
        total_assignments: totalAssignments,
        completed_assignments: completedAssignments,
        overdue_assignments: overdueAssignments,
        overall_completion_rate: overallCompletionRate,
        departments: departmentData,
        policies: policyData,
        recent_completions: recentCompletions
      }
    })
  } catch (error) {
    console.error('Error in GET /api/compliance/dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/compliance/dashboard/employee?employee_id={id}
 * Get compliance data for a specific employee
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { employee_id } = body

    if (!employee_id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Fetch employee
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(id, name),
        manager:employees(id, employee_id, position_title)
      `)
      .eq('id', employee_id)
      .single() as any as any

    if (empError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Fetch policy assignments
    const { data: assignments, error: assignError } = await supabase
      .from('employee_policy_assignments')
      .select(`
        id,
        user_id,
        policy_bundle_id,
        assigned_at,
        due_at,
        completed_at,
        status,
        department_id,
        completion_percentage,
        notes
      `)
      .eq('user_id', employee_id)
      .order('assigned_at', { ascending: false }) as any

    if (assignError) {
      console.error('Error fetching policy assignments:', assignError)
      return NextResponse.json(
        { error: assignError.message },
        { status: 500 }
      )
    }

    // Calculate statistics
    const assignmentsArray = assignments as any[] || []
    const totalAssignments = assignmentsArray.length
    const completedAssignments = assignmentsArray.filter((a: any) => a.status === 'completed').length
    const pendingAssignments = assignmentsArray.filter((a: any) => a.status === 'assigned').length
    const overdueAssignments = assignmentsArray.filter((a: any) => {
      if (a.status === 'completed') return false
      if (!a.due_at) return false
      return new Date(a.due_at) < new Date()
    }).length

    const completionRate = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

    return NextResponse.json({
      data: {
        employee,
        statistics: {
          total_assignments: totalAssignments,
          completed_assignments: completedAssignments,
          pending_assignments: pendingAssignments,
          overdue_assignments: overdueAssignments,
          completion_rate: completionRate
        },
        assignments: assignments || []
      }
    })
  } catch (error) {
    console.error('Error in POST /api/compliance/dashboard/employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
