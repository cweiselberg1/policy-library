'use client';

import { useState, useMemo } from 'react';
import { CheckCircleIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface ProgressData {
  policies_completed: number;
  hipaa_101: boolean;
  cybersecurity: boolean;
}

interface TrainingDashboardProps {
  progress: ProgressData;
  onStartTraining?: () => void;
  onResumeTraining?: () => void;
}

export function TrainingDashboard({
  progress,
  onStartTraining,
  onResumeTraining,
}: TrainingDashboardProps) {
  const TOTAL_POLICIES = 39;

  // Calculate overall progress percentage
  const progressPercentage = useMemo(() => {
    let completed = 0;
    let total = 3; // 3 sections: policies, HIPAA, cybersecurity

    // Policies: count as 1/3 of the training if all 39 are complete
    const policiesRatio = progress.policies_completed / TOTAL_POLICIES;
    completed += policiesRatio;

    // HIPAA 101
    if (progress.hipaa_101) completed += 1;

    // Cybersecurity
    if (progress.cybersecurity) completed += 1;

    return Math.round((completed / total) * 100);
  }, [progress]);

  const isFullyComplete =
    progress.policies_completed === TOTAL_POLICIES &&
    progress.hipaa_101 &&
    progress.cybersecurity;

  const hasStarted =
    progress.policies_completed > 0 ||
    progress.hipaa_101 ||
    progress.cybersecurity;

  const completionDate = isFullyComplete ? new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-12 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl">
              <AcademicCapIcon className="h-9 w-9 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Training Dashboard</h1>
              <p className="text-lg text-slate-700">
                {isFullyComplete
                  ? 'All training modules completed!'
                  : 'Complete your required compliance training'}
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 p-8 shadow-lg">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-900">Overall Progress</h2>
                <span className="text-3xl font-bold text-blue-600">{progressPercentage}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            {completionDate && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-4">
                <CheckCircleIconSolid className="h-5 w-5 text-emerald-600" />
                <span>Completed on {completionDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Training Sections */}
        <div className="grid gap-6 mb-8">
          {/* Policies Section */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-xl font-bold text-blue-600">📋</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Policy Acknowledgments</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Review and acknowledge all required company policies
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-blue-600">
                    {progress.policies_completed}/{TOTAL_POLICIES} completed
                  </span>
                  <div className="h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300"
                      style={{ width: `${(progress.policies_completed / TOTAL_POLICIES) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HIPAA 101 Section */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
                <span className="text-xl font-bold text-purple-600">🏥</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900">HIPAA 101 Training</h3>
                  {progress.hipaa_101 && (
                    <CheckCircleIconSolid className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Essential HIPAA compliance and healthcare data protection standards
                </p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${progress.hipaa_101 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                  <span className={`text-sm font-medium ${progress.hipaa_101 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {progress.hipaa_101 ? 'Completed' : 'Not started'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cybersecurity Section */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100">
                <span className="text-xl font-bold text-orange-600">🔒</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900">Cybersecurity Essentials</h3>
                  {progress.cybersecurity && (
                    <CheckCircleIconSolid className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Data security, password management, and threat prevention
                </p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${progress.cybersecurity ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                  <span className={`text-sm font-medium ${progress.cybersecurity ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {progress.cybersecurity ? 'Completed' : 'Not started'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!isFullyComplete && (
            <>
              {hasStarted && onResumeTraining ? (
                <button
                  onClick={onResumeTraining}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Resume Training
                </button>
              ) : onStartTraining ? (
                <button
                  onClick={onStartTraining}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Start Training
                </button>
              ) : null}
            </>
          )}

          {isFullyComplete && (
            <div className="flex-1 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircleIconSolid className="h-6 w-6 text-emerald-600" />
                <p className="text-lg font-semibold text-emerald-900">
                  All training completed!
                </p>
              </div>
              <p className="text-sm text-emerald-800">
                You have successfully completed all required training modules.
              </p>
            </div>
          )}
        </div>

        {/* Info Message */}
        {!isFullyComplete && (
          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <ClockIcon className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-900">
                Complete all required training sections to maintain compliance. Your progress is automatically saved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
