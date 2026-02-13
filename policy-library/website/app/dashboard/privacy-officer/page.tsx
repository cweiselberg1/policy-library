'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface DashboardStats {
  total_employees: number;
  active_employees: number;
  total_departments: number;
  compliance_rate: number;
  pending_attestations: number;
  policy_bundles: number;
}

export default function PrivacyOfficerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const navigationCards = [
    {
      title: 'Employees',
      description: 'Manage employee invitations and access',
      href: '/dashboard/privacy-officer/employees',
      icon: UserGroupIcon,
      color: 'from-blue-600 to-cyan-600',
      stats: stats ? `${stats.active_employees} active` : '...',
    },
    {
      title: 'Departments',
      description: 'Organize hierarchical structure',
      href: '/dashboard/privacy-officer/departments',
      icon: BuildingOfficeIcon,
      color: 'from-violet-600 to-purple-600',
      stats: stats ? `${stats.total_departments} departments` : '...',
    },
    {
      title: 'Policy Bundles',
      description: 'Create and assign policy collections',
      href: '/dashboard/privacy-officer/policy-bundles',
      icon: DocumentTextIcon,
      color: 'from-emerald-600 to-teal-600',
      stats: stats ? `${stats.policy_bundles} bundles` : '...',
    },
    {
      title: 'Compliance Dashboard',
      description: 'Track attestations and compliance',
      href: '/dashboard/privacy-officer/compliance',
      icon: ChartBarIcon,
      color: 'from-orange-600 to-red-600',
      stats: stats ? `${Math.round(stats.compliance_rate)}% compliant` : '...',
    },
    {
      title: 'Incident Management',
      description: 'Track and manage security incidents',
      href: '/dashboard/privacy-officer/incidents',
      icon: BellIcon,
      color: 'from-red-600 to-pink-600',
      stats: 'View all incidents',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl p-8 max-w-md">
          <p className="text-red-400 mb-6 text-center">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-cyan-500/20 transition-all"
          >
            Try Again
          </button>
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
                HIPAA Compliance Dashboard
              </h1>
              <p className="mt-2 text-slate-400">Privacy Officer Workflow - 12 Steps to Compliance</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-3 text-slate-400 hover:text-cyan-400 transition-colors">
                <BellIcon className="h-6 w-6" />
                {stats && stats.pending_attestations > 0 && (
                  <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-800"></span>
                )}
              </button>
              <button className="p-3 text-slate-400 hover:text-cyan-400 transition-colors">
                <Cog6ToothIcon className="h-6 w-6" />
              </button>
              <Link
                href="/"
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Workflow Progress */}
        <div className="mb-12">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Workflow Progress</h2>
            <p className="text-slate-400 mb-6">1 of 12 steps completed</p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-8">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '8.33%' }}></div>
            </div>

            {/* Workflow Steps */}
            <div className="grid grid-cols-1 gap-4">
              <Link
                href="/dashboard/privacy-officer/employees"
                className="group flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-lg">
                    1
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">Assign Privacy Officer</h3>
                    <p className="text-sm text-slate-400">Designate responsible HIPAA compliance officer</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
                    <CheckCircleIcon className="h-4 w-4" />
                    Completed
                  </span>
                  <ArrowRightIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Total Employees</p>
              <UserGroupIcon className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats?.total_employees || 0}</p>
            <p className="text-sm text-cyan-400 mt-2">{stats?.active_employees || 0} active</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Departments</p>
              <BuildingOfficeIcon className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats?.total_departments || 0}</p>
            <p className="text-sm text-violet-400 mt-2">Hierarchical structure</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Compliance Rate</p>
              <ChartBarIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-white">{Math.round(stats?.compliance_rate || 0)}%</p>
            <p className="text-sm text-emerald-400 mt-2">Organization-wide</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Pending</p>
              <BellIcon className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats?.pending_attestations || 0}</p>
            <p className="text-sm text-orange-400 mt-2">Attestations due</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {navigationCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10 mb-4`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {card.title}
                </h3>

                <p className="text-slate-400 mb-4">
                  {card.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    {card.stats}
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-cyan-500/20 transition-all text-left">
              <p className="text-lg mb-1">Invite Employee</p>
              <p className="text-sm text-cyan-100">Send invitation link</p>
            </button>

            <button className="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-violet-500/20 transition-all text-left">
              <p className="text-lg mb-1">Create Department</p>
              <p className="text-sm text-violet-100">Add to hierarchy</p>
            </button>

            <button className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all text-left">
              <p className="text-lg mb-1">New Policy Bundle</p>
              <p className="text-sm text-emerald-100">Create collection</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
