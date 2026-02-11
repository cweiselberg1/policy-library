'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import InviteEmployeeModal from '@/components/employees/InviteEmployeeModal';
import EmployeeList from '@/components/employees/EmployeeList';
import type { EmployeeWithDepartment, Department } from '@/types/employee-management';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments'),
      ]);

      if (employeesRes.status === 401 || departmentsRes.status === 401) {
        router.push('/login');
        return;
      }

      if (!employeesRes.ok || !departmentsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const employeesData = await employeesRes.json();
      const departmentsData = await departmentsRes.json();

      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeInvited = () => {
    setShowInviteModal(false);
    fetchData();
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchTerm === '' ||
      employee.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === 'all' || employee.department_id === filterDepartment;

    const matchesStatus =
      filterStatus === 'all' || employee.employment_status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Loading employees...</p>
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
                className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Employee Management
                </h1>
                <p className="mt-2 text-slate-400">Invite and manage employee access</p>
              </div>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Invite Employee
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
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
              className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">Total</p>
            <p className="text-4xl font-bold text-white">{employees.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">Active</p>
            <p className="text-4xl font-bold text-white">
              {employees.filter((e) => e.employment_status === 'active').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">On Leave</p>
            <p className="text-4xl font-bold text-white">
              {employees.filter((e) => e.employment_status === 'on_leave').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">Filtered</p>
            <p className="text-4xl font-bold text-white">{filteredEmployees.length}</p>
          </div>
        </div>

        {/* Employee List */}
        {error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-blue-500/10 mb-6">
              <PlusIcon className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Employees Yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Invite your first employee to get started with compliance tracking.
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all"
            >
              Invite First Employee
            </button>
          </div>
        ) : (
          <EmployeeList
            employees={filteredEmployees}
            onEmployeeUpdated={fetchData}
          />
        )}
      </main>

      {showInviteModal && (
        <InviteEmployeeModal
          onClose={() => setShowInviteModal(false)}
          onInvited={handleEmployeeInvited}
          departments={departments}
        />
      )}
    </div>
  );
}
