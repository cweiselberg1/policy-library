'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { orgStorage } from '@/lib/supabase/org-storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Priority = 'critical' | 'high' | 'medium' | 'low';
type Status = 'open' | 'in-progress' | 'completed';
type SortField = 'dueDate' | 'priority' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface RemediationPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes: string;
  hipaaReference: string;
  source: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'hipaa-remediation-plans';

const CATEGORIES = [
  'Administrative Safeguards',
  'Physical Safeguards',
  'Technical Safeguards',
  'Breach Notification',
  'Business Associates',
  'General Compliance',
];

const SOURCES = [
  'SRA Finding',
  'Gap Analysis',
  'Audit Finding',
  'Incident Response',
  'Policy Review',
  'Other',
];

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STATUS_ORDER: Record<Status, number> = {
  open: 0,
  'in-progress': 1,
  completed: 2,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `rp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function isOverdue(plan: RemediationPlan): boolean {
  if (plan.status === 'completed') return false;
  if (!plan.dueDate) return false;
  return new Date(plan.dueDate) < new Date(new Date().toDateString());
}

function priorityColor(p: Priority): string {
  switch (p) {
    case 'critical': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'low': return 'bg-green-500/15 text-green-400 border-green-500/30';
  }
}

function priorityDot(p: Priority): string {
  switch (p) {
    case 'critical': return 'bg-red-400';
    case 'high': return 'bg-orange-400';
    case 'medium': return 'bg-yellow-400';
    case 'low': return 'bg-green-400';
  }
}

function statusColor(s: Status, overdue: boolean): string {
  if (overdue) return 'bg-red-500/15 text-red-400 border-red-500/30';
  switch (s) {
    case 'open': return 'bg-copper-500/15 text-copper-400 border-copper-500/30';
    case 'in-progress': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'completed': return 'bg-green-500/15 text-green-400 border-green-500/30';
  }
}

function statusLabel(s: Status, overdue: boolean): string {
  if (overdue) return 'Overdue';
  switch (s) {
    case 'open': return 'Open';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
  }
}

function formatDate(d: string): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function emptyPlan(): Omit<RemediationPlan, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    description: '',
    category: CATEGORIES[0],
    priority: 'medium',
    status: 'open',
    assignee: '',
    dueDate: '',
    notes: '',
    hipaaReference: '',
    source: SOURCES[0],
  };
}

// ---------------------------------------------------------------------------
// CSV & Markdown export
// ---------------------------------------------------------------------------

function exportCSV(plans: RemediationPlan[]): void {
  const header = [
    'Title', 'Description', 'Category', 'Priority', 'Status', 'Assignee',
    'Due Date', 'Created', 'Updated', 'Completed', 'HIPAA Reference', 'Source', 'Notes',
  ];
  const rows = plans.map((p) => [
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.description.replace(/"/g, '""')}"`,
    p.category,
    p.priority,
    p.status,
    `"${p.assignee.replace(/"/g, '""')}"`,
    p.dueDate,
    p.createdAt,
    p.updatedAt,
    p.completedAt || '',
    p.hipaaReference,
    p.source,
    `"${p.notes.replace(/"/g, '""')}"`,
  ]);
  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csv, 'remediation-plans.csv', 'text/csv');
}

function exportMarkdown(plans: RemediationPlan[]): void {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const total = plans.length;
  const open = plans.filter((p) => p.status === 'open').length;
  const inProgress = plans.filter((p) => p.status === 'in-progress').length;
  const completed = plans.filter((p) => p.status === 'completed').length;
  const overdue = plans.filter((p) => isOverdue(p)).length;

  let md = `# HIPAA Remediation Plans Report\n\n`;
  md += `**Generated:** ${now}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Count |\n|--------|-------|\n`;
  md += `| Total Plans | ${total} |\n`;
  md += `| Open | ${open} |\n`;
  md += `| In Progress | ${inProgress} |\n`;
  md += `| Completed | ${completed} |\n`;
  md += `| Overdue | ${overdue} |\n`;
  md += `| Completion Rate | ${total > 0 ? Math.round((completed / total) * 100) : 0}% |\n\n`;
  md += `---\n\n`;

  const grouped: Record<string, RemediationPlan[]> = {};
  for (const p of plans) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  for (const [cat, items] of Object.entries(grouped)) {
    md += `## ${cat}\n\n`;
    for (const p of items) {
      const od = isOverdue(p);
      md += `### ${p.title}${od ? ' [OVERDUE]' : ''}\n\n`;
      md += `- **Priority:** ${p.priority.charAt(0).toUpperCase() + p.priority.slice(1)}\n`;
      md += `- **Status:** ${od ? 'Overdue' : statusLabel(p.status, false)}\n`;
      md += `- **Assignee:** ${p.assignee || 'Unassigned'}\n`;
      md += `- **Due Date:** ${p.dueDate ? formatDate(p.dueDate) : 'Not set'}\n`;
      md += `- **HIPAA Reference:** ${p.hipaaReference || 'N/A'}\n`;
      md += `- **Source:** ${p.source}\n`;
      if (p.description) md += `\n${p.description}\n`;
      if (p.notes) md += `\n**Notes:** ${p.notes}\n`;
      md += '\n';
    }
  }

  downloadFile(md, 'remediation-plans-report.md', 'text/markdown');
}

