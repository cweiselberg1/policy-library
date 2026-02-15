'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ClockIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import PolicyChecklistItem from '@/components/training/PolicyChecklistItem';
import ProgressIndicator from '@/components/training/ProgressIndicator';

interface Policy {
  id: string;
  title: string;
  category: string;
  description: string;
  required: boolean;
}

export default function PolicyReviewPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPoliciesAndProgress();
  }, []);

  const loadPoliciesAndProgress = async () => {
    try {
      // Load policies from static JSON file
      const response = await fetch('/policy-index.json');
      if (!response.ok) {
        throw new Error('Failed to load policies');
      }

      const data = await response.json();
      const allPolicies = (data.policies || []).map((policy: any) => ({
        id: policy.id,
        title: policy.title,
        category: policy.category,
        description: policy.description || 'No description available',
        required: true, // Mark all as required for training
      }));

      setPolicies(allPolicies);

      // Load acknowledged policies from localStorage
      const saved = localStorage.getItem('hipaa-training-progress');
      if (saved) {
        const progress = JSON.parse(saved);
        setAcknowledgedPolicies(new Set(progress.policies_completed || []));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (policyId: string) => {
    setAcknowledgedPolicies((prev) => {
      const updated = new Set(prev);
      if (updated.has(policyId)) {
        updated.delete(policyId);
      } else {
        updated.add(policyId);
      }
      return updated;
    });
  };

  const handleSaveAndExit = () => {
    setSaving(true);
    setError('');

    try {
      // Save progress to localStorage without marking module complete
      const progressData = {
        policies_completed: Array.from(acknowledgedPolicies),
        modules_completed: [],
        current_step: 'policies',
        percentage: 0,
      };

      localStorage.setItem('hipaa-training-progress', JSON.stringify(progressData));
      router.push('/training');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    setSaving(true);
    setError('');

    try {
      // Save progress to localStorage and mark module complete
      const progressData = {
        policies_completed: Array.from(acknowledgedPolicies),
        modules_completed: ['policies'],
        current_step: 'hipaa-101',
        percentage: 33,
      };

      localStorage.setItem('hipaa-training-progress', JSON.stringify(progressData));
      router.push('/training/hipaa-101');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const requiredPolicies = policies.filter((p) => p.required);
  const allRequiredAcknowledged = requiredPolicies.every((p) =>
    acknowledgedPolicies.has(p.id)
  );

  const trainingSteps = [
    { id: 'policies', title: 'Policy Review', completed: false },
    { id: 'hipaa-101', title: 'HIPAA 101', completed: false },
    { id: 'cybersecurity', title: 'Cybersecurity Awareness', completed: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-evergreen-50/30 to-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-evergreen-700 mx-auto"></div>
          <p className="mt-4 text-[--text-muted]">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-evergreen-50/30 to-sand-50">
      {/* Header */}
      <header className="bg-white border-b border-pearl-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-evergreen-700 to-evergreen-600 shadow-lg">
                <BookOpenIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>Policy Review</h1>
                <p className="mt-1 text-[--text-muted]">Review and acknowledge all required policies</p>
              </div>
            </div>
            <Link
              href="/training"
              className="text-sm text-copper-600 hover:text-copper-700 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div>
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-pearl-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[--text-secondary]">Progress</span>
                <span className="text-sm font-medium text-[--text-secondary]">
                  {acknowledgedPolicies.size} / {requiredPolicies.length} Required
                </span>
              </div>
              <div className="h-2 bg-pearl-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-copper-600 to-copper-500 transition-all duration-300"
                  style={{
                    width: `${(acknowledgedPolicies.size / requiredPolicies.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Policies List */}
            <div className="space-y-4 mb-8">
              {policies.map((policy, index) => (
                <PolicyChecklistItem
                  key={policy.id}
                  policy={policy}
                  index={index}
                  isCompleted={acknowledgedPolicies.has(policy.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-6 bg-white rounded-2xl border-2 border-pearl-200 p-6 shadow-2xl">
              {!allRequiredAcknowledged && (
                <div className="mb-6 rounded-lg border-l-4 border-amber-600 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                      !
                    </div>
                    <p className="text-sm text-amber-900 font-medium">
                      Please acknowledge all {requiredPolicies.length} required policies to continue to HIPAA 101
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={handleSaveAndExit}
                  disabled={saving}
                  className="px-8 py-4 border-2 border-pearl-300 text-evergreen-950 font-semibold rounded-lg hover:bg-pearl-50 hover:border-evergreen-300 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Exit
                </button>

                <button
                  onClick={handleContinue}
                  disabled={!allRequiredAcknowledged || saving}
                  className="relative flex-1 sm:flex-[2] flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-black rounded-lg shadow-[8px_8px_0px_0px_rgba(168,90,40,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(168,90,40,0.4)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 uppercase tracking-wider text-base overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                  {saving ? (
                    <>
                      <ClockIcon className="h-6 w-6 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Continue to HIPAA 101</span>
                      <ArrowRightIcon className="h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <ProgressIndicator steps={trainingSteps} currentStepId="policies" />
          </aside>
        </div>
      </main>
    </div>
  );
}
