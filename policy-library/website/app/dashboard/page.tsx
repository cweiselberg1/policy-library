'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/privacy-officer');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-copper-500 border-t-transparent mx-auto"></div>
        <p className="mt-6 text-dark-300 text-lg">Loading dashboard...</p>
      </div>
    </div>
  );
}
