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
    <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg border border-dark-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Your Progress</h3>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-dark-300">Overall Completion</span>
          <span className="text-2xl font-bold text-copper-400">{progressPercentage}%</span>
        </div>
        <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-copper-600 to-evergreen-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {/* Total Assigned */}
        <div className="flex items-center justify-between py-3 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-700">
              <span className="text-lg font-bold text-dark-300">{stats.total_assigned}</span>
            </div>
            <span className="text-sm font-medium text-dark-300">Total Assigned</span>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center justify-between py-3 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-dark-300">Completed</span>
          </div>
          <span className="text-lg font-bold text-emerald-400">{stats.completed}</span>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between py-3 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <ClockIcon className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-dark-300">Pending</span>
          </div>
          <span className="text-lg font-bold text-amber-400">{stats.pending}</span>
        </div>

        {/* Overdue */}
        {stats.overdue > 0 && (
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <span className="text-sm font-medium text-dark-300">Overdue</span>
            </div>
            <span className="text-lg font-bold text-red-400">{stats.overdue}</span>
          </div>
        )}
      </div>

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">All policies completed!</span>
          </div>
        </div>
      )}

      {/* Encouragement */}
      {progressPercentage > 0 && progressPercentage < 100 && (
        <div className="mt-6 bg-copper-500/10 border border-copper-500/20 rounded-lg p-4">
          <p className="text-sm text-copper-300">
            <strong>Keep going!</strong> You&apos;re {progressPercentage}% of the way there.
          </p>
        </div>
      )}
    </div>
  );
}