function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RemediationPlansPage() {
  // -- State ----------------------------------------------------------------
  const [plans, setPlans] = useState<RemediationPlan[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState<'all' | Status | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPlan());
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // -- Persistence ----------------------------------------------------------

  useEffect(() => {
    try {
      const raw = orgStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          setPlans(data);
        }
      }
    } catch (e) {
      console.error('Failed to load remediation plans:', e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    orgStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans, loaded]);

  // -- Derived data ---------------------------------------------------------

  const counts = useMemo(() => {
    const total = plans.length;
    const open = plans.filter((p) => p.status === 'open').length;
    const inProgress = plans.filter((p) => p.status === 'in-progress').length;
    const completed = plans.filter((p) => p.status === 'completed').length;
    const overdue = plans.filter((p) => isOverdue(p)).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, open, inProgress, completed, overdue, pct };
  }, [plans]);

  const filtered = useMemo(() => {
    let list = [...plans];

    // Status filter
    if (statusFilter === 'overdue') {
      list = list.filter((p) => isOverdue(p));
    } else if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      list = list.filter((p) => p.priority === priorityFilter);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'dueDate': {
          const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          cmp = da - db;
          break;
        }
        case 'priority':
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [plans, statusFilter, priorityFilter, sortField, sortDir]);

  // -- Handlers -------------------------------------------------------------

  const openAddForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyPlan());
    setFormError('');
    setShowForm(true);
  }, []);

  const openEditForm = useCallback((plan: RemediationPlan) => {
    setEditingId(plan.id);
    setForm({
      title: plan.title,
      description: plan.description,
      category: plan.category,
      priority: plan.priority,
      status: plan.status,
      assignee: plan.assignee,
      dueDate: plan.dueDate,
      notes: plan.notes,
      hipaaReference: plan.hipaaReference,
      source: plan.source,
    });
    setFormError('');
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyPlan());
    setFormError('');
  }, []);

  const saveForm = useCallback(() => {
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== editingId) return p;
          const wasCompleted = p.status === 'completed';
          const nowCompleted = form.status === 'completed';
          return {
            ...p,
            ...form,
            updatedAt: now,
            completedAt: nowCompleted && !wasCompleted ? now : nowCompleted ? p.completedAt : undefined,
          };
        })
      );
    } else {
      const newPlan: RemediationPlan = {
        id: generateId(),
        ...form,
        createdAt: now,
        updatedAt: now,
        completedAt: form.status === 'completed' ? now : undefined,
      };
      setPlans((prev) => [...prev, newPlan]);
    }

    closeForm();
  }, [form, editingId, closeForm]);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  }, []);

  const markComplete = useCallback((id: string) => {
    const now = new Date().toISOString();
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'completed' as Status, completedAt: now, updatedAt: now }
          : p
      )
    );
  }, []);

  // -- Render ---------------------------------------------------------------

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-dark-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* -- Header --------------------------------------------------------- */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href="/dashboard/privacy-officer"
                className="text-sm text-copper-400 hover:text-copper-300 font-medium transition-colors"
              >
                &larr; Back to Dashboard
              </Link>
              <h1
                className="mt-1 text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent"
                style={{ fontFamily: 'var(--font-dm-serif)' }}
              >
                Remediation Plans
              </h1>
              <p className="mt-1 text-dark-400">Track and manage compliance remediation action items</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => exportCSV(plans)}
                disabled={plans.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-dark-600 text-dark-300 hover:border-copper-500/50 hover:text-copper-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={() => exportMarkdown(plans)}
                disabled={plans.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-dark-600 text-dark-300 hover:border-copper-500/50 hover:text-copper-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <DocumentTextIcon className="h-4 w-4" />
                Report
              </button>
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-copper-600 to-copper-500 text-white hover:shadow-lg hover:shadow-copper-500/20 transition-all"
              >
                <PlusIcon className="h-4 w-4" />
                Add New Plan
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* -- Dashboard Summary -------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {([
            { label: 'Total', value: counts.total, icon: WrenchScrewdriverIcon, gradient: 'from-dark-500/10 to-dark-500/10', border: 'border-dark-500/20', text: 'text-dark-300' },
            { label: 'Open', value: counts.open, icon: DocumentTextIcon, gradient: 'from-copper-500/10 to-copper-400/10', border: 'border-copper-500/20', text: 'text-copper-400' },
            { label: 'In Progress', value: counts.inProgress, icon: ClockIcon, gradient: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
            { label: 'Completed', value: counts.completed, icon: CheckCircleIcon, gradient: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-400' },
            { label: 'Overdue', value: counts.overdue, icon: ExclamationTriangleIcon, gradient: 'from-red-500/10 to-pink-500/10', border: 'border-red-500/20', text: 'text-red-400' },
            { label: 'Completion', value: `${counts.pct}%`, icon: CheckCircleSolidIcon, gradient: 'from-copper-500/10 to-copper-400/10', border: 'border-copper-500/20', text: 'text-copper-400' },
          ] as const).map((card) => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.border} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-dark-400 truncate">{card.label}</p>
                <card.icon className={`h-4 w-4 ${card.text} flex-shrink-0`} />
              </div>
              <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Completion progress bar */}
        {counts.total > 0 && (
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-dark-300">Overall Completion</span>
              <span className="text-sm font-semibold text-copper-400">{counts.pct}%</span>
            </div>
            <div className="w-full bg-dark-700/50 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-copper-500 to-copper-400 transition-all duration-500"
                style={{ width: `${counts.pct}%` }}
              />
            </div>
          </div>
        )}

        {/* -- Filters & Sort ----------------------------------------------- */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-dark-400" />
              <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">Status</span>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'open', 'in-progress', 'completed', 'overdue'] as const).map((val) => {
                  const active = statusFilter === val;
                  const label =
                    val === 'all' ? 'All'
                    : val === 'in-progress' ? 'In Progress'
                    : val === 'overdue' ? `Overdue`
                    : val.charAt(0).toUpperCase() + val.slice(1);

                  const count =
                    val === 'all' ? counts.total
                    : val === 'open' ? counts.open
                    : val === 'in-progress' ? counts.inProgress
                    : val === 'completed' ? counts.completed
                    : counts.overdue;

                  return (
                    <button
                      key={val}
                      onClick={() => setStatusFilter(val)}
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        active
                          ? 'bg-copper-500/15 border-copper-500/40 text-copper-400'
                          : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-300'
                      }`}
                    >
                      {label}
                      <span className={`ml-0.5 ${active ? 'text-copper-300' : 'text-dark-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-6 w-px bg-dark-700 hidden sm:block" />

            {/* Priority filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">Priority</span>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((val) => {
                  const active = priorityFilter === val;
                  const label = val === 'all' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1);
                  return (
                    <button
                      key={val}
                      onClick={() => setPriorityFilter(val)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        active
                          ? 'bg-copper-500/15 border-copper-500/40 text-copper-400'
                          : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-6 w-px bg-dark-700 hidden sm:block" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowsUpDownIcon className="h-4 w-4 text-dark-400" />
              <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">Sort</span>
              <div className="relative">
                <select
                  value={`${sortField}-${sortDir}`}
                  onChange={(e) => {
                    const [f, d] = e.target.value.split('-') as [SortField, SortDir];
                    setSortField(f);
                    setSortDir(d);
                  }}
                  className="appearance-none bg-dark-900/50 border border-dark-600 text-dark-300 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-copper-500/50"
                >
                  <option value="dueDate-asc">Due Date (earliest)</option>
                  <option value="dueDate-desc">Due Date (latest)</option>
                  <option value="priority-asc">Priority (highest)</option>
                  <option value="priority-desc">Priority (lowest)</option>
                  <option value="status-asc">Status (open first)</option>
                  <option value="status-desc">Status (completed first)</option>
                  <option value="createdAt-desc">Newest first</option>
                  <option value="createdAt-asc">Oldest first</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dark-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* -- Plan List ----------------------------------------------------- */}
        {filtered.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-copper-600/20 to-copper-500/20 mb-6">
              <WrenchScrewdriverIcon className="h-16 w-16 text-copper-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {plans.length === 0 ? 'No Remediation Plans Yet' : 'No Plans Match Filters'}
            </h2>
            <p className="text-dark-400 max-w-md mx-auto mb-6">
              {plans.length === 0
                ? 'Create your first remediation plan to start tracking compliance action items.'
                : 'Try adjusting your status or priority filters to see more plans.'}
            </p>
            {plans.length === 0 && (
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-copper-600 to-copper-500 text-white hover:shadow-lg hover:shadow-copper-500/20 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Create First Plan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop table header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2 text-xs font-medium text-dark-500 uppercase tracking-wider">
              <div className="col-span-3">Title</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1 text-center">Priority</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1">Assignee</div>
              <div className="col-span-1">Due Date</div>
              <div className="col-span-1">Created</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filtered.map((plan) => {
              const overdue = isOverdue(plan);
              return (
                <div
                  key={plan.id}
                  className={`bg-dark-800/50 backdrop-blur-xl border rounded-xl p-5 transition-colors hover:border-dark-600 ${
                    overdue ? 'border-red-500/30' : 'border-dark-700/50'
                  }`}
                >
                  {/* Desktop row */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{plan.title}</p>
                      {plan.hipaaReference && (
                        <p className="text-xs text-dark-500 mt-0.5">{plan.hipaaReference}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-dark-400">{plan.category}</span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${priorityColor(plan.priority)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(plan.priority)}`} />
                        {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColor(plan.status, overdue)}`}>
                        {statusLabel(plan.status, overdue)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-xs text-dark-400">{plan.assignee || '-'}</span>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-xs ${overdue ? 'text-red-400 font-medium' : 'text-dark-400'}`}>
                        {formatDate(plan.dueDate)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-xs text-dark-500">{formatDate(plan.createdAt)}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      {plan.status !== 'completed' && (
                        <button
                          onClick={() => markComplete(plan.id)}
                          title="Mark Complete"
                          className="p-1.5 rounded-lg text-dark-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditForm(plan)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-dark-400 hover:text-copper-400 hover:bg-copper-500/10 transition-colors"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(plan.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{plan.title}</p>
                        {plan.hipaaReference && (
                          <p className="text-xs text-dark-500 mt-0.5">{plan.hipaaReference}</p>
                        )}
                        <p className="text-xs text-dark-400 mt-1">{plan.category}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {plan.status !== 'completed' && (
                          <button
                            onClick={() => markComplete(plan.id)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditForm(plan)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-copper-400 hover:bg-copper-500/10 transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(plan.id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${priorityColor(plan.priority)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(plan.priority)}`} />
                        {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColor(plan.status, overdue)}`}>
                        {statusLabel(plan.status, overdue)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-400">
                      {plan.assignee && <span>Assignee: {plan.assignee}</span>}
                      <span className={overdue ? 'text-red-400 font-medium' : ''}>
                        Due: {formatDate(plan.dueDate)}
                      </span>
                      <span>Created: {formatDate(plan.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* -- Add / Edit Modal ----------------------------------------------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] px-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeForm}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-2xl bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl mb-12">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Remediation Plan' : 'Add New Remediation Plan'}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg text-sm text-red-300">
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Implement access control policy"
                  className="w-full px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the remediation action needed..."
                  className="w-full px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm resize-none"
                />
              </div>

              {/* Category + Source (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full appearance-none px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm pr-10"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Source</label>
                  <div className="relative">
                    <select
                      value={form.source}
                      onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                      className="w-full appearance-none px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm pr-10"
                    >
                      {SOURCES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Priority + Status (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => {
                      const active = form.priority === p;
                      const colors: Record<Priority, string> = {
                        critical: active ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-dark-600 text-dark-400',
                        high: active ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'border-dark-600 text-dark-400',
                        medium: active ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'border-dark-600 text-dark-400',
                        low: active ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'border-dark-600 text-dark-400',
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, priority: p }))}
                          className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${colors[p]} hover:opacity-80`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Status</label>
                  <div className="flex gap-2">
                    {([
                      { val: 'open' as Status, label: 'Open' },
                      { val: 'in-progress' as Status, label: 'In Progress' },
                      { val: 'completed' as Status, label: 'Completed' },
                    ]).map(({ val, label }) => {
                      const active = form.status === val;
                      const colors: Record<Status, string> = {
                        open: active ? 'bg-copper-500/20 border-copper-500/50 text-copper-400' : 'border-dark-600 text-dark-400',
                        'in-progress': active ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'border-dark-600 text-dark-400',
                        completed: active ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'border-dark-600 text-dark-400',
                      };
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, status: val }))}
                          className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${colors[val]} hover:opacity-80`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Assignee + Due Date (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Assignee</label>
                  <input
                    type="text"
                    value={form.assignee}
                    onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                    placeholder="Person responsible"
                    className="w-full px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* HIPAA Reference */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">HIPAA Reference</label>
                <input
                  type="text"
                  value={form.hipaaReference}
                  onChange={(e) => setForm((f) => ({ ...f, hipaaReference: e.target.value }))}
                  placeholder="e.g., &sect;164.312(a)(1)"
                  className="w-full px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Notes / Comments</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes, comments, or context..."
                  className="w-full px-4 py-2.5 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 text-sm resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-700">
              <button
                onClick={closeForm}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-copper-600 to-copper-500 text-white hover:shadow-lg hover:shadow-copper-500/20 transition-all"
              >
                {editingId ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -- Delete Confirmation Modal -------------------------------------- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 p-3 rounded-full bg-red-500/15">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Plan</h3>
                <p className="text-sm text-dark-400 mt-1">
                  Are you sure you want to delete this remediation plan? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePlan(deleteTarget)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
