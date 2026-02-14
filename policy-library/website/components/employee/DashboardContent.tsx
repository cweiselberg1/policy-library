'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/components/auth/AuthProvider';
import { getEmployeeAssignments, computeDashboardStats, type EmployeeAssignment } from '@/lib/supabase/employee';
import ProgressSummary from '@/components/employee/ProgressSummary';
import CompletedPolicies from '@/components/employee/CompletedPolicies';

interface DisplayAssignment {
  id: string;
  policy_bundle_id: string;
  bundle_name: string;
  status: 'assigned' | 'acknowledged' | 'completed' | 'overdue' | 'waived';
  assigned_at: string;
  due_at: string;
  completed_at: string | null;
  policy_count: number;
  is_overdue: boolean;
}

function toDisplayAssignment(a: EmployeeAssignment): DisplayAssignment {
  return {
    id: a.id,
    policy_bundle_id: a.policy_bundle_id,
    bundle_name: a.policy_bundles?.name || 'Untitled Bundle',
    status: a.status,
    assigned_at: a.assigned_at,
    due_at: a.due_at,
    completed_at: a.completed_at,
    policy_count: a.policy_bundles?.policy_ids?.length || 0,
    is_overdue: a.is_overdue,
  };
}

export default function DashboardContent() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [assignments, setAssignments] = useState<DisplayAssignment[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof computeDashboardStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [authLoading, isAuthenticated, user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const { data, error: fetchError } = await getEmployeeAssignments(user.id);

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch assignments');
      }

      const raw = data || [];
      const display = raw.map(toDisplayAssignment);
      setAssignments(display);
      setStats(computeDashboardStats(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const pendingAssignments = assignments.filter(
    a => a.status === 'assigned' || a.status === 'acknowledged'
  );
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const overdueAssignments = assignments.filter(a => a.is_overdue && a.status !== 'completed');

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading your policies...</p>
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
            onClick={fetchDashboardData}
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
        <h1 className="text-3xl font-bold text-white">Policy Dashboard</h1>
        <p className="mt-1 text-slate-400">Review and acknowledge your assigned policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Content */}
        <div>
          {/* Overdue Alerts */}
          {overdueAssignments.length > 0 && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-300 mb-2">
                    {overdueAssignments.length} Overdue {overdueAssignments.length === 1 ? 'Policy' : 'Policies'}
                  </h3>
                  <p className="text-sm text-red-400/80 mb-4">
                    Please review and acknowledge these policies as soon as possible to maintain compliance.
                  </p>
                  <Link
                    href="/dashboard/employee/policies?filter=overdue"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Overdue Policies
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Pending Policies */}
          {pendingAssignments.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Pending Acknowledgments</h2>
              <div className="space-y-4">
                {pendingAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/dashboard/employee/policies/view?id=${assignment.policy_bundle_id}`}
                    className="block bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                        <DocumentTextIcon className="h-7 w-7 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {assignment.bundle_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <DocumentTextIcon className="h-4 w-4" />
                            <span>{assignment.policy_count} {assignment.policy_count === 1 ? 'policy' : 'policies'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>
                              Due {new Date(assignment.due_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {assignment.is_overdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium">
                              <ExclamationTriangleIcon className="h-3 w-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-blue-400">Review →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/dashboard/employee/policies"
                className="mt-6 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
              >
                View All Policies →
              </Link>
            </div>
          ) : (
            <div className="mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
              <CheckCircleIconSolid className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">
                All Caught Up!
              </h3>
              <p className="text-emerald-400/80">
                You have no pending policy acknowledgments at this time.
              </p>
            </div>
          )}

          {/* Completed Policies */}
          {completedAssignments.length > 0 && (
            <CompletedPolicies assignments={completedAssignments.filter((a): a is DisplayAssignment & { completed_at: string } => a.completed_at !== null)} />
          )}
        </div>

        {/* Sidebar */}
        <aside>
          {stats && <ProgressSummary stats={stats} />}

          {/* Help Card */}
          <div className="mt-6 bg-slate-800/50 backdrop-blur-xl rounded-lg border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-sm text-slate-400 mb-4">
              If you have questions about these policies or need assistance, contact your Privacy Officer or compliance team.
            </p>
            <a
              href="mailto:compliance@example.com"
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              Contact Support →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
