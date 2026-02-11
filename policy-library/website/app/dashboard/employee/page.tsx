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
import ProgressSummary from '@/components/employee/ProgressSummary';
import CompletedPolicies from '@/components/employee/CompletedPolicies';

interface Assignment {
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

interface DashboardStats {
  total_assigned: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_rate: number;
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
      setStats(data.stats);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your policies...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Policy Dashboard</h1>
              <p className="mt-1 text-slate-600">Review and acknowledge your assigned policies</p>
            </div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div>
            {/* Overdue Alerts */}
            {overdueAssignments.length > 0 && (
              <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      {overdueAssignments.length} Overdue {overdueAssignments.length === 1 ? 'Policy' : 'Policies'}
                    </h3>
                    <p className="text-sm text-red-800 mb-4">
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
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Pending Acknowledgments</h2>
                <div className="space-y-4">
                  {pendingAssignments.map((assignment) => (
                    <Link
                      key={assignment.id}
                      href={`/dashboard/employee/policies/${assignment.policy_bundle_id}`}
                      className="block bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <DocumentTextIcon className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {assignment.bundle_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
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
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Overdue
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-blue-600">Review →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/dashboard/employee/policies"
                  className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Policies →
                </Link>
              </div>
            ) : (
              <div className="mb-8 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8 text-center">
                <CheckCircleIconSolid className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-emerald-800">
                  You have no pending policy acknowledgments at this time.
                </p>
              </div>
            )}

            {/* Completed Policies */}
            {completedAssignments.length > 0 && (
              <CompletedPolicies assignments={completedAssignments.filter((a): a is Assignment & { completed_at: string } => a.completed_at !== null)} />
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {stats && <ProgressSummary stats={stats} />}

            {/* Help Card */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-4">
                If you have questions about these policies or need assistance, contact your Privacy Officer or compliance team.
              </p>
              <a
                href="mailto:compliance@example.com"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Support →
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
