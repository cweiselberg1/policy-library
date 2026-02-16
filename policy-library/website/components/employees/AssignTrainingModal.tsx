'use client';

import { useState } from 'react';
import { XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import type { EmployeeWithDepartment } from '@/types/employee-management';
import { orgStorage } from '@/lib/supabase/org-storage';

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

interface AssignTrainingModalProps {
  onClose: () => void;
  onAssigned: () => void;
  selectedEmployees: EmployeeWithDepartment[];
}

const TRAINING_MODULES = [
  {
    id: 'policies',
    name: 'Policy Review',
    description: 'Review and acknowledge all required HIPAA policies',
    duration: '30 min',
  },
  {
    id: 'hipaa-101',
    name: 'HIPAA 101',
    description: 'Learn fundamentals of HIPAA compliance and patient rights',
    duration: '45 min',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Awareness',
    description: 'Master security practices and threat recognition',
    duration: '40 min',
  },
];

export default function AssignTrainingModal({
  onClose,
  onAssigned,
  selectedEmployees,
}: AssignTrainingModalProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedModules.length === 0) {
      setError('Please select at least one training module');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Load existing assignments
      const existingAssignments: TrainingAssignment[] = JSON.parse(
        orgStorage.getItem('hipaa-training-assignments') || '[]'
      );

      // Create new assignments for each employee and module combination
      const newAssignments: TrainingAssignment[] = [];
      const now = new Date().toISOString();

      selectedEmployees.forEach((employee) => {
        selectedModules.forEach((moduleId) => {
          const module = TRAINING_MODULES.find((m) => m.id === moduleId);
          if (module) {
            // Check if assignment already exists
            const existingAssignment = existingAssignments.find(
              (a) => a.employee_id === employee.id && a.module_id === moduleId
            );

            if (!existingAssignment) {
              newAssignments.push({
                id: `ta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                employee_id: employee.id,
                module_id: moduleId,
                module_name: module.name,
                assigned_at: now,
                due_date: dueDate || null,
                status: 'assigned',
                completed_at: null,
              });
            }
          }
        });
      });

      // Save all assignments
      const updatedAssignments = [...existingAssignments, ...newAssignments];
      orgStorage.setItem('hipaa-training-assignments', JSON.stringify(updatedAssignments));

      setSuccess(true);
      setTimeout(() => {
        onAssigned();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign training');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 mb-4">
            <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Training Assigned!</h3>
          <p className="text-dark-400">
            {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} assigned to{' '}
            {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-copper-500/10">
              <AcademicCapIcon className="h-6 w-6 text-copper-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Assign Training</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Selected Employees Summary */}
          <div className="bg-copper-500/10 border border-copper-500/20 rounded-xl p-4">
            <p className="text-copper-300 text-sm font-medium mb-2">
              Assigning training to {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((emp) => (
                <span
                  key={emp.id}
                  className="px-3 py-1 bg-dark-700/50 text-dark-300 text-sm rounded-lg"
                >
                  {emp.position_title}
                </span>
              ))}
            </div>
          </div>

          {/* Training Modules */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">
              Select Training Modules *
            </label>
            <div className="space-y-3">
              {TRAINING_MODULES.map((module) => (
                <label
                  key={module.id}
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedModules.includes(module.id)
                      ? 'bg-copper-500/10 border-copper-500/50'
                      : 'bg-dark-900/50 border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.id)}
                      onChange={() => handleToggleModule(module.id)}
                      className="mt-1 h-5 w-5 rounded border-dark-600 bg-dark-700 text-copper-500 focus:ring-2 focus:ring-copper-500/50 focus:ring-offset-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white">{module.name}</h4>
                        <span className="text-xs text-dark-400">{module.duration}</span>
                      </div>
                      <p className="text-sm text-dark-400">{module.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-copper-500/50 focus:border-copper-500 transition-all"
            />
            <p className="text-xs text-dark-500 mt-2">
              Leave blank if no specific deadline is required
            </p>
          </div>

          {/* Info */}
          <div className="bg-copper-500/10 border border-copper-500/20 rounded-xl p-4">
            <p className="text-copper-300 text-sm">
              Employees will be notified of their training assignments and can access them from their dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-dark-700 text-white font-semibold rounded-xl hover:bg-dark-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedModules.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-copper-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : `Assign Training`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
