'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
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
      <h2 className="text-2xl font-bold text-white mb-6">Completed Policies</h2>

      <div className="space-y-4">
        {assignments.slice(0, displayCount).map((assignment) => (
          <div
            key={assignment.id}
            className="bg-dark-800/50 backdrop-blur-xl rounded-xl border border-emerald-500/20 p-6"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircleIcon className="h-7 w-7 text-emerald-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {assignment.bundle_name}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400 mb-3">
                  <div className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>{assignment.policy_count} {assignment.policy_count === 1 ? 'policy' : 'policies'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">
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
                    href={`/dashboard/employee/policies/view?id=${assignment.policy_bundle_id}`}
                    className="text-sm text-copper-400 hover:text-copper-300 font-medium"
                  >
                    View Policy
                  </Link>
                  <span className="text-dark-600">•</span>
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
          className="mt-6 w-full py-3 border border-dark-700 rounded-lg text-dark-300 font-medium hover:bg-dark-800 hover:border-dark-600 transition-colors"
        >
          {expanded ? 'Show Less' : `Show All ${assignments.length} Completed Policies`}
        </button>
      )}
    </div>
  );
}
