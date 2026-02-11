'use client';

import { useState } from 'react';
import { CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

interface AttestationFormProps {
  assignmentId: string;
  bundleName: string;
  onComplete: () => void;
}

export default function AttestationForm({ assignmentId, bundleName, onComplete }: AttestationFormProps) {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('You must agree to the policy before submitting');
      return;
    }

    if (!signature.trim()) {
      setError('Please enter your full name as your signature');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/employee/attest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          signature: signature.trim(),
          agreed_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit attestation');
      }

      setSuccess(true);

      // Call completion handler after brief delay
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attestation');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-emerald-900 mb-2">
          Attestation Submitted Successfully
        </h3>
        <p className="text-emerald-800">
          Thank you for completing this policy acknowledgment. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-b border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Policy Acknowledgment
        </h3>
        <p className="text-sm text-slate-600">
          Please confirm that you have read and understood the policy above
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Agreement Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <span className="text-base text-slate-900 font-medium group-hover:text-blue-600 transition-colors">
                I acknowledge that I have read, understood, and agree to comply with the policies in "{bundleName}"
              </span>
              <p className="text-sm text-slate-600 mt-1">
                By checking this box, you confirm that you have carefully reviewed all policies and understand your responsibilities.
              </p>
            </div>
          </label>
        </div>

        {/* Signature Field */}
        <div className="mb-6">
          <label htmlFor="signature" className="block text-sm font-semibold text-slate-900 mb-2">
            Electronic Signature *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PencilIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              disabled={submitting}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Type your full name as it appears in your employment records. This serves as your electronic signature.
          </p>
        </div>

        {/* Legal Notice */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">Legal Notice:</strong> By submitting this attestation, you acknowledge that your electronic signature is legally binding and equivalent to a handwritten signature. This acknowledgment will be recorded with a timestamp and may be used for compliance and audit purposes.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            <span className="text-red-600">*</span> Required field
          </div>
          <button
            type="submit"
            disabled={submitting || !agreed || !signature.trim()}
            className={`px-8 py-4 rounded-lg font-semibold text-white transition-all ${
              submitting || !agreed || !signature.trim()
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Attestation'
            )}
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            After submission, you will receive confirmation and this acknowledgment will be recorded in your employee file.
          </p>
        </div>
      </form>
    </div>
  );
}
