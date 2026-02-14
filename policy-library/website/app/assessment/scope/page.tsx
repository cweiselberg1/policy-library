import { Metadata } from 'next';
import EngagementScopeBuilder from '@/components/EngagementScopeBuilder';

export const metadata: Metadata = {
  title: 'Engagement Scope Builder | One Guy Consulting',
  description: 'Create professional security assessment scope documents, authorization letters, and rules of engagement for penetration testing engagements.',
  keywords: [
    'engagement scope',
    'penetration testing scope',
    'authorization letter',
    'rules of engagement',
    'security assessment',
    'VAPT scope',
  ],
};

export default function EngagementScopePage() {
  return <EngagementScopeBuilder />;
}
