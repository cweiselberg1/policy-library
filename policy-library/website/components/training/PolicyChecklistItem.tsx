'use client';

import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Policy {
  id: string;
  title: string;
  category: string;
  description: string;
  required: boolean;
}

interface PolicyChecklistItemProps {
  policy: Policy;
  index: number;
  isCompleted: boolean;
  onToggle: (policyId: string) => void;
}

export default function PolicyChecklistItem({
  policy,
  index,
  isCompleted,
  onToggle,
}: PolicyChecklistItemProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 bg-white p-6 transition-all duration-200 ${
        isCompleted
          ? 'border-emerald-300 shadow-lg shadow-emerald-600/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(policy.id)}
          className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
          aria-label={`Mark ${policy.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
        >
          {isCompleted ? (
            <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
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
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                  {policy.category}
                </span>
                <Link
                  href={`/policies/${policy.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  View Full Policy
                </Link>
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
}
