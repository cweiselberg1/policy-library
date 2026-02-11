'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import EmployeeComplianceMatrix from '@/components/compliance/EmployeeComplianceMatrix';

interface ComplianceData {
  organization_compliance_rate: number;
  department_compliance: Array<{
    department_id: string;
    department_name: string;
    compliance_rate: number;
    employees_count: number;
    compliant_employees: number;
  }>;
  employee_compliance: Array<{
    employee_id: string;
    employee_name: string;
    department_name: string;
    assigned_policies: number;
    completed_policies: number;
    compliance_rate: number;
    pending_attestations: string[];
  }>;
}

export default function CompliancePage() {
  const router = useRouter();
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'departments' | 'employees'>('departments');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      const response = await fetch('/api/compliance/overview');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch compliance data');
      }

      const data = await response.json();
      setComplianceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Loading compliance data...</p>
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
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/privacy-officer"
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Compliance Dashboard
                </h1>
                <p className="mt-2 text-slate-400">Track attestations and compliance rates</p>
              </div>
            </div>
            <div className="flex gap-2 bg-slate-900/50 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setView('departments')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  view === 'departments'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By Department
              </button>
              <button
                onClick={() => setView('employees')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  view === 'employees'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By Employee
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={fetchComplianceData}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : !complianceData ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">No Compliance Data</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Set up employees and policy bundles to start tracking compliance.
            </p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
                <p className="text-slate-400 text-sm font-medium mb-2">Organization Rate</p>
                <p className="text-4xl font-bold text-white">
                  {Math.round(complianceData.organization_compliance_rate)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
                <p className="text-slate-400 text-sm font-medium mb-2">Departments</p>
                <p className="text-4xl font-bold text-white">
                  {complianceData.department_compliance.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                <p className="text-slate-400 text-sm font-medium mb-2">Employees</p>
                <p className="text-4xl font-bold text-white">
                  {complianceData.employee_compliance.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6">
                <p className="text-slate-400 text-sm font-medium mb-2">Fully Compliant</p>
                <p className="text-4xl font-bold text-white">
                  {complianceData.employee_compliance.filter((e) => e.compliance_rate === 100).length}
                </p>
              </div>
            </div>

            {/* View Content */}
            {view === 'departments' ? (
              <ComplianceDashboard departmentCompliance={complianceData.department_compliance} />
            ) : (
              <EmployeeComplianceMatrix employeeCompliance={complianceData.employee_compliance} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
