import { Metadata } from 'next';
import ITRiskAssessmentClient from '@/components/ITRiskAssessmentClient';
import { PageViewTracker } from '@/components/PageViewTracker';

export const metadata: Metadata = {
  title: 'Security Risk Assessment | HIPAA Policy Library',
  description: 'Comprehensive IT security risk assessment covering technical controls, network security, application security, endpoint protection, data security, incident response, third-party risk, user security, and compliance governance.',
  keywords: [
    'IT risk assessment',
    'security risk',
    'HIPAA compliance',
    'risk management',
    'NIST framework',
    'technical controls',
    'network security',
    'data security',
    'incident response',
    'compliance audit',
  ],
  openGraph: {
    title: 'Security Risk Assessment',
    description: 'Comprehensive security risk assessment for healthcare organizations',
    type: 'website',
  },
};

export default function ITRiskAssessmentPage() {
  return (
    <>
      <PageViewTracker pageName="IT Risk Assessment" />
      <ITRiskAssessmentClient />
    </>
  );
}
