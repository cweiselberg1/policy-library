import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch assignments for the user
    const { data: assignments, error: assignmentsError } = await supabase
      .from('employee_policy_assignments')
      .select(`
        id,
        policy_bundle_id,
        status,
        assigned_at,
        due_at,
        completed_at,
        is_overdue,
        policy_bundles (
          name,
          description,
          policy_ids
        )
      `)
      .eq('user_id', user.id)
      .order('due_at', { ascending: true }) as any;

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      );
    }

    // Transform the data
    const transformedAssignments = (assignments || []).map((assignment: any) => ({
      id: assignment.id,
      policy_bundle_id: assignment.policy_bundle_id,
      bundle_name: assignment.policy_bundles?.name || 'Untitled Bundle',
      status: assignment.status,
      assigned_at: assignment.assigned_at,
      due_at: assignment.due_at,
      completed_at: assignment.completed_at,
      policy_count: assignment.policy_bundles?.policy_ids?.length || 0,
      is_overdue: assignment.is_overdue,
    }));

    // Calculate stats
    const stats = {
      total_assigned: transformedAssignments.length,
      completed: transformedAssignments.filter(a => a.status === 'completed').length,
      pending: transformedAssignments.filter(
        a => a.status === 'assigned' || a.status === 'acknowledged'
      ).length,
      overdue: transformedAssignments.filter(a => a.is_overdue && a.status !== 'completed').length,
      completion_rate: transformedAssignments.length > 0
        ? transformedAssignments.filter(a => a.status === 'completed').length / transformedAssignments.length
        : 0,
    };

    return NextResponse.json({
      assignments: transformedAssignments,
      stats,
    });
  } catch (error) {
    console.error('Unexpected error in assignments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
