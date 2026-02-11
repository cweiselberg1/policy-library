import { Metadata } from 'next';
import PhysicalAuditClient from '@/components/PhysicalAuditClient';
import { PageViewTracker } from '@/components/PageViewTracker';

export const metadata: Metadata = {
  title: 'Physical Safeguards Audit | HIPAA Policy Library',
  description: 'Interactive HIPAA Physical Safeguards audit tool. Assess compliance with 45 CFR §164.310 requirements for facility access, workstation use, and device controls.',
  keywords: ['HIPAA', 'physical safeguards', 'audit', 'compliance', 'facility access', 'workstation security', '164.310'],
  openGraph: {
    title: 'HIPAA Physical Safeguards Audit Tool',
    description: 'Assess your organization\'s compliance with HIPAA physical safeguard requirements',
    type: 'website',
  },
};

export default function PhysicalAuditPage() {
  return (
    <>
      <PageViewTracker pageName="Physical Audit" />
      <PhysicalAuditClient />
    </>
  );
}
