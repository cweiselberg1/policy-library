'use client';

import { useState } from 'react';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface DepartmentCompliance {
  department_id: string;
  department_name: string;
  compliance_rate: number;
  employees_count: number;
  compliant_employees: number;
}

interface ComplianceDashboardProps {
  departmentCompliance: DepartmentCompliance[];
}

export default function ComplianceDashboard({ departmentCompliance }: ComplianceDashboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return 'from-emerald-500 to-teal-500';
    if (rate >= 70) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  const getComplianceTextColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-400';
    if (rate >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getComplianceBgColor = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (rate >= 70) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const sortedDepartments = [...departmentCompliance].sort(
    (a, b) => a.compliance_rate - b.compliance_rate
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-dark-400 text-sm font-medium">High Compliance</p>
            <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-white">
            {departmentCompliance.filter((d) => d.compliance_rate >= 90).length}
          </p>
          <p className="text-sm text-emerald-400 mt-2">≥90% compliant</p>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-dark-400 text-sm font-medium">Needs Attention</p>
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
          </div>
          <p className="text-4xl font-bold text-white">
            {departmentCompliance.filter((d) => d.compliance_rate >= 70 && d.compliance_rate < 90).length}
          </p>
          <p className="text-sm text-orange-400 mt-2">70-89% compliant</p>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-dark-400 text-sm font-medium">Critical</p>
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-4xl font-bold text-white">
            {departmentCompliance.filter((d) => d.compliance_rate < 70).length}
          </p>
          <p className="text-sm text-red-400 mt-2">&lt;70% compliant</p>
        </div>
      </div>

      {/* Department List */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Department Breakdown</h3>

        <div className="space-y-4">
          {sortedDepartments.map((dept) => (
            <div
              key={dept.department_id}
              className="bg-dark-900/50 border border-dark-700/50 rounded-xl overflow-hidden hover:border-dark-600 transition-all"
            >
              {/* Department Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === dept.department_id ? null : dept.department_id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button className="text-dark-400 hover:text-white transition-colors">
                      {expandedId === dept.department_id ? (
                        <ChevronDownIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                      )}
                    </button>

                    <div className={`p-2 rounded-lg ${getComplianceBgColor(dept.compliance_rate)}`}>
                      <BuildingOfficeIcon className={`h-5 w-5 ${getComplianceTextColor(dept.compliance_rate)}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold">{dept.department_name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4 text-dark-500" />
                          <span className="text-sm text-dark-400">
                            {dept.employees_count} employees
                          </span>
                        </div>
                        <span className="text-sm text-dark-400">
                          {dept.compliant_employees} compliant
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Score */}
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${getComplianceTextColor(dept.compliance_rate)}`}>
                      {Math.round(dept.compliance_rate)}%
                    </p>
                    <p className="text-xs text-dark-500 mt-1">Compliance Rate</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getComplianceColor(dept.compliance_rate)} transition-all duration-500`}
                      style={{ width: `${dept.compliance_rate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === dept.department_id && (
                <div className="border-t border-dark-700/50 bg-dark-800/30 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-900/50 rounded-lg p-4">
                      <p className="text-sm text-dark-500 mb-1">Total Employees</p>
                      <p className="text-2xl font-bold text-white">{dept.employees_count}</p>
                    </div>

                    <div className="bg-dark-900/50 rounded-lg p-4">
                      <p className="text-sm text-dark-500 mb-1">Compliant</p>
                      <p className="text-2xl font-bold text-emerald-400">{dept.compliant_employees}</p>
                    </div>

                    <div className="bg-dark-900/50 rounded-lg p-4">
                      <p className="text-sm text-dark-500 mb-1">Non-Compliant</p>
                      <p className="text-2xl font-bold text-red-400">
                        {dept.employees_count - dept.compliant_employees}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 px-4 py-2 bg-copper-600 hover:bg-copper-700 text-white text-sm font-medium rounded-lg transition-colors">
                      View Employees
                    </button>
                    <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Send Reminders
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
