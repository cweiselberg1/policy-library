'use client';

import { useState } from 'react';
import { CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { submitAttestation } from '@/lib/supabase/employee';

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
      const { error: submitError } = await submitAttestation(assignmentId, signature.trim());

      if (submitError) {
        throw new Error(submitError.message || 'Failed to submit attestation');
      }

      setSuccess(true);

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
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-emerald-300 mb-2">
          Attestation Submitted Successfully
        </h3>
        <p className="text-emerald-400/80">
          Thank you for completing this policy acknowledgment. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-b border-slate-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Policy Acknowledgment
        </h3>
        <p className="text-sm text-slate-400">
          Please confirm that you have read and understood the policy above
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
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
                className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <span className="text-base text-white font-medium group-hover:text-blue-400 transition-colors">
                I acknowledge that I have read, understood, and agree to comply with the policies in &quot;{bundleName}&quot;
              </span>
              <p className="text-sm text-slate-400 mt-1">
                By checking this box, you confirm that you have carefully reviewed all policies and understand your responsibilities.
              </p>
            </div>
          </label>
        </div>

        {/* Signature Field */}
        <div className="mb-6">
          <label htmlFor="signature" className="block text-sm font-semibold text-white mb-2">
            Electronic Signature *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PencilIcon className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              disabled={submitting}
            />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Type your full name as it appears in your employment records. This serves as your electronic signature.
          </p>
        </div>

        {/* Legal Notice */}
        <div className="mb-6 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Legal Notice:</strong> By submitting this attestation, you acknowledge that your electronic signature is legally binding and equivalent to a handwritten signature. This acknowledgment will be recorded with a timestamp and may be used for compliance and audit purposes.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-400">
            <span className="text-red-400">*</span> Required field
          </div>
          <button
            type="submit"
            disabled={submitting || !agreed || !signature.trim()}
            className={`px-8 py-4 rounded-lg font-semibold text-white transition-all ${
              submitting || !agreed || !signature.trim()
                ? 'bg-slate-700 cursor-not-allowed text-slate-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-600/20 hover:scale-[1.02]'
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
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            After submission, you will receive confirmation and this acknowledgment will be recorded in your employee file.
          </p>
        </div>
      </form>
    </div>
  );
}
