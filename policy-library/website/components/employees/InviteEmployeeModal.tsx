'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Department } from '@/types/employee-management';

interface InviteEmployeeModalProps {
  onClose: () => void;
  onInvited: () => void;
  departments: Department[];
}

export default function InviteEmployeeModal({
  onClose,
  onInvited,
  departments,
}: InviteEmployeeModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    employee_id: '',
    position_title: '',
    department_id: '',
    employment_type: 'full_time',
    start_date: new Date().toISOString().split('T')[0],
    phone: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/employees/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone || null,
          location: formData.location || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to invite employee');
      }

      setSuccess(true);
      setTimeout(() => {
        onInvited();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite employee');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 mb-4">
            <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Invitation Sent!</h3>
          <p className="text-slate-400">
            An email invitation has been sent to {formData.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Invite Employee</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="employee@company.com"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="EMP-12345"
              />
            </div>

            {/* Position Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Position Title *
              </label>
              <input
                type="text"
                required
                value={formData.position_title}
                onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Senior Engineer"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Department *
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Employment Type *
              </label>
              <select
                required
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contractor">Contractor</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="New York, NY or Remote"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              An email invitation will be sent with a link to complete their profile and start compliance training.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
