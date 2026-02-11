import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface DepartmentCompliance {
  department_id: string
  department_name: string
  total_assignments: number
  completed_assignments: number
  completion_rate: number
}

interface OverdueEmployee {
  user_id: string
  full_name: string
  department_name: string
  overdue_count: number
}

/**
 * GET /api/compliance/overview
 * Get organization-wide compliance data
 */
export async function GET() {
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

    // Get user's employee record to find organization
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single() as any

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee record not found' },
        { status: 404 }
      )
    }

    const organizationId = employee.organization_id

    // Get all policy assignments for the organization
    const { data: assignments, error: assignmentsError } = await supabase
      .from('employee_policy_assignments')
      .select(`
        id,
        user_id,
        department_id,
        status,
        departments:department_id (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId) as any

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json(
        { error: assignmentsError.message },
        { status: 500 }
      )
    }

    // Calculate organization-wide compliance
    const totalAssignments = assignments?.length || 0
    const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0
    const organizationCompliance = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

    // Calculate department breakdown
    const departmentMap = new Map<string, DepartmentCompliance>()

    assignments?.forEach(assignment => {
      const dept = assignment.departments as any
      const deptId = assignment.department_id
      const deptName = dept?.name || 'Unknown Department'

      if (!departmentMap.has(deptId)) {
        departmentMap.set(deptId, {
          department_id: deptId,
          department_name: deptName,
          total_assignments: 0,
          completed_assignments: 0,
          completion_rate: 0
        })
      }

      const deptData = departmentMap.get(deptId)!
      deptData.total_assignments++
      if (assignment.status === 'completed') {
        deptData.completed_assignments++
      }
    })

    // Calculate completion rates
    const departmentBreakdown: DepartmentCompliance[] = Array.from(departmentMap.values()).map(dept => ({
      ...dept,
      completion_rate: dept.total_assignments > 0
        ? Math.round((dept.completed_assignments / dept.total_assignments) * 100)
        : 0
    }))

    // Get overdue employees with their names
    const overdueAssignments = assignments?.filter(a => a.status === 'overdue') || []

    // Group by user and count overdue assignments
    const overdueMap = new Map<string, { user_id: string; department_id: string; count: number }>()

    overdueAssignments.forEach(assignment => {
      if (!overdueMap.has(assignment.user_id)) {
        overdueMap.set(assignment.user_id, {
          user_id: assignment.user_id,
          department_id: assignment.department_id,
          count: 0
        })
      }
      overdueMap.get(assignment.user_id)!.count++
    })

    // Fetch user profiles for overdue employees
    const overdueUserIds = Array.from(overdueMap.keys())
    let overdueEmployees: OverdueEmployee[] = []

    if (overdueUserIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
        .select('id, full_name')
        .in('id', overdueUserIds) as any

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      } else {
        // Get department names
        const deptIds = Array.from(overdueMap.values()).map(v => v.department_id)
        const { data: departments, error: deptsError } = await supabase
      .from('departments')
          .select('id, name')
          .in('id', deptIds) as any

        const deptNameMap = new Map(departments?.map(d => [d.id, d.name]) || [])

        overdueEmployees = profiles?.map(profile => {
          const overdueData = overdueMap.get(profile.id)!
          return {
            user_id: profile.id,
            full_name: profile.full_name || 'Unknown',
            department_name: deptNameMap.get(overdueData.department_id) || 'Unknown Department',
            overdue_count: overdueData.count
          }
        }) || []
      }
    }

    return NextResponse.json({
      organizationCompliance,
      departmentBreakdown,
      overdueEmployees
    })
  } catch (error) {
    console.error('Error in GET /api/compliance/overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
