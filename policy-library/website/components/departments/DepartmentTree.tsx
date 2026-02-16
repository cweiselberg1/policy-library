'use client';

import { useState } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { DepartmentNode } from '@/types/employee-management';
import { orgStorage } from '@/lib/supabase/org-storage';

interface DepartmentTreeProps {
  departments: DepartmentNode[];
  onDepartmentUpdated: () => void;
}

export default function DepartmentTree({ departments, onDepartmentUpdated }: DepartmentTreeProps) {
  return (
    <div className="space-y-2">
      {departments.map((dept) => (
        <DepartmentTreeNode
          key={dept.id}
          department={dept}
          depth={0}
          onDepartmentUpdated={onDepartmentUpdated}
        />
      ))}
    </div>
  );
}

interface DepartmentTreeNodeProps {
  department: DepartmentNode;
  depth: number;
  onDepartmentUpdated: () => void;
}

function DepartmentTreeNode({ department, depth, onDepartmentUpdated }: DepartmentTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = department.children && department.children.length > 0;

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${department.name}"?`)) {
      return;
    }

    try {
      const saved = JSON.parse(orgStorage.getItem('hipaa-departments') || '[]');
      const filtered = saved.filter((dept: DepartmentNode) => dept.id !== department.id);
      orgStorage.setItem('hipaa-departments', JSON.stringify(filtered));
      onDepartmentUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete department');
    }
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-3 p-4 rounded-xl transition-all ${
          depth === 0
            ? 'bg-dark-700/30 hover:bg-dark-700/50'
            : 'bg-dark-800/30 hover:bg-dark-800/50'
        }`}
        style={{ marginLeft: `${depth * 2}rem` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-dark-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        )}

        {!hasChildren && <div className="w-5" />}

        {/* Department Icon */}
        <div
          className={`p-2 rounded-lg ${
            depth === 0
              ? 'bg-evergreen-500/20 text-evergreen-400'
              : 'bg-dark-600/30 text-dark-400'
          }`}
        >
          <BuildingOfficeIcon className="h-5 w-5" />
        </div>

        {/* Department Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-white font-semibold truncate">{department.name}</h4>
            {department.status === 'inactive' && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                Inactive
              </span>
            )}
          </div>
          {department.description && (
            <p className="text-dark-400 text-sm mt-1 truncate">{department.description}</p>
          )}
        </div>

        {/* Employee Count */}
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <UserGroupIcon className="h-4 w-4" />
          <span>0 employees</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-dark-400 hover:text-copper-400 transition-colors">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {department.children!.map((child) => (
            <DepartmentTreeNode
              key={child.id}
              department={child}
              depth={depth + 1}
              onDepartmentUpdated={onDepartmentUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
