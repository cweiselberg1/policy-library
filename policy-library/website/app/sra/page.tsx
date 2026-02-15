import { Metadata } from 'next';
import SRAClient from '@/components/SRAClient';
import { PageViewTracker } from '@/components/PageViewTracker';

export const metadata: Metadata = {
  title: 'Security Risk Assessment (SRA) | HIPAA Policy Library',
  description: 'Comprehensive HIPAA Security Risk Assessment with 72 questions covering safeguards, business associates, access controls, encryption, breach response, and more. Get real-time compliance scoring and remediation guidance.',
  keywords: [
    'security risk assessment',
    'SRA',
    'HIPAA compliance',
    'risk assessment',
    'healthcare security',
    'ePHI protection',
    'business associates',
    'access controls',
    'encryption',
    'breach response',
    'physical security',
    'employee training',
  ],
  openGraph: {
    title: 'HIPAA Security Risk Assessment (SRA)',
    description: 'Comprehensive 72-question security risk assessment for healthcare organizations with compliance scoring and remediation guidance.',
    type: 'website',
  },
};

export default function SRAPage() {
  return (
    <>
      <PageViewTracker pageName="Security Risk Assessment" />
      <SRAClient />
    </>
  );
}
