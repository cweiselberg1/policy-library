import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * POST /api/employees/invite
 * Send invitation email to a new employee
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
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Email is required' },
        { status: 400 }
      )
    }

    if (!body.organization_id || !body.department_id || !body.position_title) {
      return NextResponse.json(
        { error: 'Invalid request body. organization_id, department_id, and position_title are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Verify organization and department exist
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', body.organization_id)
      .single() as any

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('id', body.department_id)
      .eq('organization_id', body.organization_id)
      .single() as any

    if (deptError || !department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Generate employee_id if not provided
    const employeeId = body.employee_id || `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create invitation record with metadata
    const invitationData = {
      email: body.email.toLowerCase(),
      organization_id: body.organization_id,
      department_id: body.department_id,
      employee_id: employeeId,
      position_title: body.position_title,
      employment_type: body.employment_type || 'full_time',
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      manager_id: body.manager_id || null,
      location: body.location || null,
      phone: body.phone || null,
      mobile_phone: body.mobile_phone || null,
      invited_by: user.id,
      invited_at: new Date().toISOString(),
      status: 'pending'
    }

    // Store invitation (you may need to create an 'employee_invitations' table)
    const { data: invitation, error: inviteError } = await supabase
      .from('employee_invitations')
      .insert(invitationData)
      .select()
      .single()

    if (inviteError) {
      // If table doesn't exist, fall back to sending invitation directly
      console.warn('employee_invitations table not found, sending direct invitation:', inviteError)

      // Use Supabase Auth to send invitation (requires admin client)
      const adminClient = createAdminClient()
      const { data: authData, error: authInviteError } = await adminClient.auth.admin.inviteUserByEmail(
        body.email.toLowerCase(),
        {
          data: {
            organization_id: body.organization_id,
            department_id: body.department_id,
            employee_id: employeeId,
            position_title: body.position_title,
            invited_by: user.id
          },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
        }
      ) as any

      if (authInviteError) {
        console.error('Error sending invitation:', authInviteError)
        return NextResponse.json(
          { error: authInviteError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Invitation sent successfully',
        data: {
          email: body.email.toLowerCase(),
          employee_id: employeeId,
          invited_at: new Date().toISOString()
        }
      }, { status: 201 })
    }

    // Send invitation email via Supabase Auth (requires admin client)
    const adminClient = createAdminClient()
    const { error: emailError } = await adminClient.auth.admin.inviteUserByEmail(
      body.email.toLowerCase(),
      {
        data: {
          organization_id: body.organization_id,
          organization_name: organization.name,
          department_id: body.department_id,
          department_name: department.name,
          employee_id: employeeId,
          position_title: body.position_title,
          invitation_id: invitation.id
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?invitation_id=${invitation.id}`
      }
    )

    if (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      message: 'Invitation sent successfully',
      data: invitation
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/employees/invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/employees/invite?invitation_id={id}
 * Get invitation details
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get invitation ID from query params
    const url = new URL(request.url)
    const invitationId = url.searchParams.get('invitation_id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Fetch invitation
    const { data: invitation, error } = await supabase
      .from('employee_invitations')
      .select(`
        *,
        organization:organizations(id, name),
        department:departments(id, name)
      `)
      .eq('id', invitationId)
      .single() as any

    if (error) {
      console.error('Error fetching invitation:', error)
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is still valid
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 400 }
      )
    }

    if (invitation.status === 'expired') {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: invitation })
  } catch (error) {
    console.error('Error in GET /api/employees/invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/employees/invite?invitation_id={id}
 * Accept or reject an invitation
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

    // Get invitation ID from query params
    const url = new URL(request.url)
    const invitationId = url.searchParams.get('invitation_id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action } = body // 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      )
    }

    // Fetch invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('employee_invitations')
      .select('*')
      .eq('id', invitationId)
      .single() as any

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is no longer valid' },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Create employee record
      const { data: employee, error: employeeError } = await supabase
      .from('employees')
        .insert({
          id: user.id,
          organization_id: invitation.organization_id,
          department_id: invitation.department_id,
          employee_id: invitation.employee_id,
          position_title: invitation.position_title,
          employment_type: invitation.employment_type,
          employment_status: 'active',
          start_date: invitation.start_date,
          manager_id: invitation.manager_id,
          location: invitation.location,
          phone: invitation.phone,
          mobile_phone: invitation.mobile_phone
        })
        .select()
        .single()

      if (employeeError) {
        console.error('Error creating employee:', employeeError)
        return NextResponse.json(
          { error: employeeError.message },
          { status: 500 }
        )
      }

      // Update invitation status
      await supabase
        .from('employee_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitationId) as any

      return NextResponse.json({
        message: 'Invitation accepted successfully',
        data: employee
      })
    } else {
      // Reject invitation
      await supabase
        .from('employee_invitations')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', invitationId) as any

      return NextResponse.json({
        message: 'Invitation rejected'
      })
    }
  } catch (error) {
    console.error('Error in PATCH /api/employees/invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
