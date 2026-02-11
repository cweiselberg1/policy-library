'use client';

import { useState } from 'react';
import {
  DocumentTextIcon,
  UserGroupIcon,
  CalendarIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface PolicyBundle {
  id: string;
  name: string;
  description: string | null;
  policy_ids: string[];
  assigned_count: number;
  created_at: string;
}

interface BundleListProps {
  bundles: PolicyBundle[];
  onBundleUpdated: () => void;
}

export default function BundleList({ bundles, onBundleUpdated }: BundleListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (bundleId: string, bundleName: string) => {
    if (!confirm(`Are you sure you want to delete "${bundleName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/policy-bundles/${bundleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bundle');
      }

      onBundleUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete bundle');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {bundles.map((bundle) => (
        <div
          key={bundle.id}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all"
        >
          {/* Header */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                  <DocumentTextIcon className="h-6 w-6 text-emerald-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                  {bundle.description && (
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      {bundle.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">
                        {bundle.policy_ids.length} {bundle.policy_ids.length === 1 ? 'policy' : 'policies'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">
                        {bundle.assigned_count} {bundle.assigned_count === 1 ? 'assignment' : 'assignments'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">
                        Created {formatDate(bundle.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === bundle.id ? null : bundle.id)}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {expandedId === bundle.id ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(bundle.id, bundle.name)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedId === bundle.id && (
            <div className="border-t border-slate-700/50 bg-slate-900/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Policy List */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Included Policies
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {bundle.policy_ids.length > 0 ? (
                      bundle.policy_ids.map((policyId, idx) => (
                        <div
                          key={policyId}
                          className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-slate-300 font-mono">{policyId}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No policies in this bundle</p>
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Assignments
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">Total Assignments</p>
                      <p className="text-2xl font-bold text-white">{bundle.assigned_count}</p>
                    </div>

                    <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
                      Assign to Employees/Departments
                    </button>

                    <button className="w-full px-4 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all">
                      View Assignment Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
