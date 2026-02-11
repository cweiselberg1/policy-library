import { getAllPolicies } from '@/lib/policies';
import { PolicyListingClient } from '@/components/PolicyListingClient';
import { PageViewTracker } from '@/components/PageViewTracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Covered Entity Policies | HIPAA Policy Library',
  description: 'Comprehensive HIPAA compliance policies for covered entities including Privacy Rule, Security Rule, and Breach Notification requirements.',
};

export default function CoveredEntitiesPage() {
  const policies = getAllPolicies('covered_entity');

  return (
    <>
      <PageViewTracker
        pageName="Covered Entity Policies"
        properties={{ entity_type: 'covered_entity', policy_count: policies.length }}
      />
      <PolicyListingClient
        policies={policies}
        entityType="covered_entity"
        title="Covered Entity Policies"
        description="Comprehensive HIPAA compliance policies for healthcare providers, health plans, and healthcare clearinghouses."
      />
    </>
  );
}
