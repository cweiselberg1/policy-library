'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', severity: '', category: '' });

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.severity) params.append('severity', filter.severity);
      if (filter.category) params.append('category', filter.category);

      const response = await fetch(`/api/incidents?${params.toString()}`);

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch incidents');

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-400';
      case 'investigating': return 'bg-yellow-500/10 text-yellow-400';
      case 'resolved': return 'bg-green-500/10 text-green-400';
      case 'closed': return 'bg-slate-500/10 text-slate-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Incident Management
              </h1>
              <p className="mt-2 text-slate-400">Track and manage security incidents</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/privacy-officer"
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">Open</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.status === 'open').length}
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">Investigating</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.status === 'investigating').length}
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">Resolved</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.status === 'resolved').length}
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">Critical</p>
            <p className="text-3xl font-bold text-white mt-2">
              {incidents.filter(i => i.severity === 'critical').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
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
              className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
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
              className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
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
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      onClick={() => router.push(`/dashboard/privacy-officer/incidents/${incident.id}`)}
                      className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ShieldExclamationIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                          <div>
                            <p className="text-white font-medium">{incident.title}</p>
                            <p className="text-slate-400 text-sm truncate max-w-md">
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
                      <td className="px-6 py-4 text-slate-300">
                        {incident.is_anonymous ? (
                          <span className="text-slate-500 italic">Anonymous</span>
                        ) : (
                          incident.reported_by_profile?.full_name || 'Unknown'
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
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
