'use client';

import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  total_assigned: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_rate: number;
}

interface ProgressSummaryProps {
  stats: DashboardStats;
}

export default function ProgressSummary({ stats }: ProgressSummaryProps) {
  const progressPercentage = Math.round(stats.completion_rate * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Your Progress</h3>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall Completion</span>
          <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {/* Total Assigned */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <span className="text-lg font-bold text-slate-700">{stats.total_assigned}</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Total Assigned</span>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Completed</span>
          </div>
          <span className="text-lg font-bold text-emerald-600">{stats.completed}</span>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <ClockIcon className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Pending</span>
          </div>
          <span className="text-lg font-bold text-amber-600">{stats.pending}</span>
        </div>

        {/* Overdue */}
        {stats.overdue > 0 && (
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Overdue</span>
            </div>
            <span className="text-lg font-bold text-red-600">{stats.overdue}</span>
          </div>
        )}
      </div>

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold">All policies completed!</span>
          </div>
        </div>
      )}

      {/* Encouragement */}
      {progressPercentage > 0 && progressPercentage < 100 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Keep going!</strong> You're {progressPercentage}% of the way there.
          </p>
        </div>
      )}
    </div>
  );
}
