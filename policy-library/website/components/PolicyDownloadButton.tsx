'use client';

import { downloadPolicy } from '@/lib/download';

interface PolicyDownloadButtonProps {
  policy: { title: string };
  content: string;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}

export function PolicyDownloadButton({ policy, content, variant = 'secondary', className = '' }: PolicyDownloadButtonProps) {
  const handleDownload = () => {
    downloadPolicy(policy, content);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownload}
        className={`p-2 text-gray-600 hover:text-copper-600 transition-colors ${className}`}
        title="Download policy"
        aria-label="Download policy"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    );
  }

  const baseClasses = variant === 'primary'
    ? 'bg-copper-600 text-white hover:bg-copper-700'
    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${baseClasses} ${className}`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Download</span>
    </button>
  );
}
