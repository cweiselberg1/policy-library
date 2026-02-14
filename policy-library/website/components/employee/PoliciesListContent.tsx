'use client';

import { useEffect, useState } from 'react';
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
import { useAuth } from '@/components/auth/AuthProvider';
import { getEmployeeAssignments, type EmployeeAssignment } from '@/lib/supabase/employee';

interface DisplayAssignment {
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

function toDisplayAssignment(a: EmployeeAssignment): DisplayAssignment {
  return {
    id: a.id,
    policy_bundle_id: a.policy_bundle_id,
    bundle_name: a.policy_bundles?.name || 'Untitled Bundle',
    bundle_description: a.policy_bundles?.description || '',
    status: a.status,
    assigned_at: a.assigned_at,
    due_at: a.due_at,
    completed_at: a.completed_at,
    policy_count: a.policy_bundles?.policy_ids?.length || 0,
    is_overdue: a.is_overdue,
  };
}

export default function PoliciesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') as FilterType || 'all';
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [assignments, setAssignments] = useState<DisplayAssignment[]>([]);
  const [filter, setFilter] = useState<FilterType>(filterParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchAssignments();
  }, [authLoading, isAuthenticated, user]);

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      const { data, error: fetchError } = await getEmployeeAssignments(user.id);

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch assignments');
      }

      setAssignments((data || []).map(toDisplayAssignment));
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

  const getStatusBadge = (assignment: DisplayAssignment) => {
    if (assignment.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
          <CheckCircleIcon className="h-4 w-4" />
          Completed
        </span>
      );
    }
    if (assignment.is_overdue) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium">
        <ClockIcon className="h-4 w-4" />
        Pending
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-8 max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
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
    <div className="p-6 lg:p-10">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">My Policies</h1>
        <p className="mt-1 text-slate-400">All assigned policy bundles</p>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FunnelIcon className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-white">Filter Policies</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Pending ({assignments.filter(a => a.status === 'assigned' || a.status === 'acknowledged').length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'overdue'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Overdue ({assignments.filter(a => a.is_overdue && a.status !== 'completed').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 hover:border-blue-500/30 hover:shadow-lg transition-all"
            >
              <Link
                href={`/dashboard/employee/policies/view?id=${assignment.policy_bundle_id}`}
                className="block p-6"
              >
                <div className="flex items-start gap-6">
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${
                    assignment.status === 'completed'
                      ? 'bg-emerald-500/10'
                      : assignment.is_overdue
                      ? 'bg-red-500/10'
                      : 'bg-blue-500/10'
                  }`}>
                    {assignment.status === 'completed' ? (
                      <CheckCircleIconSolid className="h-8 w-8 text-emerald-400" />
                    ) : assignment.is_overdue ? (
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                    ) : (
                      <DocumentTextIcon className="h-8 w-8 text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {assignment.bundle_name}
                        </h3>
                        {assignment.bundle_description && (
                          <p className="text-sm text-slate-400 mb-3">
                            {assignment.bundle_description}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(assignment)}
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
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
                        <div className="flex items-center gap-2 text-emerald-400">
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

                  <div className="flex items-center">
                    <span className="text-blue-400 font-medium">View →</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No policies found
          </h3>
          <p className="text-slate-400 mb-6">
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
    </div>
  );
}
