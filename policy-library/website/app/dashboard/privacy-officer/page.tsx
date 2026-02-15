'use client';

import { useState, useEffect } from 'react';
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

function computeStepStatuses(): Record<number, string> {
  const statuses: Record<number, string> = {};

  // Step 1: Privacy Officer
  const po = localStorage.getItem('hipaa-privacy-officer');
  statuses[1] = po ? 'Completed' : 'Pending';

  // Step 2: SRA
  const sra = localStorage.getItem('hipaa-sra-assessment');
  if (sra) {
    try {
      const data = JSON.parse(sra);
      if (data.report) {
        statuses[2] = 'Completed';
      } else if (data.responses && Object.keys(data.responses).length > 0) {
        statuses[2] = 'In Progress';
      } else {
        statuses[2] = 'Pending';
      }
    } catch {
      statuses[2] = 'Pending';
    }
  } else {
    statuses[2] = 'Pending';
  }

  // Step 3: Gap Analysis
  const gaps = localStorage.getItem('hipaa-gap-analysis');
  try {
    statuses[3] = gaps && JSON.parse(gaps).length > 0 ? 'Completed' : 'Pending';
  } catch {
    statuses[3] = 'Pending';
  }

  // Step 4: Remediation Plans
  const remed = localStorage.getItem('hipaa-remediation-plans');
  try {
    statuses[4] = remed && JSON.parse(remed).length > 0 ? 'Completed' : 'Pending';
  } catch {
    statuses[4] = 'Pending';
  }

  // Step 5: Review Policies
  const bundles = localStorage.getItem('hipaa-policy-bundles');
  try {
    statuses[5] = bundles && JSON.parse(bundles).length > 0 ? 'Completed' : 'Pending';
  } catch {
    statuses[5] = 'Pending';
  }

  // Step 6: Publish Policies
  const published = localStorage.getItem('hipaa-published-policies');
  statuses[6] = published ? 'Completed' : 'Pending';

  // Step 7: User Invites & Training
  const emps = localStorage.getItem('hipaa-employees');
  const assignments = localStorage.getItem('hipaa-training-assignments');
  try {
    const employees = emps ? JSON.parse(emps) : [];
    const trainingAssignments = assignments ? JSON.parse(assignments) : [];

    if (employees.length === 0) {
      statuses[7] = 'Pending';
    } else if (trainingAssignments.length === 0) {
      statuses[7] = 'In Progress';
    } else {
      // Check if all employees have at least one training assignment
      const employeesWithTraining = new Set(trainingAssignments.map((a: any) => a.employee_id));
      const allEmployeesHaveTraining = employees.every((e: any) => employeesWithTraining.has(e.id));
      statuses[7] = allEmployeesHaveTraining ? 'Completed' : 'In Progress';
    }
  } catch {
    statuses[7] = 'Pending';
  }

  // Step 8: Vendor Management
  const vendors = localStorage.getItem('hipaa-vendors');
  try {
    statuses[8] = vendors && JSON.parse(vendors).length > 0 ? 'Completed' : 'Pending';
  } catch {
    statuses[8] = 'Pending';
  }

  // Step 9: Physical Site Audit
  const physical = localStorage.getItem('hipaa-physical-audit');
  statuses[9] = physical ? 'Completed' : 'Pending';

  // Step 10: IT Risk
  const itRisk = localStorage.getItem('hipaa-it-risk');
  statuses[10] = itRisk ? 'Completed' : 'Pending';

  // Step 11: Data Device Audit
  const devices = localStorage.getItem('hipaa-device-audit');
  statuses[11] = devices ? 'Completed' : 'Pending';

  // Step 12: Incident Management
  const incidents = localStorage.getItem('hipaa-incidents');
  try {
    statuses[12] = incidents && JSON.parse(incidents).length > 0 ? 'Completed' : 'Pending';
  } catch {
    statuses[12] = 'Pending';
  }

  return statuses;
}

