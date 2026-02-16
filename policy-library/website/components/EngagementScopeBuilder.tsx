'use client';

import { useState, useEffect } from 'react';
import {
  EngagementScope,
  TargetType,
  TestingType,
  createDefaultScope,
  generateAuthorizationLetter,
  generateScopeDocument,
  TARGET_TYPE_LABELS,
  TESTING_TYPE_LABELS,
  TESTING_WINDOW_LABELS,
} from '@/lib/engagement-scope';
import {
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { orgStorage } from '@/lib/supabase/org-storage';

const STORAGE_KEY = 'ogc-engagement-scope';

const STEPS = [
  { id: 1, title: 'Client Info', icon: BuildingOfficeIcon },
  { id: 2, title: 'Scope', icon: GlobeAltIcon },
  { id: 3, title: 'Rules', icon: ShieldCheckIcon },
  { id: 4, title: 'Review', icon: DocumentTextIcon },
];

export default function EngagementScopeBuilder() {
  const [scope, setScope] = useState<EngagementScope>(createDefaultScope());
  const [currentStep, setCurrentStep] = useState(1);

  // Load from localStorage
  useEffect(() => {
    const saved = orgStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setScope(data);
      } catch (e) {
        console.error('Failed to load saved scope:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    scope.updatedAt = new Date().toISOString();
    orgStorage.setItem(STORAGE_KEY, JSON.stringify(scope));
  }, [scope]);

  const updateClientInfo = (field: string, value: string) => {
    setScope((prev) => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, [field]: value },
    }));
  };

  const updateScopeDefinition = (field: string, value: unknown) => {
    setScope((prev) => ({
      ...prev,
      scopeDefinition: { ...prev.scopeDefinition, [field]: value },
    }));
  };

  const updateRules = (field: string, value: unknown) => {
    setScope((prev) => ({
      ...prev,
      rulesOfEngagement: { ...prev.rulesOfEngagement, [field]: value },
    }));
  };

  const toggleTargetType = (type: TargetType) => {
    setScope((prev) => {
      const current = prev.scopeDefinition.targetTypes;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return {
        ...prev,
        scopeDefinition: { ...prev.scopeDefinition, targetTypes: updated },
      };
    });
  };

  const exportAuthLetter = () => {
    const markdown = generateAuthorizationLetter(scope);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authorization-letter-${scope.clientInfo.organizationName || 'client'}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportScopeDoc = () => {
    const markdown = generateScopeDocument(scope);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engagement-scope-${scope.clientInfo.organizationName || 'client'}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetScope = () => {
    if (confirm('Reset all engagement scope data? This cannot be undone.')) {
      const fresh = createDefaultScope();
      setScope(fresh);
      setCurrentStep(1);
      orgStorage.removeItem(STORAGE_KEY);
    }
  };

  const inputClass = 'w-full rounded-lg border border-pearl-300 bg-white px-4 py-2.5 text-sm text-evergreen-950 placeholder-pearl-400 focus:border-copper-500 focus:outline-none focus:ring-2 focus:ring-copper-500/20';
  const labelClass = 'mb-1.5 block text-sm font-medium text-[--text-secondary]';

  return (
    <div className="min-h-screen bg-pearl-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Back to Dashboard */}
        <a
          href="/dashboard/privacy-officer"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-copper-600 hover:text-copper-700"
        >
          ← Privacy Officer Dashboard
        </a>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>Engagement Scope Builder</h1>
          <p className="mt-2 text-[--text-muted]">
            Create professional security assessment scope documents and authorization letters
          </p>
        </div>

        {/* Step Indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  currentStep === step.id
                    ? 'bg-copper-600 text-white shadow-lg'
                    : currentStep > step.id
                    ? 'bg-evergreen-100 text-evergreen-700'
                    : 'bg-pearl-200 text-[--text-muted]'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 w-8 ${currentStep > step.id ? 'bg-evergreen-400' : 'bg-pearl-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-pearl-200 bg-white p-8 shadow-md">
          {/* Step 1: Client Info */}
          {currentStep === 1 && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-evergreen-950">Client Information</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Organization Name *</label>
                  <input
                    type="text"
                    value={scope.clientInfo.organizationName}
                    onChange={(e) => updateClientInfo('organizationName', e.target.value)}
                    placeholder="e.g., Acme Healthcare"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Person *</label>
                  <input
                    type="text"
                    value={scope.clientInfo.contactPerson}
                    onChange={(e) => updateClientInfo('contactPerson', e.target.value)}
                    placeholder="e.g., John Smith"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={scope.clientInfo.contactTitle}
                    onChange={(e) => updateClientInfo('contactTitle', e.target.value)}
                    placeholder="e.g., IT Director"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    value={scope.clientInfo.contactEmail}
                    onChange={(e) => updateClientInfo('contactEmail', e.target.value)}
                    placeholder="john@acme.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={scope.clientInfo.contactPhone}
                    onChange={(e) => updateClientInfo('contactPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Engagement Start Date</label>
                  <input
                    type="date"
                    value={scope.clientInfo.startDate}
                    onChange={(e) => updateClientInfo('startDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Engagement End Date</label>
                  <input
                    type="date"
                    value={scope.clientInfo.endDate}
                    onChange={(e) => updateClientInfo('endDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Scope Definition */}
          {currentStep === 2 && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-evergreen-950">Scope Definition</h2>

              <div className="mb-6">
                <label className={labelClass}>Target Types *</label>
                <p className="mb-3 text-xs text-[--text-muted]">Select all that apply</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(Object.entries(TARGET_TYPE_LABELS) as [TargetType, string][]).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => toggleTargetType(type)}
                      className={`rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                        scope.scopeDefinition.targetTypes.includes(type)
                          ? 'border-copper-500 bg-copper-50 text-copper-700'
                          : 'border-pearl-200 bg-white text-[--text-secondary] hover:border-copper-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className={labelClass}>Target List *</label>
                <p className="mb-1 text-xs text-[--text-muted]">One per line: IP ranges, domains, URLs</p>
                <textarea
                  value={scope.scopeDefinition.targetList}
                  onChange={(e) => updateScopeDefinition('targetList', e.target.value)}
                  placeholder="192.168.1.0/24&#10;app.example.com&#10;https://portal.example.com"
                  rows={5}
                  className={inputClass}
                />
              </div>

              <div className="mb-6">
                <label className={labelClass}>Excluded Systems</label>
                <p className="mb-1 text-xs text-[--text-muted]">Systems explicitly out of scope (one per line)</p>
                <textarea
                  value={scope.scopeDefinition.excludedSystems}
                  onChange={(e) => updateScopeDefinition('excludedSystems', e.target.value)}
                  placeholder="192.168.1.1 (production gateway)&#10;backup.example.com"
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Testing Window</label>
                <select
                  value={scope.scopeDefinition.testingWindow}
                  onChange={(e) => updateScopeDefinition('testingWindow', e.target.value)}
                  className={inputClass}
                >
                  {Object.entries(TESTING_WINDOW_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Rules of Engagement */}
          {currentStep === 3 && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-evergreen-950">Rules of Engagement</h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Testing Type *</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(Object.entries(TESTING_TYPE_LABELS) as [TestingType, string][]).map(([type, label]) => (
                      <button
                        key={type}
                        onClick={() => updateRules('testingType', type)}
                        className={`rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                          scope.rulesOfEngagement.testingType === type
                            ? 'border-copper-500 bg-copper-50 text-copper-700'
                            : 'border-pearl-200 bg-white text-[--text-secondary] hover:border-copper-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Exploitation Allowed</label>
                  <select
                    value={scope.rulesOfEngagement.exploitationAllowed}
                    onChange={(e) => updateRules('exploitationAllowed', e.target.value)}
                    className={inputClass}
                  >
                    <option value="yes">Yes - Full exploitation</option>
                    <option value="limited">Limited - Non-destructive only</option>
                    <option value="no">No - Assessment only</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={scope.rulesOfEngagement.socialEngineeringAllowed}
                      onChange={(e) => updateRules('socialEngineeringAllowed', e.target.checked)}
                      className="h-4 w-4 rounded border-pearl-300 text-copper-600 focus:ring-copper-500"
                    />
                    <span className="text-sm text-[--text-secondary]">Social Engineering Allowed</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={scope.rulesOfEngagement.physicalTestingAllowed}
                      onChange={(e) => updateRules('physicalTestingAllowed', e.target.checked)}
                      className="h-4 w-4 rounded border-pearl-300 text-copper-600 focus:ring-copper-500"
                    />
                    <span className="text-sm text-[--text-secondary]">Physical Testing Allowed</span>
                  </label>
                </div>

                <div className="md:col-span-2 border-t border-pearl-200 pt-5 mt-2">
                  <h3 className="mb-4 font-semibold text-evergreen-950">Emergency Contact</h3>
                </div>

                <div>
                  <label className={labelClass}>Emergency Contact Name *</label>
                  <input
                    type="text"
                    value={scope.rulesOfEngagement.emergencyContactName}
                    onChange={(e) => updateRules('emergencyContactName', e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Emergency Phone *</label>
                  <input
                    type="tel"
                    value={scope.rulesOfEngagement.emergencyContactPhone}
                    onChange={(e) => updateRules('emergencyContactPhone', e.target.value)}
                    placeholder="(555) 999-8888"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Emergency Email</label>
                  <input
                    type="email"
                    value={scope.rulesOfEngagement.emergencyContactEmail}
                    onChange={(e) => updateRules('emergencyContactEmail', e.target.value)}
                    placeholder="emergency@acme.com"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Stop Conditions</label>
                  <textarea
                    value={scope.rulesOfEngagement.stopConditions}
                    onChange={(e) => updateRules('stopConditions', e.target.value)}
                    rows={4}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Export */}
          {currentStep === 4 && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-evergreen-950">Review & Export</h2>

              {/* Summary Cards */}
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-pearl-200 bg-pearl-50 p-4">
                  <h3 className="text-xs font-semibold uppercase text-[--text-muted]">Client</h3>
                  <p className="mt-1 font-semibold text-evergreen-950">{scope.clientInfo.organizationName || '—'}</p>
                  <p className="text-sm text-[--text-muted]">{scope.clientInfo.contactPerson || '—'}</p>
                </div>
                <div className="rounded-lg border border-pearl-200 bg-pearl-50 p-4">
                  <h3 className="text-xs font-semibold uppercase text-[--text-muted]">Scope</h3>
                  <p className="mt-1 font-semibold text-evergreen-950">
                    {scope.scopeDefinition.targetTypes.length} target type{scope.scopeDefinition.targetTypes.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-[--text-muted]">
                    {scope.scopeDefinition.targetList.split('\n').filter(Boolean).length} target{scope.scopeDefinition.targetList.split('\n').filter(Boolean).length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="rounded-lg border border-pearl-200 bg-pearl-50 p-4">
                  <h3 className="text-xs font-semibold uppercase text-[--text-muted]">Testing</h3>
                  <p className="mt-1 font-semibold text-evergreen-950 capitalize">{scope.rulesOfEngagement.testingType.replace('-', ' ')}</p>
                  <p className="text-sm text-[--text-muted]">
                    Exploit: {scope.rulesOfEngagement.exploitationAllowed}
                  </p>
                </div>
              </div>

              {/* Detail sections */}
              <div className="mb-8 space-y-4">
                <div className="rounded-lg border border-pearl-200 p-4">
                  <h3 className="mb-2 font-semibold text-evergreen-950">Targets In Scope</h3>
                  <div className="flex flex-wrap gap-2">
                    {scope.scopeDefinition.targetTypes.map((type) => (
                      <span key={type} className="rounded-full bg-copper-100 px-3 py-1 text-xs font-medium text-copper-700">
                        {TARGET_TYPE_LABELS[type]}
                      </span>
                    ))}
                  </div>
                  {scope.scopeDefinition.targetList && (
                    <pre className="mt-3 rounded bg-pearl-50 p-3 text-xs text-[--text-muted]">
                      {scope.scopeDefinition.targetList}
                    </pre>
                  )}
                </div>

                <div className="rounded-lg border border-pearl-200 p-4">
                  <h3 className="mb-2 font-semibold text-evergreen-950">Rules of Engagement</h3>
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    <p><span className="font-medium text-[--text-secondary]">Testing Type:</span> {TESTING_TYPE_LABELS[scope.rulesOfEngagement.testingType]}</p>
                    <p><span className="font-medium text-[--text-secondary]">Exploitation:</span> {scope.rulesOfEngagement.exploitationAllowed}</p>
                    <p><span className="font-medium text-[--text-secondary]">Social Engineering:</span> {scope.rulesOfEngagement.socialEngineeringAllowed ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium text-[--text-secondary]">Physical Testing:</span> {scope.rulesOfEngagement.physicalTestingAllowed ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium text-[--text-secondary]">Testing Window:</span> {TESTING_WINDOW_LABELS[scope.scopeDefinition.testingWindow]}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-pearl-200 p-4">
                  <h3 className="mb-2 font-semibold text-evergreen-950">Emergency Contact</h3>
                  <p className="text-sm text-[--text-muted]">
                    {scope.rulesOfEngagement.emergencyContactName || '—'} | {scope.rulesOfEngagement.emergencyContactPhone || '—'} | {scope.rulesOfEngagement.emergencyContactEmail || '—'}
                  </p>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportAuthLetter}
                  className="flex items-center gap-2 rounded-lg bg-copper-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-copper-700"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export Authorization Letter
                </button>
                <button
                  onClick={exportScopeDoc}
                  className="flex items-center gap-2 rounded-lg bg-evergreen-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-evergreen-800"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export Scope Document
                </button>
                <button
                  onClick={resetScope}
                  className="flex items-center gap-2 rounded-lg border-2 border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-pearl-200 pt-6">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 rounded-lg border border-pearl-300 bg-white px-4 py-2 text-sm font-medium text-[--text-secondary] hover:bg-pearl-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-[--text-muted]">Step {currentStep} of {STEPS.length}</span>
            <button
              onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}
              disabled={currentStep === STEPS.length}
              className="flex items-center gap-2 rounded-lg bg-copper-600 px-4 py-2 text-sm font-semibold text-white hover:bg-copper-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
