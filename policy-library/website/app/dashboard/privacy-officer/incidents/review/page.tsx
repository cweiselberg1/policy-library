'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldExclamationIcon,
  FunnelIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  is_anonymous: boolean;
  reported_by_profile?: { full_name: string; email: string };
  assigned_to_profile?: { full_name: string };
  created_at: string;
}

export default function IncidentsReviewPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState({ status: '', severity: '', category: '' });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('hipaa-incidents') || '[]');
      setIncidents(saved);
    } catch {
      setIncidents([]);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-copper-500/10 text-copper-400 border-copper-500/20';
      default: return 'bg-dark-500/10 text-dark-400 border-dark-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-400';
      case 'investigating': return 'bg-yellow-500/10 text-yellow-400';
      case 'resolved': return 'bg-green-500/10 text-green-400';
      case 'closed': return 'bg-dark-500/10 text-dark-400';
      default: return 'bg-dark-500/10 text-dark-400';
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (filter.status && incident.status !== filter.status) return false;
    if (filter.severity && incident.severity !== filter.severity) return false;
    if (filter.category && incident.category !== filter.category) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                Review Incidents
              </h1>
              <p className="mt-2 text-dark-400">Track and manage security incidents</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm">Open</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.status === 'open').length}
            </p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm">Investigating</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.status === 'investigating').length}
            </p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm">Resolved</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.status === 'resolved').length}
            </p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm">Critical</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.severity === 'critical').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FunnelIcon className="h-5 w-5 text-dark-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="bg-dark-900/50 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-copper-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className="bg-dark-900/50 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-copper-500"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="bg-dark-900/50 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-copper-500"
            >
              <option value="">All Categories</option>
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
        </div>

        {/* Incidents Table */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-dark-400">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="hover:bg-dark-700/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ShieldExclamationIcon className="h-5 w-5 text-copper-400 flex-shrink-0" />
                          <div>
                            <p className="text-white font-medium">{incident.title}</p>
                            <p className="text-dark-400 text-sm truncate max-w-md">
                              {incident.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-300">
                        {incident.is_anonymous ? (
                          <span className="text-dark-500 italic">Anonymous</span>
                        ) : (
                          incident.reported_by_profile?.full_name || 'Unknown'
                        )}
                      </td>
                      <td className="px-6 py-4 text-dark-300 text-sm">
                        {new Date(incident.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
