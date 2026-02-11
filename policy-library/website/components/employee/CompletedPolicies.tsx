'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import CertificateDownload from '@/components/certificates/CertificateDownload';

interface CompletedAssignment {
  id: string;
  policy_bundle_id: string;
  bundle_name: string;
  status: string;
  completed_at: string;
  policy_count: number;
}

interface CompletedPoliciesProps {
  assignments: CompletedAssignment[];
}

export default function CompletedPolicies({ assignments }: CompletedPoliciesProps) {
  const [expanded, setExpanded] = useState(false);

  const displayCount = expanded ? assignments.length : Math.min(3, assignments.length);
  const hasMore = assignments.length > 3;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Completed Policies</h2>

      <div className="space-y-4">
        {assignments.slice(0, displayCount).map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {assignment.bundle_name}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                  <div className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>{assignment.policy_count} {assignment.policy_count === 1 ? 'policy' : 'policies'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">
                      Completed {new Date(assignment.completed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/dashboard/employee/policies/${assignment.policy_bundle_id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Policy
                  </Link>
                  <span className="text-slate-300">•</span>
                  <CertificateDownload assignmentId={assignment.id} bundleName={assignment.bundle_name} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-6 w-full py-3 border-2 border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          {expanded ? 'Show Less' : `Show All ${assignments.length} Completed Policies`}
        </button>
      )}
    </div>
  );
}
