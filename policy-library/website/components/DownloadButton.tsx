'use client';

import { useState } from 'react';
import { downloadPoliciesAsZip } from '@/lib/download';

interface DownloadButtonProps {
  policies: Array<{ file_path: string; content?: string }>;
  entityType: 'covered_entity' | 'business_associate';
  label?: string;
  className?: string;
}

export function DownloadButton({ policies, entityType, label, className = '' }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadPoliciesAsZip(policies, entityType);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download policies. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const defaultLabel = entityType === 'covered_entity'
    ? 'Download All CE Policies'
    : 'Download All BA Policies';

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-copper-600 text-white rounded-lg hover:bg-copper-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{label || defaultLabel}</span>
        </>
      )}
    </button>
  );
}
