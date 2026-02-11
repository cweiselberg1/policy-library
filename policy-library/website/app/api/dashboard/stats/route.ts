import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/dashboard/stats
 * Get aggregate statistics for Privacy Officer dashboard
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

    // Count total employees in organization
    const { count: totalEmployees, error: employeesError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('employment_status', 'active') as any

    if (employeesError) {
      console.error('Error counting employees:', employeesError)
      return NextResponse.json(
        { error: employeesError.message },
        { status: 500 }
      )
    }

    // Count total departments
    const { count: totalDepartments, error: departmentsError } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active') as any

    if (departmentsError) {
      console.error('Error counting departments:', departmentsError)
      return NextResponse.json(
        { error: departmentsError.message },
        { status: 500 }
      )
    }

    // Get policy assignment statistics
    const { data: assignments, error: assignmentsError } = await supabase
      .from('employee_policy_assignments')
      .select('status')
      .eq('organization_id', organizationId) as any

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json(
        { error: assignmentsError.message },
        { status: 500 }
      )
    }

    // Calculate compliance metrics
    const totalAssignments = assignments?.length || 0
    const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0
    const overdueAssignments = assignments?.filter(a => a.status === 'overdue').length || 0

    const complianceRate = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

    return NextResponse.json({
      totalEmployees: totalEmployees || 0,
      totalDepartments: totalDepartments || 0,
      complianceRate,
      overdueAssignments
    })
  } catch (error) {
    console.error('Error in GET /api/dashboard/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
