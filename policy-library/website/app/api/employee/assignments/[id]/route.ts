import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPolicyById } from '@/lib/policies';
import { markdownToHtml } from '@/lib/policies';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bundleId = id;

    // Fetch the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('employee_policy_assignments')
      .select(`
        id,
        policy_bundle_id,
        status,
        assigned_at,
        due_at,
        completed_at,
        acknowledged_at,
        is_overdue,
        policy_bundles (
          name,
          description,
          policy_ids
        )
      `)
      .eq('user_id', user.id)
      .eq('policy_bundle_id', bundleId)
      .single() as any as any;

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Get policy details from the policy index
    const policyIds = assignment.policy_bundles?.policy_ids || [];
    const policies = [];

    for (const policyId of policyIds) {
      // Try to get as covered entity first, then business associate
      let policy = getPolicyById(policyId, 'covered_entity');
      if (!policy) {
        policy = getPolicyById(policyId, 'business_associate');
      }

      if (policy) {
        // Get policy content
        const contentPath = policy.file_path;
        const fs = require('fs');
        const path = require('path');
        const matter = require('gray-matter');

        try {
          const fullPath = path.join(process.cwd(), contentPath);
          const fileContent = fs.readFileSync(fullPath, 'utf-8');
          const { content } = matter(fileContent);
          const htmlContent = await markdownToHtml(content);

          policies.push({
            id: policy.id,
            title: policy.title,
            category: policy.category,
            content: htmlContent,
            version: policy.version,
            last_updated: policy.last_updated,
          });
        } catch (error) {
          console.error(`Error reading policy ${policyId}:`, error);
          // Continue with other policies
        }
      }
    }

    // Transform the response
    const assignmentData = assignment as any;
    const response = {
      id: assignmentData.id,
      policy_bundle_id: assignmentData.policy_bundle_id,
      bundle_name: assignmentData.policy_bundles?.name || 'Untitled Bundle',
      bundle_description: assignmentData.policy_bundles?.description || '',
      status: assignmentData.status,
      assigned_at: assignmentData.assigned_at,
      due_at: assignmentData.due_at,
      completed_at: assignmentData.completed_at,
      acknowledged_at: assignmentData.acknowledged_at,
      is_overdue: assignmentData.is_overdue,
      policies,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in assignment detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
