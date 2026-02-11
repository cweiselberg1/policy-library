'use client';

import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStepId: string;
}

export default function ProgressIndicator({ steps, currentStepId }: ProgressIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Training Progress</h3>

      <div className="space-y-1">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isPast = index < currentIndex;
          const isCompleted = step.completed;

          return (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-10 w-0.5 h-8 transition-colors ${
                    isCompleted || isPast ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Step Item */}
              <div className="flex items-center gap-4 relative z-10">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted || isPast
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-blue-500 ring-4 ring-blue-100'
                      : 'bg-slate-200'
                  }`}
                >
                  {isCompleted || isPast ? (
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 py-2">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'text-slate-900'
                        : isCompleted || isPast
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      In Progress
                    </p>
                  )}
                  {(isCompleted || isPast) && (
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                      Completed
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall</span>
          <span className="text-sm font-bold text-blue-600">
            {steps.filter((s) => s.completed).length} / {steps.length}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-500"
            style={{
              width: `${(steps.filter((s) => s.completed).length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
