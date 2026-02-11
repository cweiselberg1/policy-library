import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { assignment_id, signature, agreed_at } = body;

    if (!assignment_id || !signature || !agreed_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the assignment belongs to this user
    const { data: assignment, error: fetchError } = await supabase
      .from('employee_policy_assignments')
      .select('id, user_id, status')
      .eq('id', assignment_id)
      .eq('user_id', user.id)
      .single() as any as any;

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if already completed
    if (assignment.status === 'completed') {
      return NextResponse.json(
        { error: 'Assignment already completed' },
        { status: 400 }
      );
    }

    // Update the assignment to completed
    const { data: updated, error: updateError } = await supabase
      .from('employee_policy_assignments')
      .update({
        status: 'completed',
        completed_at: agreed_at,
        acknowledged_at: agreed_at,
        completion_percentage: 100,
        notes: `Electronic signature: ${signature}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignment_id)
      .select()
      .single() as any;

    if (updateError) {
      console.error('Error updating assignment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update assignment' },
        { status: 500 }
      );
    }

    // Log the attestation in audit trail (if audit_log table exists)
    try {
      await supabase.from('audit_log').insert({
        event_type: 'policy_attestation',
        user_id: user.id,
        details: {
          assignment_id,
          signature,
          agreed_at,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        },
      });
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.error('Audit log error:', auditError);
    }

    return NextResponse.json({
      success: true,
      assignment: updated,
    });
  } catch (error) {
    console.error('Unexpected error in attestation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
