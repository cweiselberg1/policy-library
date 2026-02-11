import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// POST /api/incidents/anonymous - Create anonymous incident report
// This endpoint uses service role to bypass RLS
export async function POST(request: Request) {
  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.severity) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, severity' },
        { status: 400 }
      );
    }

    // Get the default organization (or you could require org_id in request)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create anonymous incident
    const { data: incident, error } = await supabase
      .from('incidents')
      .insert({
        organization_id: org.id,
        reported_by: null, // Anonymous - no user ID
        reporter_name: body.reporter_name || 'Anonymous',
        reporter_email: body.reporter_email || null,
        is_anonymous: true,
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
      .select()
      .single();

    if (error) {
      console.error('Error creating anonymous incident:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return success with incident ID (but not all details for privacy)
    return NextResponse.json(
      {
        message: 'Incident reported successfully',
        incident_id: incident.id,
        reference_number: incident.id.substring(0, 8).toUpperCase()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
