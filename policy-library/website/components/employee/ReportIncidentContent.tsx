'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { submitIncident } from '@/lib/supabase/employee';

export default function ReportIncidentContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    severity: 'medium',
    location: '',
    affected_systems: '',
    affected_individuals_count: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await submitIncident({
        ...formData,
        affected_systems: formData.affected_systems ? formData.affected_systems.split(',').map(s => s.trim()) : [],
        affected_individuals_count: formData.affected_individuals_count ? parseInt(formData.affected_individuals_count) : null
      });

      if (error) throw new Error(error.message || 'Failed to submit incident');

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/employee'), 2000);
    } catch (err) {
      console.error('Error submitting incident:', err);
      alert('Failed to submit incident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 max-w-md text-center">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldExclamationIcon className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Incident Reported</h2>
          <p className="text-slate-400">
            Your incident has been submitted successfully. The Privacy Officer will review it shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">Report an Incident</h1>
        <p className="text-slate-400 text-sm mt-1">Submit a security or compliance incident</p>
      </div>

      <div className="max-w-4xl">
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
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Provide detailed information about what happened, when it occurred, and any other relevant details..."
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
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low - Minor issue</option>
                <option value="medium">Medium - Moderate impact</option>
                <option value="high">High - Significant impact</option>
                <option value="critical">Critical - Severe impact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Where did this occur?"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">
              Affected Systems
              <span className="text-slate-500 text-sm ml-2">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.affected_systems}
              onChange={(e) => setFormData({ ...formData, affected_systems: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Email Server, Database, Website"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">
              Number of Affected Individuals
            </label>
            <input
              type="number"
              min="0"
              value={formData.affected_individuals_count}
              onChange={(e) => setFormData({ ...formData, affected_individuals_count: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="How many people were affected?"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Incident Report'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/employee')}
              className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
