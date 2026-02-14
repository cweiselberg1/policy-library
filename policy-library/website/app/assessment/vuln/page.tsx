import { Metadata } from 'next';
import VulnAssessmentClient from '@/components/VulnAssessmentClient';

export const metadata: Metadata = {
  title: 'Vulnerability Assessment | One Guy Consulting',
  description: 'Import and analyze vulnerability scan results from Nmap, Nuclei, OWASP ZAP, Nikto, Lynis, Trivy, and OpenVAS. Generate professional assessment reports.',
  keywords: [
    'vulnerability assessment',
    'penetration testing',
    'VAPT',
    'nmap',
    'nuclei',
    'OWASP ZAP',
    'security scanning',
    'vulnerability report',
  ],
};

export default function VulnAssessmentPage() {
  return <VulnAssessmentClient />;
}
