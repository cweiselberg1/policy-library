import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { OrganizationInsert, OrganizationUpdate } from '@/types/employee-management'

/**
 * GET /api/organizations
 * List all organizations for the authenticated user
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

    // Fetch organizations (RLS will filter based on user permissions)
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name') as any

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: organizations })
  } catch (error) {
    console.error('Error in GET /api/organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations
 * Create a new organization
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
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Name is required and must be a string' },
        { status: 400 }
      )
    }

    // Prepare organization data
    const organizationData: OrganizationInsert = {
      name: body.name.trim(),
      slug: body.slug || null,
      subscription_tier: body.subscription_tier || 'free',
      status: body.status || 'active',
      logo_url: body.logo_url || null,
      website: body.website || null,
      address: body.address || null,
      contact_email: body.contact_email || null,
      phone: body.phone || null,
      metadata: body.metadata || null
    }

    // Create organization
    const { data: organization, error } = await supabase
      .from('organizations')
      .insert(organizationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating organization:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/organizations?id={id}
 * Update an existing organization
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

    // Get organization ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: OrganizationUpdate = {
      updated_at: new Date().toISOString()
    }

    // Only include fields that are provided
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.subscription_tier !== undefined) updateData.subscription_tier = body.subscription_tier
    if (body.status !== undefined) updateData.status = body.status
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url
    if (body.website !== undefined) updateData.website = body.website
    if (body.address !== undefined) updateData.address = body.address
    if (body.contact_email !== undefined) updateData.contact_email = body.contact_email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    // Update organization (RLS will check permissions)
    const { data: organization, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating organization:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error in PATCH /api/organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organizations?id={id}
 * Delete an organization (soft delete by setting status to 'cancelled')
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

    // Get organization ID from query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Soft delete by setting status to 'cancelled'
    const { data: organization, error } = await supabase
      .from('organizations')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting organization:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
