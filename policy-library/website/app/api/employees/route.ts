import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

/**
 * GET /api/employees
 * List all employees in current user's organization
 * Query params: ?department_id=, ?role=, ?status=
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

    // Get user's employee record to find organization
    const { data: currentEmployee, error: employeeError } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single() as any

    if (employeeError || !currentEmployee) {
      return NextResponse.json(
        { error: 'Employee record not found' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const departmentId = url.searchParams.get('department_id')
    const role = url.searchParams.get('role')
    const status = url.searchParams.get('status')

    // Build query
    let query = supabase
      .from('employees')
      .select(`
        *,
        departments:department_id (
          id,
          name,
          code
        )
      `)
      .eq('organization_id', currentEmployee.organization_id) as any

    // Apply filters
    if (departmentId) {
      query = query.eq('department_id', departmentId) as any
    }
    if (role) {
      query = query.eq('role', role) as any
    }
    if (status) {
      query = query.eq('employment_status', status) as any
    }

    // Execute query
    const { data: employees, error } = await query.order('created_at', { ascending: false }) as any

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: employees || [] })
  } catch (error) {
    console.error('Error in GET /api/employees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/employees
 * Create new employee (called during invite acceptance)
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

    // Validate required fields
    if (!body.user_id || typeof body.user_id !== 'string') {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    if (!body.organization_id || typeof body.organization_id !== 'string') {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      )
    }

    // Prepare employee data
    const employeeData: EmployeeInsert = {
      user_id: body.user_id,
      organization_id: body.organization_id,
      department_id: body.department_id || null,
      role: body.role || 'employee',
      employee_id: body.employee_id || null,
      position_title: body.position_title || null,
      employment_status: body.employment_status || 'active',
      employment_type: body.employment_type || 'full_time',
      start_date: body.start_date || new Date().toISOString(),
      end_date: body.end_date || null,
      phone: body.phone || null,
      mobile_phone: body.mobile_phone || null,
      location: body.location || null,
      manager_id: body.manager_id || null,
      emergency_contact: body.emergency_contact || null,
      skills: body.skills || [],
      metadata: body.metadata || {}
    }

    // Create employee
    const { data: employee, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single()

    if (error) {
      console.error('Error creating employee:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/employees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/employees?id={id}
 * Update employee by id
 */
export async function PATCH(request: Request) {
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

    // Get user's role
    const { data: currentEmployee, error: employeeError } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single() as any

    if (employeeError || !currentEmployee) {
      return NextResponse.json(
        { error: 'Employee record not found' },
        { status: 404 }
      )
    }

    // Verify user has permission (privacy_officer or admin)
    if (currentEmployee.role !== 'privacy_officer' && currentEmployee.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get employee ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: EmployeeUpdate = {
      updated_at: new Date().toISOString()
    }

    // Only include fields that are provided
    if (body.department_id !== undefined) updateData.department_id = body.department_id
    if (body.role !== undefined) updateData.role = body.role
    if (body.employee_id !== undefined) updateData.employee_id = body.employee_id
    if (body.position_title !== undefined) updateData.position_title = body.position_title
    if (body.employment_status !== undefined) updateData.employment_status = body.employment_status
    if (body.employment_type !== undefined) updateData.employment_type = body.employment_type
    if (body.start_date !== undefined) updateData.start_date = body.start_date
    if (body.end_date !== undefined) updateData.end_date = body.end_date
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.mobile_phone !== undefined) updateData.mobile_phone = body.mobile_phone
    if (body.location !== undefined) updateData.location = body.location
    if (body.manager_id !== undefined) updateData.manager_id = body.manager_id
    if (body.emergency_contact !== undefined) updateData.emergency_contact = body.emergency_contact
    if (body.skills !== undefined) updateData.skills = body.skills
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    // Update employee (RLS will check permissions)
    const { data: employee, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', currentEmployee.organization_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating employee:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error in PATCH /api/employees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/employees?id={id}
 * Soft delete employee (set employment_status = 'terminated', end_date = NOW())
 */
export async function DELETE(request: Request) {
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

    // Get user's role
    const { data: currentEmployee, error: employeeError } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single() as any

    if (employeeError || !currentEmployee) {
      return NextResponse.json(
        { error: 'Employee record not found' },
        { status: 404 }
      )
    }

    // Verify user has permission (privacy_officer or admin)
    if (currentEmployee.role !== 'privacy_officer' && currentEmployee.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get employee ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Soft delete by setting employment_status to 'terminated'
    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        employment_status: 'terminated',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', currentEmployee.organization_id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting employee:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Employee terminated successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/employees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
