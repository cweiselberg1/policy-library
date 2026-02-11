'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldExclamationIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function AnonymousReportPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    severity: 'medium',
    location: '',
    reporter_email: '' // Optional for anonymous
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/incidents/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to submit incident');

      const data = await response.json();
      setReferenceNumber(data.reference_number);
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting incident:', err);
      alert('Failed to submit incident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 max-w-md text-center">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldExclamationIcon className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-slate-400 mb-4">
            Your anonymous incident report has been submitted successfully.
          </p>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
            <p className="text-slate-400 text-sm mb-2">Reference Number</p>
            <p className="text-2xl font-mono font-bold text-cyan-400">{referenceNumber}</p>
            <p className="text-slate-500 text-xs mt-2">
              Save this number to track your report
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
              <EyeSlashIcon className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Anonymous Incident Report</h1>
              <p className="text-slate-400 text-sm mt-1">Report a security incident anonymously</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Privacy Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <EyeSlashIcon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Your Privacy is Protected</h3>
              <p className="text-slate-300 text-sm">
                This form does not collect any identifying information. Your report is completely anonymous.
                If you choose to provide an email address, it will only be used to send you updates about your report.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-slate-300 font-medium mb-2">
              Incident Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Provide detailed information about what happened..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="data_breach">Data Breach</option>
                <option value="unauthorized_access">Unauthorized Access</option>
                <option value="lost_device">Lost Device</option>
                <option value="phishing">Phishing</option>
                <option value="malware">Malware</option>
                <option value="policy_violation">Policy Violation</option>
                <option value="patient_complaint">Patient Complaint</option>
                <option value="system_outage">System Outage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Severity <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low - Minor issue</option>
                <option value="medium">Medium - Moderate impact</option>
                <option value="high">High - Significant impact</option>
                <option value="critical">Critical - Severe impact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Location (Optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Where did this occur?"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">
              Contact Email (Optional)
              <span className="text-slate-500 text-sm ml-2">Only if you want updates</span>
            </label>
            <input
              type="email"
              value={formData.reporter_email}
              onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Anonymous Report'}
          </button>

          <p className="text-slate-500 text-sm text-center">
            Your report will be reviewed by the Privacy Officer
          </p>
        </form>
      </main>
    </div>
  );
}
