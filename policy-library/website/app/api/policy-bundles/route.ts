import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/policy-bundles?organization_id={id}
 * List policy bundles for an organization
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

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Fetch policy bundles (RLS will filter based on user permissions)
    // policy_ids is stored as a TEXT[] array directly on policy_bundles
    const { data: bundles, error } = await supabase
      .from('policy_bundles')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name') as any

    if (error) {
      console.error('Error fetching policy bundles:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: bundles })
  } catch (error) {
    console.error('Error in GET /api/policy-bundles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/policy-bundles
 * Create a new policy bundle
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
    if (!body.organization_id || !body.name) {
      return NextResponse.json(
        { error: 'Invalid request body. organization_id and name are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.policy_ids) || body.policy_ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body. At least one policy_id is required' },
        { status: 400 }
      )
    }

    // Prepare bundle data with policy_ids stored directly as TEXT[]
    const slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const bundleData = {
      organization_id: body.organization_id,
      name: body.name.trim(),
      slug,
      description: body.description || null,
      policy_ids: body.policy_ids,
      is_required: body.is_required !== undefined ? body.is_required : true,
      target_roles: body.target_roles || ['employee'],
      target_departments: body.target_departments || null,
      due_days: body.due_days || 30
    }

    // Create policy bundle (policy_ids stored as array, no join table needed)
    const { data: bundle, error: bundleError } = await supabase
      .from('policy_bundles')
      .insert(bundleData)
      .select()
      .single()

    if (bundleError) {
      console.error('Error creating policy bundle:', bundleError)
      return NextResponse.json(
        { error: bundleError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/policy-bundles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/policy-bundles?id={id}
 * Update an existing policy bundle
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

    // Get bundle ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Bundle ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Only include fields that are provided
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.is_required !== undefined) updateData.is_required = body.is_required
    if (body.target_roles !== undefined) updateData.target_roles = body.target_roles
    if (body.target_departments !== undefined) updateData.target_departments = body.target_departments
    if (body.due_days !== undefined) updateData.due_days = body.due_days
    // policy_ids stored directly as TEXT[] on the table
    if (body.policy_ids !== undefined) updateData.policy_ids = body.policy_ids

    // Update bundle (RLS will check permissions)
    const { data: bundle, error } = await supabase
      .from('policy_bundles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating policy bundle:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!bundle) {
      return NextResponse.json(
        { error: 'Policy bundle not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(bundle)
  } catch (error) {
    console.error('Error in PATCH /api/policy-bundles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/policy-bundles?id={id}
 * Delete a policy bundle
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

    // Get bundle ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Bundle ID is required' },
        { status: 400 }
      )
    }

    // Check if bundle is assigned to any employees
    const { data: assignments, error: assignError } = await supabase
      .from('employee_policy_assignments')
      .select('id')
      .eq('policy_bundle_id', id)
      .limit(1)

    if (assignError) {
      console.error('Error checking bundle assignments:', assignError)
      return NextResponse.json(
        { error: assignError.message },
        { status: 500 }
      )
    }

    if (assignments && assignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bundle that is assigned to employees or departments' },
        { status: 400 }
      )
    }

    // Delete bundle (no join table needed; policy_ids is an array column)
    const { error } = await supabase
      .from('policy_bundles')
      .delete()
      .eq('id', id) as any

    if (error) {
      console.error('Error deleting policy bundle:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Policy bundle deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/policy-bundles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
