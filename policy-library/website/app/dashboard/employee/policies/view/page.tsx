'use client';

import dynamic from 'next/dynamic';

const PolicyViewContent = dynamic(() => import('@/components/employee/PolicyViewContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-400">Loading policy details...</p>
      </div>
    </div>
  ),
});

export default function PolicyViewPage() {
  return <PolicyViewContent />;
}
