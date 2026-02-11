import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/incidents/[id] - Get a specific incident
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: incident, error } = await supabase
      .from('incidents')
      .select(`
        *,
        reported_by_profile:profiles!incidents_reported_by_fkey(id, full_name, email),
        assigned_to_profile:profiles!incidents_assigned_to_fkey(id, full_name, email),
        resolved_by_profile:profiles!incidents_resolved_by_fkey(id, full_name, email),
        comments:incident_comments(
          *,
          user:profiles(id, full_name, email)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/incidents/[id] - Update an incident
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Only privacy officers can update incidents
    if (profile.role !== 'privacy_officer') {
      return NextResponse.json(
        { error: 'Forbidden: Only Privacy Officers can update incidents' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build update object
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.severity !== undefined) updates.severity = body.severity;
    if (body.status !== undefined) {
      updates.status = body.status;

      // If resolving, add resolution metadata
      if (body.status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user.id;
        if (body.resolution_notes) {
          updates.resolution_notes = body.resolution_notes;
        }
      }
    }
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to;
    if (body.location !== undefined) updates.location = body.location;
    if (body.affected_systems !== undefined) updates.affected_systems = body.affected_systems;
    if (body.affected_individuals_count !== undefined) {
      updates.affected_individuals_count = body.affected_individuals_count;
    }

    // Update incident
    const { data: incident, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', params.id)
      .select(`
        *,
        reported_by_profile:profiles!incidents_reported_by_fkey(id, full_name, email),
        assigned_to_profile:profiles!incidents_assigned_to_fkey(id, full_name, email),
        resolved_by_profile:profiles!incidents_resolved_by_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/incidents/[id] - Delete an incident
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Only privacy officers can delete incidents
    if (profile.role !== 'privacy_officer') {
      return NextResponse.json(
        { error: 'Forbidden: Only Privacy Officers can delete incidents' },
        { status: 403 }
      );
    }

    // Delete incident
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
