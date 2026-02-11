import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/incidents/[id]/comments - Add comment to incident
export async function POST(
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

    const body = await request.json();

    // Validate required fields
    if (!body.comment_text) {
      return NextResponse.json(
        { error: 'Missing required field: comment_text' },
        { status: 400 }
      );
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('incident_comments')
      .insert({
        incident_id: params.id,
        user_id: user.id,
        comment_text: body.comment_text,
        is_internal: body.is_internal || false
      })
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
