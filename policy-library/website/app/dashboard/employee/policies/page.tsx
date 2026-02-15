'use client';

import dynamic from 'next/dynamic';

const PoliciesListContent = dynamic(() => import('@/components/employee/PoliciesListContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper-500 mx-auto"></div>
        <p className="mt-4 text-dark-400">Loading policies...</p>
      </div>
    </div>
  ),
});

export default function EmployeePoliciesPage() {
  return <PoliciesListContent />;
}
