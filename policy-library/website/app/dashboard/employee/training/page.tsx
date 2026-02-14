'use client';

import dynamic from 'next/dynamic';

const TrainingHubContent = dynamic(
  () => import('@/components/employee/TrainingHubContent'),
  { ssr: false }
);

export default function TrainingPage() {
  return <TrainingHubContent />;
}
