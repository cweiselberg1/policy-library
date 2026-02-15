'use client';

import { DocumentTextIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';

interface PolicyDetail {
  id: string;
  title: string;
  category: string;
  content: string;
  version: string;
  last_updated: string;
}

interface PolicyViewerProps {
  policy: PolicyDetail;
}

export default function PolicyViewer({ policy }: PolicyViewerProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-dark-200 shadow-sm overflow-hidden">
      {/* Policy Header */}
      <div className="border-b border-dark-200 bg-gradient-to-br from-copper-50 to-pearl-50 p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-copper-100">
            <DocumentTextIcon className="h-8 w-8 text-copper-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-evergreen-900 mb-3">
              {policy.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-600">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                <span className="font-medium">{policy.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Updated {new Date(policy.last_updated).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="px-3 py-1 bg-copper-100 text-copper-800 rounded-full text-xs font-medium">
                Version {policy.version}
              </div>
            </div>
          </div>
        </div>

        {/* Reading Instructions */}
        <div className="bg-white rounded-lg border border-copper-200 p-4 mt-4">
          <p className="text-sm text-dark-700">
            <strong className="text-evergreen-900">Please read this policy carefully.</strong>{' '}
            You will need to acknowledge that you have read, understood, and agree to comply with this policy.
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="p-8">
        <div
          className="markdown-content prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(policy.content, {
              ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a'],
              ALLOWED_ATTR: ['href', 'target', 'rel']
            })
          }}
        />
      </div>

      {/* Footer Note */}
      <div className="border-t border-dark-200 bg-slate-50 p-6">
        <p className="text-sm text-dark-600 text-center">
          This policy is effective as of {new Date(policy.last_updated).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })} (Version {policy.version})
        </p>
      </div>
    </div>
  );
}
