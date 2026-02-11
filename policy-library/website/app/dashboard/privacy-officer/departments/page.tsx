'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import DepartmentTree from '@/components/departments/DepartmentTree';
import CreateDepartmentModal from '@/components/departments/CreateDepartmentModal';
import type { DepartmentNode } from '@/types/employee-management';

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentCreated = () => {
    setShowCreateModal(false);
    fetchDepartments();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Loading departments...</p>
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
                className="p-2 text-slate-400 hover:text-violet-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Department Management
                </h1>
                <p className="mt-2 text-slate-400">Organize your hierarchical structure</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-violet-500/20 transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Create Department
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={fetchDepartments}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : departments.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-violet-500/10 mb-6">
              <PlusIcon className="h-12 w-12 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Departments Yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Create your first department to start organizing your organization structure.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-violet-500/20 transition-all"
            >
              Create First Department
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Organization Hierarchy</h2>
              <p className="text-slate-400">
                {departments.length} {departments.length === 1 ? 'department' : 'departments'}
              </p>
            </div>

            <DepartmentTree
              departments={departments}
              onDepartmentUpdated={fetchDepartments}
            />
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateDepartmentModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleDepartmentCreated}
          departments={departments}
        />
      )}
    </div>
  );
}
