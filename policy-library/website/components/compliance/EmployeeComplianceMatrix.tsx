'use client';

import { useState } from 'react';
import {
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface EmployeeCompliance {
  employee_id: string;
  employee_name: string;
  department_name: string;
  assigned_policies: number;
  completed_policies: number;
  compliance_rate: number;
  pending_attestations: string[];
}

interface EmployeeComplianceMatrixProps {
  employeeCompliance: EmployeeCompliance[];
}

export default function EmployeeComplianceMatrix({ employeeCompliance }: EmployeeComplianceMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'pending' | 'non-compliant'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'compliance' | 'pending'>('compliance');

  const getStatusColor = (rate: number) => {
    if (rate === 100) return 'text-emerald-400';
    if (rate >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusBadge = (rate: number) => {
    if (rate === 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded border border-emerald-500/20">
          <CheckCircleIcon className="h-3 w-3" />
          Compliant
        </span>
      );
    }
    if (rate >= 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded border border-orange-500/20">
          <ClockIcon className="h-3 w-3" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded border border-red-500/20">
        <XCircleIcon className="h-3 w-3" />
        Non-Compliant
      </span>
    );
  };

  // Filter and sort
  let filteredEmployees = employeeCompliance.filter((emp) => {
    const matchesSearch =
      searchTerm === '' ||
      emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'compliant' && emp.compliance_rate === 100) ||
      (filterStatus === 'pending' && emp.compliance_rate >= 70 && emp.compliance_rate < 100) ||
      (filterStatus === 'non-compliant' && emp.compliance_rate < 70);

    return matchesSearch && matchesFilter;
  });

  // Sort
  filteredEmployees = filteredEmployees.sort((a, b) => {
    if (sortBy === 'name') {
      return a.employee_name.localeCompare(b.employee_name);
    }
    if (sortBy === 'compliance') {
      return a.compliance_rate - b.compliance_rate;
    }
    if (sortBy === 'pending') {
      return b.pending_attestations.length - a.pending_attestations.length;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="compliant">Compliant (100%)</option>
              <option value="pending">Pending (70-99%)</option>
              <option value="non-compliant">Non-Compliant (&lt;70%)</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
          >
            <option value="name">Sort: Name</option>
            <option value="compliance">Sort: Compliance</option>
            <option value="pending">Sort: Pending</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          Showing {filteredEmployees.length} of {employeeCompliance.length} employees
        </p>
      </div>

      {/* Employee Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredEmployees.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-slate-700/30 transition-colors">
                  {/* Employee Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <UserCircleIcon className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{employee.employee_name}</p>
                        <p className="text-sm text-slate-400">{employee.employee_id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{employee.department_name}</span>
                  </td>

                  {/* Progress */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                          {employee.completed_policies}/{employee.assigned_policies}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            employee.compliance_rate === 100
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              : employee.compliance_rate >= 70
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                              : 'bg-gradient-to-r from-red-500 to-rose-500'
                          }`}
                          style={{ width: `${employee.compliance_rate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Compliance Rate */}
                  <td className="px-6 py-4">
                    <p className={`text-2xl font-bold ${getStatusColor(employee.compliance_rate)}`}>
                      {Math.round(employee.compliance_rate)}%
                    </p>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">{getStatusBadge(employee.compliance_rate)}</td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {employee.pending_attestations.length > 0 && (
                        <button className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-lg transition-colors">
                          Send Reminder
                        </button>
                      )}
                      <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No employees match your filters</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Fully Compliant</p>
          <p className="text-4xl font-bold text-white">
            {filteredEmployees.filter((e) => e.compliance_rate === 100).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">In Progress</p>
          <p className="text-4xl font-bold text-white">
            {filteredEmployees.filter((e) => e.compliance_rate >= 70 && e.compliance_rate < 100).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Non-Compliant</p>
          <p className="text-4xl font-bold text-white">
            {filteredEmployees.filter((e) => e.compliance_rate < 70).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Pending Attestations</p>
          <p className="text-4xl font-bold text-white">
            {filteredEmployees.reduce((sum, e) => sum + e.pending_attestations.length, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
