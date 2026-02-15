'use client';

import { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function SettingsPage() {
  // Privacy Officer state
  const [privacyOfficer, setPrivacyOfficer] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isPrivacyOfficerAssigned, setIsPrivacyOfficerAssigned] = useState(false);
  const [showPrivacyOfficerSuccess, setShowPrivacyOfficerSuccess] = useState(false);

  // Organization state
  const [organization, setOrganization] = useState({
    name: '',
    type: 'covered-entity',
  });
  const [showOrgSuccess, setShowOrgSuccess] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    incidentAlerts: true,
    complianceReminders: true,
  });
  const [showNotifSuccess, setShowNotifSuccess] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    // Load Privacy Officer
    const savedOfficer = localStorage.getItem('hipaa-privacy-officer');
    if (savedOfficer) {
      try {
        const data = JSON.parse(savedOfficer);
        setPrivacyOfficer({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
        setIsPrivacyOfficerAssigned(true);
      } catch (e) {
        console.error('Error loading privacy officer:', e);
      }
    }

    // Load Organization
    const savedOrg = localStorage.getItem('hipaa-organization');
    if (savedOrg) {
      try {
        const data = JSON.parse(savedOrg);
        setOrganization({
          name: data.name || '',
          type: data.type || 'covered-entity',
        });
      } catch (e) {
        console.error('Error loading organization:', e);
      }
    }

    // Load Notification Preferences
    const savedPrefs = localStorage.getItem('hipaa-notification-prefs');
    if (savedPrefs) {
      try {
        const data = JSON.parse(savedPrefs);
        setNotificationPrefs(data);
      } catch (e) {
        console.error('Error loading notification prefs:', e);
      }
    }
  }, []);

  // Save Privacy Officer
  const handleSavePrivacyOfficer = () => {
    if (!privacyOfficer.name || !privacyOfficer.email) {
      alert('Please enter both name and email for the Privacy Officer');
      return;
    }

    const data = {
      ...privacyOfficer,
      assignedDate: new Date().toISOString(),
    };

    localStorage.setItem('hipaa-privacy-officer', JSON.stringify(data));
    setIsPrivacyOfficerAssigned(true);
    setShowPrivacyOfficerSuccess(true);
    setTimeout(() => setShowPrivacyOfficerSuccess(false), 3000);
  };

  // Save Organization
  const handleSaveOrganization = () => {
    if (!organization.name) {
      alert('Please enter an organization name');
      return;
    }

    localStorage.setItem('hipaa-organization', JSON.stringify(organization));
    setShowOrgSuccess(true);
    setTimeout(() => setShowOrgSuccess(false), 3000);
  };

  // Save Notification Preferences
  const handleSaveNotifications = () => {
    localStorage.setItem('hipaa-notification-prefs', JSON.stringify(notificationPrefs));
    setShowNotifSuccess(true);
    setTimeout(() => setShowNotifSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              Settings
            </h1>
            <p className="mt-2 text-dark-400">Configure your account and organizational preferences</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Privacy Officer Assignment - CRITICAL for Step 1 */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="h-8 w-8 text-copper-400" />
              <h2 className="text-2xl font-bold text-white">Privacy Officer Assignment</h2>
              {isPrivacyOfficerAssigned && (
                <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold">
                  <CheckCircleIcon className="h-4 w-4" />
                  Assigned
                </span>
              )}
            </div>
          </div>

          {showPrivacyOfficerSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400">
              Privacy Officer saved successfully!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Privacy Officer Name *
              </label>
              <input
                type="text"
                value={privacyOfficer.name}
                onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-500"
                placeholder="Enter Privacy Officer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={privacyOfficer.email}
                onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, email: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-500"
                placeholder="privacy.officer@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={privacyOfficer.phone}
                onChange={(e) => setPrivacyOfficer({ ...privacyOfficer, phone: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <button
              onClick={handleSavePrivacyOfficer}
              className="px-6 py-2 bg-gradient-to-r from-copper-500 to-copper-600 text-white font-semibold rounded-lg hover:from-copper-600 hover:to-copper-700 transition-all"
            >
              Save Privacy Officer
            </button>
          </div>
        </div>

        {/* Organization Information */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <KeyIcon className="h-8 w-8 text-copper-400" />
            <h2 className="text-2xl font-bold text-white">Organization Information</h2>
          </div>

          {showOrgSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400">
              Organization information saved successfully!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={organization.name}
                onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-500"
                placeholder="Enter your organization name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Organization Type *
              </label>
              <select
                value={organization.type}
                onChange={(e) => setOrganization({ ...organization, type: e.target.value })}
                className="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-500"
              >
                <option value="covered-entity">Covered Entity</option>
                <option value="business-associate">Business Associate</option>
                <option value="hybrid">Hybrid Entity</option>
              </select>
            </div>

            <button
              onClick={handleSaveOrganization}
              className="px-6 py-2 bg-gradient-to-r from-copper-500 to-copper-600 text-white font-semibold rounded-lg hover:from-copper-600 hover:to-copper-700 transition-all"
            >
              Save Organization
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <BellIcon className="h-8 w-8 text-copper-400" />
            <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
          </div>

          {showNotifSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400">
              Notification preferences saved successfully!
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-900/50 border border-dark-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-white">Email Notifications</h3>
                <p className="text-sm text-dark-400">Receive email updates about compliance activities</p>
              </div>
              <button
                onClick={() => setNotificationPrefs({ ...notificationPrefs, emailNotifications: !notificationPrefs.emailNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationPrefs.emailNotifications ? 'bg-copper-500' : 'bg-dark-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-900/50 border border-dark-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-white">Incident Alerts</h3>
                <p className="text-sm text-dark-400">Get notified immediately when incidents are reported</p>
              </div>
              <button
                onClick={() => setNotificationPrefs({ ...notificationPrefs, incidentAlerts: !notificationPrefs.incidentAlerts })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationPrefs.incidentAlerts ? 'bg-copper-500' : 'bg-dark-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.incidentAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-900/50 border border-dark-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-white">Compliance Reminders</h3>
                <p className="text-sm text-dark-400">Receive reminders for upcoming compliance deadlines</p>
              </div>
              <button
                onClick={() => setNotificationPrefs({ ...notificationPrefs, complianceReminders: !notificationPrefs.complianceReminders })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationPrefs.complianceReminders ? 'bg-copper-500' : 'bg-dark-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationPrefs.complianceReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSaveNotifications}
              className="px-6 py-2 bg-gradient-to-r from-copper-500 to-copper-600 text-white font-semibold rounded-lg hover:from-copper-600 hover:to-copper-700 transition-all"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