export default function PrivacyOfficerDashboard() {
  const [stepStatuses, setStepStatuses] = useState<Record<number, string>>({});
  const [stats, setStats] = useState<DashboardStats>({
    total_employees: 0,
    active_employees: 0,
    total_departments: 0,
    compliance_rate: 0,
    pending_attestations: 0,
    policy_bundles: 0,
  });

  useEffect(() => {
    // Compute step statuses from localStorage
    const statuses = computeStepStatuses();
    setStepStatuses(statuses);

    // Compute stats from localStorage
    try {
      const emps = localStorage.getItem('hipaa-employees');
      const employees = emps ? JSON.parse(emps) : [];
      const activeEmployees = employees.filter((e: any) => e.status === 'active').length;

      const depts = localStorage.getItem('hipaa-departments');
      const departments = depts ? JSON.parse(depts) : [];

      const bundles = localStorage.getItem('hipaa-policy-bundles');
      const policyBundles = bundles ? JSON.parse(bundles) : [];

      // Calculate compliance rate based on completed steps
      const completedSteps = Object.values(statuses).filter(s => s === 'Completed').length;
      const complianceRate = (completedSteps / 12) * 100;

      // Pending = count of pending steps
      const pendingSteps = Object.values(statuses).filter(s => s === 'Pending').length;

      setStats({
        total_employees: employees.length,
        active_employees: activeEmployees,
        total_departments: departments.length,
        compliance_rate: complianceRate,
        pending_attestations: pendingSteps,
        policy_bundles: policyBundles.length,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }, []);

  const navigationCards = [
    {
      title: 'Employees',
      description: 'Manage employee invitations and access',
      href: '/dashboard/privacy-officer/employees',
      icon: UserGroupIcon,
      color: 'from-blue-600 to-cyan-600',
      stats: `${stats.active_employees} active`,
    },
    {
      title: 'Departments',
      description: 'Organize hierarchical structure',
      href: '/dashboard/privacy-officer/departments',
      icon: BuildingOfficeIcon,
      color: 'from-violet-600 to-purple-600',
      stats: `${stats.total_departments} departments`,
    },
    {
      title: 'Policy Bundles',
      description: 'Create and assign policy collections',
      href: '/dashboard/privacy-officer/policy-bundles',
      icon: DocumentTextIcon,
      color: 'from-emerald-600 to-teal-600',
      stats: `${stats.policy_bundles} bundles`,
    },
    {
      title: 'Compliance Dashboard',
      description: 'Track attestations and compliance',
      href: '/dashboard/privacy-officer/compliance',
      icon: ChartBarIcon,
      color: 'from-orange-600 to-red-600',
      stats: `${Math.round(stats.compliance_rate)}% compliant`,
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
                {stats.pending_attestations > 0 && (
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
            <p className="text-slate-400 mb-6">
              {Object.values(stepStatuses).filter(s => s === 'Completed').length} of 12 steps completed
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-8">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(Object.values(stepStatuses).filter(s => s === 'Completed').length / 12) * 100}%` }}
              ></div>
            </div>

            {/* Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: 1, title: 'Assign Privacy Officer', desc: 'Designate responsible HIPAA compliance officer', href: '/dashboard/privacy-officer/settings' },
                { step: 2, title: 'Security Risk Assessment', desc: 'Complete comprehensive SRA questionnaire', href: '/sra' },
                { step: 3, title: 'Gap Analysis', desc: 'Review identified security gaps', href: '/dashboard/privacy-officer/gaps' },
                { step: 4, title: 'Remediation Plans', desc: 'Create action plans for security gaps', href: '/dashboard/privacy-officer/remediation-plans' },
                { step: 5, title: 'Review Policies', desc: 'Review and customize HIPAA policies', href: '/dashboard/privacy-officer/policy-bundles' },
                { step: 6, title: 'Publish Policies', desc: 'Publish policies for employee acknowledgment', href: '/dashboard/privacy-officer/compliance' },
                { step: 7, title: 'User Invites & Training', desc: 'Invite employees and assign training', href: '/dashboard/privacy-officer/employees' },
                { step: 8, title: 'Vendor Management', desc: 'Track Business Associate Agreements', href: 'https://vendors.oneguyconsulting.com' },
                { step: 9, title: 'Physical Site Audit', desc: 'Conduct on-site security assessment', href: '/audit/physical' },
                { step: 10, title: 'IT Risk Questionnaire', desc: 'Assess technology infrastructure risks', href: '/audit' },
                { step: 11, title: 'Data Device Audit', desc: 'Inventory and assess data-bearing devices', href: '/audit/data-device' },
                { step: 12, title: 'Incident Management', desc: 'Set up breach notification procedures', href: '/dashboard/privacy-officer/incidents' },
              ].map((item) => {
                const status = stepStatuses[item.step] || 'Pending';
                const isExternal = item.href.startsWith('http');
                const statusColor = status === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : status === 'In Progress'
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-slate-700/50 text-slate-400';
                const CardContent = (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold">
                        {item.step}
                      </div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {status === 'Completed' && <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />}
                        {status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{item.desc}</p>
                    <div className="flex justify-end">
                      <ArrowRightIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </>
                );
                return isExternal ? (
                  <a
                    key={item.step}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                  >
                    {CardContent}
                  </a>
                ) : (
                  <Link
                    key={item.step}
                    href={item.href}
                    className="group bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                  >
                    {CardContent}
                  </Link>
                );
              })}
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
            <p className="text-4xl font-bold text-white">{stats.total_employees}</p>
            <p className="text-sm text-cyan-400 mt-2">{stats.active_employees} active</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Departments</p>
              <BuildingOfficeIcon className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.total_departments}</p>
            <p className="text-sm text-violet-400 mt-2">Hierarchical structure</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Compliance Rate</p>
              <ChartBarIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-white">{Math.round(stats.compliance_rate)}%</p>
            <p className="text-sm text-emerald-400 mt-2">Organization-wide</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Pending</p>
              <BellIcon className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.pending_attestations}</p>
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
      </main>
    </div>
  );
}
