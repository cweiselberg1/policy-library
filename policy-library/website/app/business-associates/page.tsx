import { getAllPolicies } from '@/lib/policies';
import { PolicyListingClient } from '@/components/PolicyListingClient';
import { PageViewTracker } from '@/components/PageViewTracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Associate Policies | HIPAA Policy Library',
  description: 'HIPAA compliance policies for business associates who handle PHI on behalf of covered entities.',
};

export default function BusinessAssociatesPage() {
  const policies = getAllPolicies('business_associate');

  return (
    <>
      <PageViewTracker
        pageName="Business Associate Policies"
        properties={{ entity_type: 'business_associate', policy_count: policies.length }}
      />
      <PolicyListingClient
        policies={policies}
        entityType="business_associate"
        title="Business Associate Policies"
        description="Focused HIPAA compliance policies for vendors, contractors, and service providers handling PHI."
      />
    </>
  );
}
