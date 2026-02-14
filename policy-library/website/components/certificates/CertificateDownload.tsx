'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface CertificateDownloadProps {
  assignmentId: string;
  bundleName: string;
}

export default function CertificateDownload({ assignmentId, bundleName }: CertificateDownloadProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      // Certificate generation is not yet available
      // This will be implemented when Supabase storage is configured for certificates
      setError('Certificate generation coming soon');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download certificate');
      console.error('Certificate download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        {downloading ? 'Generating...' : 'Download Certificate'}
      </button>
      {error && (
        <p className="text-xs text-slate-500 mt-1">{error}</p>
      )}
    </div>
  );
}
