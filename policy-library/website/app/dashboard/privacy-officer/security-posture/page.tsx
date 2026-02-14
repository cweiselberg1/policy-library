import { Metadata } from 'next';
import SecurityPostureDashboard from '@/components/SecurityPostureDashboard';

export const metadata: Metadata = {
  title: 'Security Posture | One Guy Consulting',
  description: 'Unified security posture dashboard combining SRA compliance, IT risk assessment, and vulnerability scan results into a single score.',
  keywords: [
    'security posture',
    'compliance dashboard',
    'risk score',
    'HIPAA compliance',
    'vulnerability management',
    'security metrics',
  ],
};

export default function SecurityPosturePage() {
  return <SecurityPostureDashboard />;
}
