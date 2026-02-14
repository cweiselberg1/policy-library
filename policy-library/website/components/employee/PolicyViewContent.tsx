'use client';

import { useSearchParams } from 'next/navigation';
import PolicyDetailClient from '@/components/employee/PolicyDetailClient';
import Link from 'next/link';

export default function PolicyViewContent() {
  const searchParams = useSearchParams();
  const bundleId = searchParams.get('id') || '';

  if (!bundleId) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">No policy bundle specified.</p>
          <Link
            href="/dashboard/employee/policies"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Policies
          </Link>
        </div>
      </div>
    );
  }

  return <PolicyDetailClient bundleId={bundleId} />;
}
