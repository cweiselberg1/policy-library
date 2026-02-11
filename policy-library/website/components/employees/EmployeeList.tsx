'use client';

import { useState } from 'react';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeWithDepartment } from '@/types/employee-management';

interface EmployeeListProps {
  employees: EmployeeWithDepartment[];
  onEmployeeUpdated: () => void;
}

export default function EmployeeList({ employees, onEmployeeUpdated }: EmployeeListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
      case 'inactive':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
      case 'on_leave':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
      case 'terminated':
        return 'bg-red-500/20 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'inactive':
        return <XCircleIcon className="h-4 w-4" />;
      case 'on_leave':
        return <ClockIcon className="h-4 w-4" />;
      case 'terminated':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatEmploymentType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
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
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {employees.map((employee) => (
              <>
                <tr
                  key={employee.id}
                  className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === employee.id ? null : employee.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <UserCircleIcon className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{employee.position_title}</p>
                        <p className="text-sm text-slate-400">{employee.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">
                        {employee.department?.name || 'No Department'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                        employee.employment_status
                      )}`}
                    >
                      {getStatusIcon(employee.employment_status)}
                      {employee.employment_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {formatEmploymentType(employee.employment_type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{formatDate(employee.start_date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      {expandedId === employee.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>

                {expandedId === employee.id && (
                  <tr className="bg-slate-900/30">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Contact Info */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                          <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                            Contact Information
                          </h4>
                          <div className="space-y-2">
                            {employee.phone && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <PhoneIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">{employee.phone}</span>
                              </div>
                            )}
                            {employee.mobile_phone && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <PhoneIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">{employee.mobile_phone} (Mobile)</span>
                              </div>
                            )}
                            {employee.location && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <MapPinIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">{employee.location}</span>
                              </div>
                            )}
                            {!employee.phone && !employee.mobile_phone && !employee.location && (
                              <p className="text-sm text-slate-500">No contact information</p>
                            )}
                          </div>
                        </div>

                        {/* Employment Details */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                          <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                            Employment Details
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-slate-500">Employee ID</p>
                              <p className="text-sm text-white font-mono">{employee.employee_id}</p>
                            </div>
                            {employee.salary_grade && (
                              <div>
                                <p className="text-xs text-slate-500">Salary Grade</p>
                                <p className="text-sm text-white">{employee.salary_grade}</p>
                              </div>
                            )}
                            {employee.manager_id && (
                              <div>
                                <p className="text-xs text-slate-500">Manager</p>
                                <p className="text-sm text-white">Assigned</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                          <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                            Skills
                          </h4>
                          {employee.skills && employee.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {employee.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-lg border border-cyan-500/20"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No skills listed</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Edit Employee
                        </button>
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Assign Policies
                        </button>
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors">
                          View Compliance
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No employees match your filters</p>
        </div>
      )}
    </div>
  );
}
