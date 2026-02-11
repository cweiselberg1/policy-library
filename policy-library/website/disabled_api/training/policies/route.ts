import { NextResponse } from 'next/server';
import * as policyIndexModule from '@/policy-index.json';

const policyIndex = policyIndexModule as unknown as {
  policies: Array<{
    id: string;
    title: string;
    category: string;
    hipaa_reference: string;
    description: string;
    required: boolean;
  }>;
};

export async function GET() {
  try {
    // Filter policies to remove duplicates and take first 20 for demo
    const uniquePolicies = policyIndex.policies
      .filter((policy, index, self) =>
        index === self.findIndex((p) => p.id === policy.id)
      )
      .slice(0, 20)
      .map(policy => ({
        id: policy.id,
        title: policy.title,
        category: policy.category,
        hipaa_reference: policy.hipaa_reference,
        description: policy.description,
        required: policy.required
      }));

    return NextResponse.json({
      policies: uniquePolicies,
      acknowledged: [] // Empty - no user tracking without Supabase
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}
