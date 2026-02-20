'use client';

import dynamic from 'next/dynamic';

const ReportIncidentContent = dynamic(() => import('@/components/employee/ReportIncidentContent'), {
  ssr: false,
});

export default function PrivacyOfficerReportIncidentPage() {
  return <ReportIncidentContent />;
}
