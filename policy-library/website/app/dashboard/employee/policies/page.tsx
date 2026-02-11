'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface PolicyAssignment {
  id: string;
  policy_bundle_id: string;
  bundle_name: string;
  bundle_description: string;
  status: 'assigned' | 'acknowledged' | 'completed' | 'overdue' | 'waived';
  assigned_at: string;
  due_at: string;
  completed_at: string | null;
  policy_count: number;
  is_overdue: boolean;
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';

function EmployeePoliciesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') as FilterType || 'all';

  const [assignments, setAssignments] = useState<PolicyAssignment[]>([]);
  const [filter, setFilter] = useState<FilterType>(filterParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/employee/assignments');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    switch (filter) {
      case 'pending':
        return assignment.status === 'assigned' || assignment.status === 'acknowledged';
      case 'completed':
        return assignment.status === 'completed';
      case 'overdue':
        return assignment.is_overdue && assignment.status !== 'completed';
      default:
        return true;
    }
  });

  const getStatusBadge = (assignment: PolicyAssignment) => {
    if (assignment.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
          <CheckCircleIcon className="h-4 w-4" />
          Completed
        </span>
      );
    }
    if (assignment.is_overdue) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
        <ClockIcon className="h-4 w-4" />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAssignments}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Policies</h1>
              <p className="mt-1 text-slate-600">All assigned policy bundles</p>
            </div>
            <Link
              href="/dashboard/employee"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <FunnelIcon className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filter Policies</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pending ({assignments.filter(a => a.status === 'assigned' || a.status === 'acknowledged').length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'overdue'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Overdue ({assignments.filter(a => a.is_overdue && a.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Completed ({assignments.filter(a => a.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Policy List */}
        {filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/dashboard/employee/policies/${assignment.policy_bundle_id}`}
                  className="block p-6"
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${
                      assignment.status === 'completed'
                        ? 'bg-emerald-100'
                        : assignment.is_overdue
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}>
                      {assignment.status === 'completed' ? (
                        <CheckCircleIconSolid className="h-8 w-8 text-emerald-600" />
                      ) : assignment.is_overdue ? (
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                      ) : (
                        <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {assignment.bundle_name}
                          </h3>
                          {assignment.bundle_description && (
                            <p className="text-sm text-slate-600 mb-3">
                              {assignment.bundle_description}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(assignment)}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>{assignment.policy_count} {assignment.policy_count === 1 ? 'policy' : 'policies'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            Assigned {new Date(assignment.assigned_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            Due {new Date(assignment.due_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        {assignment.completed_at && (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>
                              Completed {new Date(assignment.completed_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">View →</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No policies found
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all'
                ? 'You have no assigned policies at this time.'
                : `You have no ${filter} policies.`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Policies
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function EmployeePoliciesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading policies...</p>
        </div>
      </div>
    }>
      <EmployeePoliciesContent />
    </Suspense>
  );
}
