import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/incidents - List all incidents for the user's organization
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('incidents')
      .select(`
        *,
        reported_by_profile:profiles!incidents_reported_by_fkey(id, full_name, email),
        assigned_to_profile:profiles!incidents_assigned_to_fkey(id, full_name, email),
        resolved_by_profile:profiles!incidents_resolved_by_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: incidents, error } = await query;

    if (error) {
      console.error('Error fetching incidents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create a new incident
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile and organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.severity) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, severity' },
        { status: 400 }
      );
    }

    // Create incident
    const { data: incident, error } = await supabase
      .from('incidents')
      .insert({
        organization_id: profile.organization_id,
        reported_by: user.id,
        title: body.title,
        description: body.description,
        category: body.category,
        severity: body.severity,
        status: 'open',
        location: body.location,
        affected_systems: body.affected_systems,
        affected_individuals_count: body.affected_individuals_count,
        incident_date: body.incident_date || new Date().toISOString()
      })
      .select(`
        *,
        reported_by_profile:profiles!incidents_reported_by_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
