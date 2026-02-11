'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { Policy } from '@/lib/policies';

interface PolicyChecklistProps {
  policies: Policy[];
  onComplete: () => void;
  onSaveAndExit: (completedPolicies: string[]) => void;
  initialCompleted?: string[];
}

export function PolicyChecklist({
  policies,
  onComplete,
  onSaveAndExit,
  initialCompleted = []
}: PolicyChecklistProps) {
  const [completedPolicies, setCompletedPolicies] = useState<Set<string>>(
    new Set(initialCompleted)
  );
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);
  const totalPolicies = policies.length;
  const completedCount = completedPolicies.size;
  const progress = (completedCount / totalPolicies) * 100;

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setShowScrollPrompt(!scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePolicy = (policyId: string) => {
    const newCompleted = new Set(completedPolicies);
    if (newCompleted.has(policyId)) {
      newCompleted.delete(policyId);
    } else {
      newCompleted.add(policyId);
    }
    setCompletedPolicies(newCompleted);
  };

  const allComplete = completedCount === totalPolicies;

  const handleContinue = () => {
    if (allComplete) {
      onComplete();
    }
  };

  const handleSave = () => {
    onSaveAndExit(Array.from(completedPolicies));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
                <BookOpenIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Policy Review</h1>
                <p className="text-sm text-slate-600">Acknowledge all required policies</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-600">{completedCount}/{totalPolicies}</p>
              <p className="text-xs text-slate-600">Policies</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-500 ease-out shadow-lg shadow-emerald-600/30"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm font-medium text-slate-700">
            {allComplete ? (
              <span className="text-emerald-600">All policies reviewed!</span>
            ) : (
              <span>{totalPolicies - completedCount} remaining</span>
            )}
          </p>
        </div>
      </div>

      {/* Policy List */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-4">
          {policies.map((policy, index) => {
            const isCompleted = completedPolicies.has(policy.id);
            return (
              <div
                key={policy.id}
                className={`group relative overflow-hidden rounded-xl border-2 bg-white p-6 transition-all duration-200 ${
                  isCompleted
                    ? 'border-emerald-300 shadow-lg shadow-emerald-600/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => togglePolicy(policy.id)}
                    className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                    aria-label={`Mark ${policy.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                  >
                    {isCompleted ? (
                      <CheckCircleIconSolid className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <div className="h-8 w-8 rounded-full border-3 border-slate-300 transition-colors group-hover:border-slate-400" />
                    )}
                  </button>

                  {/* Policy Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                          {policy.required && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                              Required
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{policy.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{policy.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                            {policy.category}
                          </span>
                          <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                            {policy.hipaa_reference}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completion Overlay */}
                {isCompleted && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-600/5 to-teal-600/5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons - Fixed at bottom when scrolled */}
        <div className="sticky bottom-0 mt-12 rounded-2xl border-2 border-slate-200 bg-white/95 backdrop-blur-sm p-8 shadow-2xl">
          {!allComplete && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                  !
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Review All Policies</p>
                  <p className="text-sm text-amber-800">
                    You must acknowledge all {totalPolicies} policies before continuing to the next module.
                  </p>
                </div>
              </div>
            </div>
          )}

          {allComplete && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex gap-3">
                <CheckCircleIconSolid className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">All Policies Reviewed</p>
                  <p className="text-sm text-emerald-800">
                    Great job! You've acknowledged all required policies.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
            >
              Save & Exit
            </button>
            <button
              onClick={handleContinue}
              disabled={!allComplete}
              className={`flex-1 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all ${
                allComplete
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/40 hover:scale-[1.02]'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Continue to Next Module
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollPrompt && completedCount < totalPolicies && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Scroll to review all policies ↓
          </div>
        </div>
      )}
    </div>
  );
}
