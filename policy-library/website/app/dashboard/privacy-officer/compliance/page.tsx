'use client';

import { useEffect, useState } from 'react';
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
  const [complianceData, setComplianceData] = useState<ComplianceData>({
    organization_compliance_rate: 0,
    department_compliance: [],
    employee_compliance: [],
  });
  const [view, setView] = useState<'departments' | 'employees'>('departments');

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = () => {
    try {
      const employees = JSON.parse(localStorage.getItem('hipaa-employees') || '[]');
      const departments = JSON.parse(localStorage.getItem('hipaa-departments') || '[]');

      // Build compliance data from localStorage
      const data: ComplianceData = {
        organization_compliance_rate: 0,
        department_compliance: departments.map((d: any) => ({
          department_id: d.id,
          department_name: d.name,
          compliance_rate: 0,
          employees_count: employees.filter((e: any) => e.department_id === d.id).length,
          compliant_employees: 0,
        })),
        employee_compliance: employees.map((e: any) => ({
          employee_id: e.id || e.employee_id,
          employee_name: e.name || e.full_name || e.position_title || 'Unknown',
          department_name: departments.find((d: any) => d.id === e.department_id)?.name || 'Unassigned',
          assigned_policies: 0,
          completed_policies: 0,
          compliance_rate: 0,
          pending_attestations: [],
        })),
      };
      setComplianceData(data);
    } catch {
      setComplianceData({
        organization_compliance_rate: 0,
        department_compliance: [],
        employee_compliance: [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/privacy-officer"
                className="p-2 text-dark-400 hover:text-orange-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                  Compliance Dashboard
                </h1>
                <p className="mt-2 text-dark-400">Track attestations and compliance rates</p>
              </div>
            </div>
            <div className="flex gap-2 bg-dark-900/50 rounded-xl p-1 border border-dark-700">
              <button
                onClick={() => setView('departments')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  view === 'departments'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                By Department
              </button>
              <button
                onClick={() => setView('employees')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  view === 'employees'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                By Employee
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {complianceData.employee_compliance.length === 0 && complianceData.department_compliance.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">No Compliance Data</h3>
            <p className="text-dark-400 mb-8 max-w-md mx-auto">
              Set up employees and policy bundles to start tracking compliance.
            </p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
                <p className="text-dark-400 text-sm font-medium mb-2">Organization Rate</p>
                <p className="text-4xl font-bold text-white">
                  {Math.round(complianceData.organization_compliance_rate)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-copper-500/10 to-copper-400/10 backdrop-blur-xl border border-copper-500/20 rounded-2xl p-6">
                <p className="text-dark-400 text-sm font-medium mb-2">Departments</p>
                <p className="text-4xl font-bold text-white">
                  {complianceData.department_compliance.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                <p className="text-dark-400 text-sm font-medium mb-2">Employees</p>
                <p className="text-4xl font-bold text-white">
                  {complianceData.employee_compliance.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-copper-500/10 to-copper-400/10 backdrop-blur-xl border border-copper-500/20 rounded-2xl p-6">
                <p className="text-dark-400 text-sm font-medium mb-2">Fully Compliant</p>
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
