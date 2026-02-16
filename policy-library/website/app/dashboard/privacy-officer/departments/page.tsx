'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import DepartmentTree from '@/components/departments/DepartmentTree';
import CreateDepartmentModal from '@/components/departments/CreateDepartmentModal';
import type { DepartmentNode } from '@/types/employee-management';
import { orgStorage } from '@/lib/supabase/org-storage';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = () => {
    try {
      const saved = JSON.parse(orgStorage.getItem('hipaa-departments') || '[]');
      setDepartments(saved);
    } catch {
      setDepartments([]);
    }
  };

  const handleDepartmentCreated = () => {
    setShowCreateModal(false);
    loadDepartments();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/privacy-officer"
                className="p-2 text-dark-400 hover:text-copper-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                  Department Management
                </h1>
                <p className="mt-2 text-dark-400">Organize your hierarchical structure</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-copper-500/20 transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Create Department
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {departments.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-copper-500/10 mb-6">
              <PlusIcon className="h-12 w-12 text-copper-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Departments Yet</h3>
            <p className="text-dark-400 mb-8 max-w-md mx-auto">
              Create your first department to start organizing your organization structure.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-copper-500/20 transition-all"
            >
              Create First Department
            </button>
          </div>
        ) : (
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Organization Hierarchy</h2>
              <p className="text-dark-400">
                {departments.length} {departments.length === 1 ? 'department' : 'departments'}
              </p>
            </div>

            <DepartmentTree
              departments={departments}
              onDepartmentUpdated={loadDepartments}
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
