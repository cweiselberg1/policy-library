'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';
import { getAssignmentByBundleId, type EmployeeAssignment } from '@/lib/supabase/employee';
import AttestationForm from '@/components/attestation/AttestationForm';

interface PolicyDetailClientProps {
  bundleId: string;
}

export default function PolicyDetailClient({ bundleId }: PolicyDetailClientProps) {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [assignment, setAssignment] = useState<EmployeeAssignment | null>(null);
  const [policyNames, setPolicyNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchAssignment();
  }, [authLoading, isAuthenticated, user, bundleId]);

  const fetchAssignment = async () => {
    if (!user || !bundleId) return;
    try {
      const { data, error: fetchError } = await getAssignmentByBundleId(user.id, bundleId);

      if (fetchError) {
        throw new Error(fetchError.message || 'Assignment not found');
      }

      setAssignment(data);

      if (data?.policy_bundles?.policy_ids) {
        const names = data.policy_bundles.policy_ids.map(pid =>
          pid.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        );
        setPolicyNames(names);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleAttestationComplete = () => {
    router.push('/dashboard/employee');
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-8 max-w-md text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Assignment not found'}</p>
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

  const bundleName = assignment.policy_bundles?.name || 'Untitled Bundle';
  const bundleDescription = assignment.policy_bundles?.description || '';
  const isCompleted = assignment.status === 'completed';

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li>
            <Link href="/dashboard/employee" className="hover:text-slate-200 transition-colors">
              Dashboard
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/dashboard/employee/policies" className="hover:text-slate-200 transition-colors">
              My Policies
            </Link>
          </li>
          <li>/</li>
          <li className="text-white">{bundleName}</li>
        </ol>
      </nav>

      {/* Bundle Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl ${
            isCompleted ? 'bg-emerald-500/10' : assignment.is_overdue ? 'bg-red-500/10' : 'bg-blue-500/10'
          }`}>
            {isCompleted ? (
              <CheckCircleIcon className="h-9 w-9 text-emerald-400" />
            ) : assignment.is_overdue ? (
              <ExclamationTriangleIcon className="h-9 w-9 text-red-400" />
            ) : (
              <DocumentTextIcon className="h-9 w-9 text-blue-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-white">{bundleName}</h1>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
                  <CheckCircleIcon className="h-4 w-4" />
                  Completed
                </span>
              ) : assignment.is_overdue ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  Overdue
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium">
                  <ClockIcon className="h-4 w-4" />
                  Pending
                </span>
              )}
            </div>
            {bundleDescription && (
              <p className="text-slate-400 mb-4">{bundleDescription}</p>
            )}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4" />
                <span>{policyNames.length} {policyNames.length === 1 ? 'policy' : 'policies'}</span>
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
        </div>
      </div>

      {/* Policies in this Bundle */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Policies in this Bundle</h2>
        <div className="space-y-3">
          {policyNames.map((name, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 flex items-start gap-4"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-slate-300">
                {index + 1}
              </div>
              <div>
                <h3 className="text-white font-medium">{name}</h3>
              </div>
            </div>
          ))}
          {policyNames.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center">
              <p className="text-slate-400">No individual policies listed in this bundle.</p>
            </div>
          )}
        </div>
      </div>

      {/* Attestation Form (only if not completed) */}
      {!isCompleted && (
        <AttestationForm
          assignmentId={assignment.id}
          bundleName={bundleName}
          onComplete={handleAttestationComplete}
        />
      )}

      {/* Already completed message */}
      {isCompleted && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-300 mb-1">
            Policy Acknowledged
          </h3>
          <p className="text-sm text-emerald-400/80">
            You completed this policy acknowledgment on{' '}
            {assignment.completed_at
              ? new Date(assignment.completed_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'a previous date'}
            .
          </p>
        </div>
      )}
    </div>
  );
}
