'use client';

import { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeWithDepartment } from '@/types/employee-management';

interface TrainingAssignment {
  id: string;
  employee_id: string;
  module_id: string;
  module_name: string;
  assigned_at: string;
  due_date: string | null;
  status: 'assigned' | 'in_progress' | 'completed';
  completed_at: string | null;
}

interface EmployeeListProps {
  employees: EmployeeWithDepartment[];
  onEmployeeUpdated: () => void;
  onAssignTraining?: (employeeIds: string[]) => void;
}

export default function EmployeeList({ employees, onEmployeeUpdated, onAssignTraining }: EmployeeListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trainingAssignments, setTrainingAssignments] = useState<TrainingAssignment[]>([]);

  useEffect(() => {
    // Load training assignments from localStorage
    const loadTrainingAssignments = () => {
      try {
        const saved = localStorage.getItem('hipaa-training-assignments');
        if (saved) {
          setTrainingAssignments(JSON.parse(saved));
        }
      } catch {
        setTrainingAssignments([]);
      }
    };

    loadTrainingAssignments();
    // Reload when employees are updated
    window.addEventListener('storage', loadTrainingAssignments);
    return () => window.removeEventListener('storage', loadTrainingAssignments);
  }, [employees]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
      case 'inactive':
        return 'bg-dark-500/20 text-dark-400 border-dark-500/20';
      case 'on_leave':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
      case 'terminated':
        return 'bg-red-500/20 text-red-400 border-red-500/20';
      default:
        return 'bg-dark-500/20 text-dark-400 border-dark-500/20';
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

  const getEmployeeTrainingStatus = (employeeId: string) => {
    const assignments = trainingAssignments.filter((a) => a.employee_id === employeeId);

    if (assignments.length === 0) {
      return { status: 'not_assigned', label: 'Not Assigned', color: 'bg-dark-500/20 text-dark-400 border-dark-500/20', completed: 0, total: 0 };
    }

    const completed = assignments.filter((a) => a.status === 'completed').length;
    const inProgress = assignments.filter((a) => a.status === 'in_progress').length;
    const total = assignments.length;

    if (completed === total) {
      return { status: 'completed', label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20', completed, total };
    } else if (inProgress > 0 || completed > 0) {
      return { status: 'in_progress', label: 'In Progress', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20', completed, total };
    } else {
      return { status: 'assigned', label: 'Assigned', color: 'bg-copper-500/20 text-copper-400 border-copper-500/20', completed, total };
    }
  };

  const getEmployeeTrainingModules = (employeeId: string) => {
    return trainingAssignments.filter((a) => a.employee_id === employeeId);
  };

  return (
    <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-900/50 border-b border-dark-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Training
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/50">
            {employees.map((employee) => {
              const trainingStatus = getEmployeeTrainingStatus(employee.id);
              return (
              <>
                <tr
                  key={employee.id}
                  className="hover:bg-dark-700/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === employee.id ? null : employee.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-copper-500/10">
                        <UserCircleIcon className="h-6 w-6 text-copper-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{employee.full_name || employee.position_title || 'Unnamed'}</p>
                        <p className="text-sm text-dark-400">{employee.email || employee.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-dark-400" />
                      <span className="text-dark-300">
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
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${trainingStatus.color}`}
                      >
                        <AcademicCapIcon className="h-3.5 w-3.5" />
                        {trainingStatus.label}
                      </span>
                      {trainingStatus.total > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-dark-700/50 rounded-full h-1.5">
                            <div
                              className="bg-copper-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${(trainingStatus.completed / trainingStatus.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-dark-400">
                            {trainingStatus.completed}/{trainingStatus.total}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-300">
                    {formatEmploymentType(employee.employment_type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-dark-400" />
                      <span className="text-dark-300">{formatDate(employee.start_date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-copper-400 hover:text-copper-300 font-medium transition-colors">
                      {expandedId === employee.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>

                {expandedId === employee.id && (
                  <tr className="bg-dark-900/30">
                    <td colSpan={7} className="px-6 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Contact Info */}
                        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
                          <h4 className="text-sm font-semibold text-dark-400 mb-3 uppercase tracking-wide">
                            Contact Information
                          </h4>
                          <div className="space-y-2">
                            {employee.phone && (
                              <div className="flex items-center gap-2 text-dark-300">
                                <PhoneIcon className="h-4 w-4 text-dark-500" />
                                <span className="text-sm">{employee.phone}</span>
                              </div>
                            )}
                            {employee.mobile_phone && (
                              <div className="flex items-center gap-2 text-dark-300">
                                <PhoneIcon className="h-4 w-4 text-dark-500" />
                                <span className="text-sm">{employee.mobile_phone} (Mobile)</span>
                              </div>
                            )}
                            {employee.location && (
                              <div className="flex items-center gap-2 text-dark-300">
                                <MapPinIcon className="h-4 w-4 text-dark-500" />
                                <span className="text-sm">{employee.location}</span>
                              </div>
                            )}
                            {!employee.phone && !employee.mobile_phone && !employee.location && (
                              <p className="text-sm text-dark-500">No contact information</p>
                            )}
                          </div>
                        </div>

                        {/* Employment Details */}
                        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
                          <h4 className="text-sm font-semibold text-dark-400 mb-3 uppercase tracking-wide">
                            Employment Details
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-dark-500">Employee ID</p>
                              <p className="text-sm text-white font-mono">{employee.employee_id}</p>
                            </div>
                            {employee.salary_grade && (
                              <div>
                                <p className="text-xs text-dark-500">Salary Grade</p>
                                <p className="text-sm text-white">{employee.salary_grade}</p>
                              </div>
                            )}
                            {employee.manager_id && (
                              <div>
                                <p className="text-xs text-dark-500">Manager</p>
                                <p className="text-sm text-white">Assigned</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
                          <h4 className="text-sm font-semibold text-dark-400 mb-3 uppercase tracking-wide">
                            Skills
                          </h4>
                          {employee.skills && employee.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {employee.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-copper-500/10 text-copper-400 text-xs rounded-lg border border-copper-500/20"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-dark-500">No skills listed</p>
                          )}
                        </div>

                        {/* Training Status */}
                        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
                          <h4 className="text-sm font-semibold text-dark-400 mb-3 uppercase tracking-wide">
                            Training Status
                          </h4>
                          {(() => {
                            const modules = getEmployeeTrainingModules(employee.id);
                            if (modules.length === 0) {
                              return (
                                <div className="text-center py-2">
                                  <p className="text-sm text-dark-500 mb-3">No training assigned</p>
                                  {onAssignTraining && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAssignTraining([employee.id]);
                                      }}
                                      className="text-xs text-copper-400 hover:text-copper-300 font-medium transition-colors"
                                    >
                                      Assign Training →
                                    </button>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div className="space-y-2">
                                {modules.map((module) => (
                                  <div key={module.id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm text-white">{module.module_name}</p>
                                      {module.due_date && (
                                        <p className="text-xs text-dark-500">
                                          Due: {formatDate(module.due_date)}
                                        </p>
                                      )}
                                    </div>
                                    {module.status === 'completed' ? (
                                      <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                                    ) : module.status === 'in_progress' ? (
                                      <ClockIcon className="h-4 w-4 text-amber-400" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border-2 border-copper-400" />
                                    )}
                                  </div>
                                ))}
                                {onAssignTraining && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAssignTraining([employee.id]);
                                    }}
                                    className="text-xs text-copper-400 hover:text-copper-300 font-medium transition-colors mt-2"
                                  >
                                    Assign More Training →
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button className="px-4 py-2 bg-copper-600 hover:bg-copper-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Edit Employee
                        </button>
                        {onAssignTraining && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssignTraining([employee.id]);
                            }}
                            className="px-4 py-2 bg-copper-600 hover:bg-copper-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Assign Training
                          </button>
                        )}
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Assign Policies
                        </button>
                        <button className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm font-medium rounded-lg transition-colors">
                          View Compliance
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
            })}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-500">No employees match your filters</p>
        </div>
      )}
    </div>
  );
}
