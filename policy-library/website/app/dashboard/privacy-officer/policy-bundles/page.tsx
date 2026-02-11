'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import CreateBundleModal from '@/components/policy-bundles/CreateBundleModal';
import BundleList from '@/components/policy-bundles/BundleList';

interface PolicyBundle {
  id: string;
  name: string;
  description: string | null;
  policy_ids: string[];
  assigned_count: number;
  created_at: string;
}

export default function PolicyBundlesPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<PolicyBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await fetch('/api/policy-bundles');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch policy bundles');
      }

      const data = await response.json();
      setBundles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleBundleCreated = () => {
    setShowCreateModal(false);
    fetchBundles();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Loading policy bundles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/privacy-officer"
                className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Policy Bundles
                </h1>
                <p className="mt-2 text-slate-400">Create and assign policy collections</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Create Bundle
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Info Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">What are Policy Bundles?</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Policy bundles are curated collections of HIPAA policies that you can assign to departments or employees.
            Create bundles for different roles (e.g., "Clinical Staff", "IT Department", "Management") to streamline compliance training.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">Total Bundles</p>
            <p className="text-4xl font-bold text-white">{bundles.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">Total Policies</p>
            <p className="text-4xl font-bold text-white">
              {bundles.reduce((sum, b) => sum + b.policy_ids.length, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">Assignments</p>
            <p className="text-4xl font-bold text-white">
              {bundles.reduce((sum, b) => sum + b.assigned_count, 0)}
            </p>
          </div>
        </div>

        {/* Bundle List */}
        {error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={fetchBundles}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : bundles.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-emerald-500/10 mb-6">
              <PlusIcon className="h-12 w-12 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Policy Bundles Yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Create your first policy bundle to start organizing compliance requirements by role or department.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all"
            >
              Create First Bundle
            </button>
          </div>
        ) : (
          <BundleList bundles={bundles} onBundleUpdated={fetchBundles} />
        )}
      </main>

      {showCreateModal && (
        <CreateBundleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleBundleCreated}
        />
      )}
    </div>
  );
}
