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
      const response = await fetch(`/api/certificates/${assignmentId}`);

      if (!response.ok) {
        throw new Error('Failed to generate certificate');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bundleName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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
        className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        {downloading ? 'Generating...' : 'Download Certificate'}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
