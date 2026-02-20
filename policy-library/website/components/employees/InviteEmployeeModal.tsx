'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { orgStorage } from '@/lib/supabase/org-storage';
import { getSession } from '@/lib/supabase/auth';

interface InviteEmployeeModalProps {
  onClose: () => void;
  onInvited: () => void;
  departments?: { id: string; name: string }[];
}

export default function InviteEmployeeModal({
  onClose,
  onInvited,
}: InviteEmployeeModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const fullName = formData.full_name.trim();

      // Load existing employees from localStorage
      const existingEmployees = JSON.parse(orgStorage.getItem('hipaa-employees') || '[]');
      const emailAlreadyExists = existingEmployees.some(
        (employee: { email?: string }) => employee.email?.toLowerCase() === normalizedEmail
      );

      if (emailAlreadyExists) {
        throw new Error('An employee with this email already exists.');
      }

      const { data: sessionData } = await getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error('Your session expired. Please sign in again.');
      }

      const inviteResp = await fetch('/api/invite-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          full_name: fullName,
        }),
      });

      const inviteJson = await inviteResp.json().catch(() => ({}));
      if (!inviteResp.ok) {
        throw new Error(inviteJson.error || 'Failed to send invitation email.');
      }

      // Create new employee object
      const newEmployee = {
        id: `emp-${Date.now()}`,
        full_name: fullName,
        email: normalizedEmail,
        employee_id: `EMP-${Date.now().toString().slice(-6)}`,
        position_title: '',
        department_id: '',
        employment_type: 'full_time',
        employment_status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        phone: null,
        location: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add new employee to the array
      const updatedEmployees = [...existingEmployees, newEmployee];

      // Save back to localStorage
      orgStorage.setItem('hipaa-employees', JSON.stringify(updatedEmployees));

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
        <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 mb-4">
            <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Invitation Sent!</h3>
          <p className="text-dark-400">
            A sign-in invite email has been sent to {formData.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-2xl font-bold text-white">Invite Employee</h2>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-copper-500/50 focus:border-copper-500 transition-all"
              placeholder="Jane Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-copper-500/50 focus:border-copper-500 transition-all"
              placeholder="employee@company.com"
            />
          </div>

          {/* Info */}
          <div className="bg-copper-500/10 border border-copper-500/20 rounded-xl p-4">
            <p className="text-copper-300 text-sm">
              An email invitation will be sent with a link to complete their profile and start compliance training.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-dark-700 text-white font-semibold rounded-xl hover:bg-dark-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-copper-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
