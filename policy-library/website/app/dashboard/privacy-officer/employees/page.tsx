'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, MagnifyingGlassIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import InviteEmployeeModal from '@/components/employees/InviteEmployeeModal';
import AssignTrainingModal from '@/components/employees/AssignTrainingModal';
import EmployeeList from '@/components/employees/EmployeeList';
import type { EmployeeWithDepartment, Department } from '@/types/employee-management';

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTraining, setFilterTraining] = useState<string>('all');
  const [trainingAssignments, setTrainingAssignments] = useState<TrainingAssignment[]>([]);

  const loadData = () => {
    try {
      const savedEmployees = JSON.parse(localStorage.getItem('hipaa-employees') || '[]');
      const savedDepts = JSON.parse(localStorage.getItem('hipaa-departments') || '[]');
      const savedAssignments = JSON.parse(localStorage.getItem('hipaa-training-assignments') || '[]');
      setEmployees(savedEmployees);
      setDepartments(savedDepts);
      setTrainingAssignments(savedAssignments);
    } catch {
      setEmployees([]);
      setDepartments([]);
      setTrainingAssignments([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeTrainingStatus = (employeeId: string) => {
    const assignments = trainingAssignments.filter((a) => a.employee_id === employeeId);

    if (assignments.length === 0) return 'not_assigned';

    const completed = assignments.filter((a) => a.status === 'completed').length;
    const inProgress = assignments.filter((a) => a.status === 'in_progress').length;
    const total = assignments.length;

    if (completed === total) return 'completed';
    if (inProgress > 0 || completed > 0) return 'in_progress';
    return 'assigned';
  };

  const handleEmployeeInvited = () => {
    setShowInviteModal(false);
    loadData();
  };

  const handleTrainingAssigned = () => {
    setShowTrainingModal(false);
    setSelectedEmployeeIds([]);
    loadData();
  };

  const handleAssignTraining = (employeeIds: string[]) => {
    setSelectedEmployeeIds(employeeIds);
    setShowTrainingModal(true);
  };

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleToggleAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map((e) => e.id));
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchTerm === '' ||
      (employee.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === 'all' || employee.department_id === filterDepartment;

    const matchesStatus =
      filterStatus === 'all' || employee.employment_status === filterStatus;

    const matchesTraining =
      filterTraining === 'all' || getEmployeeTrainingStatus(employee.id) === filterTraining;

    return matchesSearch && matchesDepartment && matchesStatus && matchesTraining;
  });

  // Calculate training stats
  const trainingCompleted = employees.filter((e) => getEmployeeTrainingStatus(e.id) === 'completed').length;
  const trainingPending = employees.filter((e) => {
    const status = getEmployeeTrainingStatus(e.id);
    return status === 'not_assigned' || status === 'assigned' || status === 'in_progress';
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/privacy-officer"
                className="p-2 text-dark-400 hover:text-copper-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 to-copper-300 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                  Employee Management
                </h1>
                <p className="mt-2 text-dark-400">Invite and manage employee access & training</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedEmployeeIds.length > 0 && (
                <button
                  onClick={() => handleAssignTraining(selectedEmployeeIds)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-copper-500/20 transition-all"
                >
                  <AcademicCapIcon className="h-5 w-5" />
                  Assign Training ({selectedEmployeeIds.length})
                </button>
              )}
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-copper-500/20 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Invite Employee
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-copper-500/50 focus:border-copper-500 transition-all"
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-copper-500/50 focus:border-copper-500 transition-all"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-copper-500/50 focus:border-copper-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>

            {/* Training Filter */}
            <select
              value={filterTraining}
              onChange={(e) => setFilterTraining(e.target.value)}
              className="px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-copper-500/50 focus:border-copper-500 transition-all"
            >
              <option value="all">All Training</option>
              <option value="not_assigned">Not Assigned</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-copper-500/10 to-copper-400/10 backdrop-blur-xl border border-copper-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm font-medium mb-2">Total</p>
            <p className="text-4xl font-bold text-white">{employees.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm font-medium mb-2">Active</p>
            <p className="text-4xl font-bold text-white">
              {employees.filter((e) => e.employment_status === 'active').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-evergreen-500/10 to-evergreen-400/10 backdrop-blur-xl border border-evergreen-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm font-medium mb-2">Training Complete</p>
            <p className="text-4xl font-bold text-white">{trainingCompleted}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm font-medium mb-2">Training Pending</p>
            <p className="text-4xl font-bold text-white">{trainingPending}</p>
          </div>
          <div className="bg-gradient-to-br from-copper-500/10 to-copper-400/10 backdrop-blur-xl border border-copper-500/20 rounded-2xl p-6">
            <p className="text-dark-400 text-sm font-medium mb-2">Filtered</p>
            <p className="text-4xl font-bold text-white">{filteredEmployees.length}</p>
          </div>
        </div>

        {/* Employee List */}
        {employees.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-copper-500/10 mb-6">
              <PlusIcon className="h-12 w-12 text-copper-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Employees Yet</h3>
            <p className="text-dark-400 mb-8 max-w-md mx-auto">
              Invite your first employee to get started with compliance tracking.
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-copper-500/20 transition-all"
            >
              Invite First Employee
            </button>
          </div>
        ) : (
          <>
            {/* Bulk Actions Bar */}
            {filteredEmployees.length > 0 && (
              <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleToggleAll}
                      className="h-5 w-5 rounded border-dark-600 bg-dark-700 text-copper-500 focus:ring-2 focus:ring-copper-500/50 focus:ring-offset-0"
                    />
                    <span className="text-sm text-dark-300">
                      Select All ({filteredEmployees.length})
                    </span>
                  </label>
                  {selectedEmployeeIds.length > 0 && (
                    <span className="text-sm text-copper-400 font-medium">
                      {selectedEmployeeIds.length} selected
                    </span>
                  )}
                </div>
                {selectedEmployeeIds.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAssignTraining(selectedEmployeeIds)}
                      className="px-4 py-2 bg-gradient-to-r from-copper-600 to-copper-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-copper-500/20 transition-all"
                    >
                      Assign Training
                    </button>
                    <button
                      onClick={() => setSelectedEmployeeIds([])}
                      className="px-4 py-2 bg-dark-700 text-white text-sm font-semibold rounded-lg hover:bg-dark-600 transition-all"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            )}

            <EmployeeList
              employees={filteredEmployees}
              onEmployeeUpdated={loadData}
              onAssignTraining={handleAssignTraining}
            />
          </>
        )}
      </main>

      {showInviteModal && (
        <InviteEmployeeModal
          onClose={() => setShowInviteModal(false)}
          onInvited={handleEmployeeInvited}
          departments={departments}
        />
      )}

      {showTrainingModal && (
        <AssignTrainingModal
          onClose={() => {
            setShowTrainingModal(false);
            setSelectedEmployeeIds([]);
          }}
          onAssigned={handleTrainingAssigned}
          selectedEmployees={employees.filter((e) => selectedEmployeeIds.includes(e.id))}
        />
      )}
    </div>
  );
}
