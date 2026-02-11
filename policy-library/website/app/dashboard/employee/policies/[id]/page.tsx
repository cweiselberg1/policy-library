'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import PolicyViewer from '@/components/attestation/PolicyViewer';
import AttestationForm from '@/components/attestation/AttestationForm';

interface PolicyDetail {
  id: string;
  title: string;
  category: string;
  content: string;
  version: string;
  last_updated: string;
}

interface AssignmentDetail {
  id: string;
  policy_bundle_id: string;
  bundle_name: string;
  bundle_description: string;
  status: 'assigned' | 'acknowledged' | 'completed' | 'overdue' | 'waived';
  assigned_at: string;
  due_at: string;
  completed_at: string | null;
  is_overdue: boolean;
  policies: PolicyDetail[];
}

export default function PolicyBundleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bundleId = params.id as string;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [currentPolicyIndex, setCurrentPolicyIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bundleId) {
      fetchAssignmentDetails();
    }
  }, [bundleId]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`/api/employee/assignments/${bundleId}`);

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.status === 404) {
        setError('Policy bundle not found');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch policy details');
      }

      const data = await response.json();
      setAssignment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policy details');
    } finally {
      setLoading(false);
    }
  };

  const handleAttestationComplete = async () => {
    // Refresh assignment data to get updated status
    await fetchAssignmentDetails();

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      router.push('/dashboard/employee');
    }, 2000);
  };

  const handlePreviousPolicy = () => {
    if (currentPolicyIndex > 0) {
      setCurrentPolicyIndex(currentPolicyIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPolicy = () => {
    if (assignment && currentPolicyIndex < assignment.policies.length - 1) {
      setCurrentPolicyIndex(currentPolicyIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading policy...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error || 'Policy not found'}</p>
          <Link
            href="/dashboard/employee/policies"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Policies
          </Link>
        </div>
      </div>
    );
  }

  const currentPolicy = assignment.policies[currentPolicyIndex];
  const isCompleted = assignment.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/employee/policies"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Policies
            </Link>

            {assignment.policies.length > 1 && (
              <div className="text-sm font-medium text-slate-600">
                Policy {currentPolicyIndex + 1} of {assignment.policies.length}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Bundle Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {assignment.bundle_name}
          </h1>
          {assignment.bundle_description && (
            <p className="text-lg text-slate-600 mb-4">
              {assignment.bundle_description}
            </p>
          )}

          {/* Status Bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {isCompleted ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
                <CheckCircleIcon className="h-5 w-5" />
                Completed on {new Date(assignment.completed_at!).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            ) : (
              <>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  assignment.is_overdue
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <ClockIcon className="h-5 w-5" />
                  Due {new Date(assignment.due_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                {assignment.is_overdue && (
                  <span className="text-red-600 font-medium">
                    Please complete as soon as possible
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Policy Content */}
        {currentPolicy && (
          <PolicyViewer policy={currentPolicy} />
        )}

        {/* Navigation between policies */}
        {assignment.policies.length > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4 p-6 bg-white rounded-xl border border-slate-200">
            <button
              onClick={handlePreviousPolicy}
              disabled={currentPolicyIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentPolicyIndex === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              ← Previous Policy
            </button>

            <div className="text-sm text-slate-600">
              {currentPolicyIndex + 1} of {assignment.policies.length}
            </div>

            <button
              onClick={handleNextPolicy}
              disabled={currentPolicyIndex === assignment.policies.length - 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentPolicyIndex === assignment.policies.length - 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Next Policy →
            </button>
          </div>
        )}

        {/* Attestation Form */}
        {!isCompleted && (
          <div className="mt-8">
            <AttestationForm
              assignmentId={assignment.id}
              bundleName={assignment.bundle_name}
              onComplete={handleAttestationComplete}
            />
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="mt-8 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">
              Policy Bundle Completed
            </h3>
            <p className="text-emerald-800 mb-6">
              You completed this policy bundle on {new Date(assignment.completed_at!).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <Link
              href="/dashboard/employee"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
