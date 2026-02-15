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
      const existing = JSON.parse(localStorage.getItem('hipaa-incidents') || '[]');
      const refNum = `INC-${Date.now().toString(36).toUpperCase()}`;
      const newIncident = {
        id: `incident-${Date.now()}`,
        reference_number: refNum,
        ...formData,
        is_anonymous: true,
        status: 'open',
        created_at: new Date().toISOString(),
      };
      existing.push(newIncident);
      localStorage.setItem('hipaa-incidents', JSON.stringify(existing));
      setReferenceNumber(refNum);
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
      <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-evergreen-900 to-evergreen-950 flex items-center justify-center p-6">
        <div className="bg-evergreen-900/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 max-w-md text-center">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldExclamationIcon className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-evergreen-300 mb-4">
            Your anonymous incident report has been submitted successfully.
          </p>
          <div className="bg-evergreen-950/50 border border-evergreen-700 rounded-lg p-4 mb-6">
            <p className="text-evergreen-400 text-sm mb-2">Reference Number</p>
            <p className="text-2xl font-mono font-bold text-copper-400">{referenceNumber}</p>
            <p className="text-evergreen-500 text-xs mt-2">
              Save this number to track your report
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-copper-600 text-white rounded-lg hover:bg-copper-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-evergreen-900 to-evergreen-950">
      {/* Header */}
      <header className="bg-evergreen-900/50 backdrop-blur-xl border-b border-evergreen-700/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-copper-500/10 rounded-xl flex items-center justify-center">
              <EyeSlashIcon className="h-6 w-6 text-copper-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-serif)' }}>Anonymous Incident Report</h1>
              <p className="text-evergreen-400 text-sm mt-1">Report a security incident anonymously</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Privacy Notice */}
        <div className="bg-evergreen-700/10 border border-evergreen-600/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <EyeSlashIcon className="h-6 w-6 text-evergreen-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-evergreen-400 font-semibold mb-2">Your Privacy is Protected</h3>
              <p className="text-evergreen-300 text-sm">
                This form does not collect any identifying information. Your report is completely anonymous.
                If you choose to provide an email address, it will only be used to send you updates about your report.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-evergreen-900/50 backdrop-blur-xl border border-evergreen-700/50 rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-evergreen-300 font-medium mb-2">
              Incident Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-evergreen-950/50 border border-evergreen-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-copper-500"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label className="block text-evergreen-300 font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full bg-evergreen-950/50 border border-evergreen-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-copper-500 resize-none"
              placeholder="Provide detailed information about what happened..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-evergreen-300 font-medium mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-evergreen-950/50 border border-evergreen-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-copper-500"
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
              <label className="block text-evergreen-300 font-medium mb-2">
                Severity <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-evergreen-950/50 border border-evergreen-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-copper-500"
              >
                <option value="low">Low - Minor issue</option>
                <option value="medium">Medium - Moderate impact</option>
                <option value="high">High - Significant impact</option>
                <option value="critical">Critical - Severe impact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-evergreen-300 font-medium mb-2">Location (Optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-evergreen-950/50 border border-evergreen-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-copper-500"
              placeholder="Where did this occur?"
            />
          </div>

          <div>
            <label className="block text-evergreen-300 font-medium mb-2">
              Contact Email (Optional)
              <span className="text-evergreen-500 text-sm ml-2">Only if you want updates</span>
            </label>
            <input
              type="email"
              value={formData.reporter_email}
              onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
              className="w-full bg-evergreen-950/50 border border-evergreen-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-copper-500"
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[--shadow-copper] transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Anonymous Report'}
          </button>

          <p className="text-evergreen-500 text-sm text-center">
            Your report will be reviewed by the Privacy Officer
          </p>
        </form>
      </main>
    </div>
  );
}
