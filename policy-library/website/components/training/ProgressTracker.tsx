'use client';

import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  steps: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

export default function ProgressTracker({ currentStep, totalSteps, percentage, steps }: ProgressTrackerProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Your Progress</h3>
        <span className="text-2xl font-bold text-blue-600">{Math.round(percentage)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircleIcon className="h-6 w-6 text-emerald-500 flex-shrink-0" />
            ) : index + 1 === currentStep ? (
              <ClockIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-slate-300 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                step.completed
                  ? 'text-slate-600 line-through'
                  : index + 1 === currentStep
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
