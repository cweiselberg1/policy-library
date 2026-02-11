'use client';

import { useState } from 'react';
import { CheckCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface TrainingModuleProps {
  title: string;
  description: string;
  content: React.ReactNode;
  moduleNumber: number;
  totalModules: number;
  onComplete: () => void;
  onBack?: () => void;
  iconColor?: 'blue' | 'purple' | 'orange' | 'emerald';
}

const colorSchemes = {
  blue: {
    gradient: 'from-blue-600 to-cyan-600',
    light: 'from-blue-50/50 to-cyan-50/30',
    border: 'border-blue-200 hover:border-blue-300',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    shadow: 'shadow-blue-600/10 hover:shadow-blue-600/20',
  },
  purple: {
    gradient: 'from-purple-600 to-violet-600',
    light: 'from-purple-50/50 to-violet-50/30',
    border: 'border-purple-200 hover:border-purple-300',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    shadow: 'shadow-purple-600/10 hover:shadow-purple-600/20',
  },
  orange: {
    gradient: 'from-orange-600 to-red-600',
    light: 'from-orange-50/50 to-red-50/30',
    border: 'border-orange-200 hover:border-orange-300',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    shadow: 'shadow-orange-600/10 hover:shadow-orange-600/20',
  },
  emerald: {
    gradient: 'from-emerald-600 to-teal-600',
    light: 'from-emerald-50/50 to-teal-50/30',
    border: 'border-emerald-200 hover:border-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    shadow: 'shadow-emerald-600/10 hover:shadow-emerald-600/20',
  },
};

export function TrainingModule({
  title,
  description,
  content,
  moduleNumber,
  totalModules,
  onComplete,
  onBack,
  iconColor = 'blue',
}: TrainingModuleProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const colors = colorSchemes[iconColor];

  const handleComplete = () => {
    if (isCompleted) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-600">
            <span>Training Module</span>
            <span className="text-slate-400">/</span>
            <span className={colors.text}>
              {moduleNumber} of {totalModules}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-xl`}>
              <AcademicCapIcon className="h-9 w-9 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">{title}</h1>
              <p className="text-lg text-slate-700">{description}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 flex gap-2">
            {Array.from({ length: totalModules }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  index < moduleNumber - 1
                    ? `bg-gradient-to-r ${colors.gradient}`
                    : index === moduleNumber - 1
                    ? isCompleted
                      ? `bg-gradient-to-r ${colors.gradient}`
                      : 'bg-slate-300'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-br ${colors.light} p-8 md:p-12 shadow-xl ${colors.shadow} mb-8`}>
          <div className="prose prose-slate max-w-none">
            {content}
          </div>
        </div>

        {/* Completion Section */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6">
            <label className="flex cursor-pointer items-start gap-4 group">
              <button
                onClick={() => setIsCompleted(!isCompleted)}
                className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                type="button"
              >
                {isCompleted ? (
                  <CheckCircleIconSolid className={`h-8 w-8 ${colors.text}`} />
                ) : (
                  <div className="h-8 w-8 rounded-full border-3 border-slate-300 transition-colors group-hover:border-slate-400" />
                )}
              </button>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-900">
                  I have completed this training module
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  By checking this box, you confirm that you have read and understood all content in this module.
                </p>
              </div>
            </label>
          </div>

          {!isCompleted && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                  !
                </div>
                <p className="text-sm text-amber-900">
                  Please confirm you've completed this module before continuing.
                </p>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex gap-3">
                <CheckCircleIconSolid className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-900">
                  Module completed! You may now proceed to the next section.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleComplete}
              disabled={!isCompleted}
              className={`flex-1 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all ${
                isCompleted
                  ? `bg-gradient-to-r ${colors.gradient} hover:shadow-xl hover:scale-[1.02]`
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Continue to Next Module
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
