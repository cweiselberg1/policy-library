import { Metadata } from 'next';
import DataDeviceAuditClient from '@/components/DataDeviceAuditClient';
import { PageViewTracker } from '@/components/PageViewTracker';

export const metadata: Metadata = {
  title: 'Data Device Audit | HIPAA Policy Library',
  description: 'Track and assess security controls for all devices accessing ePHI. Inventory management with compliance scoring, risk assessment, and automated reporting.',
  keywords: ['device audit', 'ePHI devices', 'device security', 'HIPAA compliance', 'device inventory', 'mobile device management', 'endpoint security', 'device controls'],
  openGraph: {
    title: 'Data Device Audit Tool',
    description: 'Track security controls and compliance for all devices accessing electronic Protected Health Information',
    type: 'website',
  },
};

export default function DataDeviceAuditPage() {
  return (
    <>
      <PageViewTracker pageName="Data Device Audit" />
      <DataDeviceAuditClient />
    </>
  );
}
