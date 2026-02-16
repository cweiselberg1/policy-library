'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { DepartmentNode, CreateDepartmentRequest } from '@/types/employee-management';
import { orgStorage } from '@/lib/supabase/org-storage';

interface CreateDepartmentModalProps {
  onClose: () => void;
  onCreated: () => void;
  departments: DepartmentNode[];
}

export default function CreateDepartmentModal({
  onClose,
  onCreated,
  departments,
}: CreateDepartmentModalProps) {
  const [formData, setFormData] = useState<Partial<CreateDepartmentRequest>>({
    name: '',
    description: '',
    parent_id: null,
    budget: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const saved = JSON.parse(orgStorage.getItem('hipaa-departments') || '[]');

      const newDepartment: DepartmentNode = {
        id: `dept-${Date.now()}`,
        organization_id: 'local',
        name: formData.name || '',
        description: formData.description || null,
        parent_id: formData.parent_id || null,
        manager_id: null,
        budget: formData.budget ? Number(formData.budget) : null,
        status: 'active',
        metadata: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: [],
      };

      saved.push(newDepartment);
      orgStorage.setItem('hipaa-departments', JSON.stringify(saved));

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const flattenDepartments = (depts: DepartmentNode[], prefix = ''): Array<{ id: string; name: string }> => {
    let result: Array<{ id: string; name: string }> = [];
    depts.forEach((dept) => {
      result.push({ id: dept.id, name: prefix + dept.name });
      if (dept.children && dept.children.length > 0) {
        result = result.concat(flattenDepartments(dept.children, prefix + '  └─ '));
      }
    });
    return result;
  };

  const flatDepartments = flattenDepartments(departments);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-2xl font-bold text-white">Create Department</h2>
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

          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-evergreen-500/50 focus:border-evergreen-500 transition-all"
              placeholder="e.g., Engineering, Human Resources"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-evergreen-500/50 focus:border-evergreen-500 transition-all resize-none"
              placeholder="Brief description of this department's purpose..."
            />
          </div>

          {/* Parent Department */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Parent Department
            </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parent_id: e.target.value || null,
                })
              }
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-evergreen-500/50 focus:border-evergreen-500 transition-all"
            >
              <option value="">None (Top Level)</option>
              {flatDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="text-dark-500 text-sm mt-2">
              Select a parent to create a sub-department
            </p>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Annual Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">$</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.budget || ''}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full pl-8 pr-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-evergreen-500/50 focus:border-evergreen-500 transition-all"
                placeholder="0"
              />
            </div>
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
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-evergreen-600 to-evergreen-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-evergreen-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
