'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { orgStorage } from '@/lib/supabase/org-storage';

type OrgType = 'covered_entity' | 'business_associate';

interface PolicyEntry {
  id: string;
  title: string;
  category: string;
  applies_to: string[];
}

interface PolicyBundle {
  id: string;
  name: string;
  description: string;
  category: string;
  policy_ids: string[];
  policy_titles: string[];
  org_type: OrgType;
  created_at: string;
}

const CATEGORY_NORMALIZATION: Record<string, string> = {
  'administrative-safeguards': 'Administrative Safeguards',
  'organizational-requirements': 'Organizational Requirements',
};

const CATEGORY_COLORS: Record<string, { gradient: string; border: string; text: string }> = {
  'Administrative Safeguards': {
    gradient: 'from-copper-500/10 to-copper-400/10',
    border: 'border-copper-500/20',
    text: 'text-copper-400',
  },
  'Privacy Rule': {
    gradient: 'from-copper-500/10 to-copper-400/10',
    border: 'border-copper-500/20',
    text: 'text-copper-400',
  },
  'Technical Safeguards': {
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
  },
  'Physical Safeguards': {
    gradient: 'from-orange-500/10 to-amber-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
  },
  'Breach Notification': {
    gradient: 'from-red-500/10 to-pink-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
  },
  'Organizational Requirements': {
    gradient: 'from-evergreen-500/10 to-teal-500/10',
    border: 'border-evergreen-500/20',
    text: 'text-evergreen-400',
  },
};

const DEFAULT_COLOR = {
  gradient: 'from-dark-500/10 to-gray-500/10',
  border: 'border-dark-500/20',
  text: 'text-dark-400',
};

function normalizeCategory(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return CATEGORY_NORMALIZATION[lower] || raw;
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

export default function PolicyBundlesPage() {
  const [orgType, setOrgType] = useState<OrgType | null>(null);
  const [bundles, setBundles] = useState<PolicyBundle[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load org type from localStorage on mount
  useEffect(() => {
    try {
      const saved = orgStorage.getItem('hipaa-org-type');
      if (saved === 'covered_entity' || saved === 'business_associate') {
        setOrgType(saved);
      }
    } catch {
      // localStorage unavailable
    }
    setInitialized(true);
  }, []);

  const generateBundles = useCallback(async (type: OrgType) => {
    setLoading(true);
    try {
      const response = await fetch('/policy-index.json');
      if (!response.ok) throw new Error('Failed to fetch policy index');
      const data = await response.json();
      const policies: PolicyEntry[] = data.policies || [];

      // Filter by org type
      const filtered = policies.filter(
        (p) => p.applies_to && p.applies_to.includes(type)
      );

      // Deduplicate by policy ID (keep first occurrence)
      const seen = new Set<string>();
      const unique = filtered.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      // Group by normalized category
      const groups = new Map<string, PolicyEntry[]>();
      for (const policy of unique) {
        const category = normalizeCategory(policy.category);
        const existing = groups.get(category) || [];
        existing.push(policy);
        groups.set(category, existing);
      }

      // Sort categories: largest first, then alphabetical
      const sortedCategories = Array.from(groups.entries()).sort((a, b) => {
        const countDiff = b[1].length - a[1].length;
        if (countDiff !== 0) return countDiff;
        return a[0].localeCompare(b[0]);
      });

      // Create bundles
      const newBundles: PolicyBundle[] = sortedCategories.map(([category, pols]) => ({
        id: `bundle-${category.toLowerCase().replace(/\s+/g, '-')}-${type}`,
        name: `${category} Bundle`,
        description: `All ${category.toLowerCase()} policies applicable to ${
          type === 'covered_entity' ? 'Covered Entities' : 'Business Associates'
        }. Contains ${pols.length} ${pols.length === 1 ? 'policy' : 'policies'}.`,
        category,
        policy_ids: pols.map((p) => p.id),
        policy_titles: pols.map((p) => p.title),
        org_type: type,
        created_at: new Date().toISOString(),
      }));

      setBundles(newBundles);
      orgStorage.setItem('hipaa-policy-bundles', JSON.stringify(newBundles));
    } catch (err) {
      console.error('Failed to generate bundles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // When org type changes, generate bundles
  useEffect(() => {
    if (!orgType) return;

    // Try loading existing bundles first
    try {
      const saved = orgStorage.getItem('hipaa-policy-bundles');
      if (saved) {
        const parsed: PolicyBundle[] = JSON.parse(saved);
        // Verify bundles match current org type
        if (parsed.length > 0 && parsed[0].org_type === orgType) {
          setBundles(parsed);
          return;
        }
      }
    } catch {
      // Fall through to generate
    }

    generateBundles(orgType);
  }, [orgType, generateBundles]);

  const handleSelectOrgType = (type: OrgType) => {
    orgStorage.setItem('hipaa-org-type', type);
    setOrgType(type);
    // Force regeneration
    generateBundles(type);
  };

  const handleChangeOrgType = () => {
    orgStorage.removeItem('hipaa-org-type');
    orgStorage.removeItem('hipaa-policy-bundles');
    setOrgType(null);
    setBundles([]);
    setExpandedId(null);
  };

  const handleRegenerate = () => {
    if (orgType) {
      generateBundles(orgType);
    }
  };

  const totalPolicies = bundles.reduce((sum, b) => sum + b.policy_ids.length, 0);

  const orgTypeLabel =
    orgType === 'covered_entity'
      ? 'Covered Entity'
      : orgType === 'business_associate'
      ? 'Business Associate'
      : '';

  // Wait for localStorage check before rendering
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="animate-pulse text-dark-400">Loading...</div>
      </div>
    );
  }

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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                  Policy Bundles
                </h1>
                <p className="mt-2 text-dark-400">
                  Auto-generated HIPAA policy collections by safeguard category
                </p>
              </div>
            </div>
            {orgType && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-dark-700/80 text-dark-300 font-medium rounded-xl hover:bg-dark-600/80 hover:text-white transition-all disabled:opacity-50"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
                <button
                  onClick={handleChangeOrgType}
                  className="px-5 py-2.5 text-dark-400 hover:text-white font-medium rounded-xl border border-dark-700 hover:border-dark-500 transition-all"
                >
                  Change Org Type
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Org Type Selection (first visit) */}
        {!orgType && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-10 text-center">
              <div className="inline-flex p-5 rounded-full bg-emerald-500/10 mb-6">
                <ShieldCheckIcon className="h-14 w-14 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                What type of HIPAA entity is your organization?
              </h2>
              <p className="text-dark-400 mb-10 max-w-xl mx-auto leading-relaxed">
                Select your organization type to automatically generate policy bundles
                tailored to your HIPAA compliance requirements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Covered Entity */}
                <button
                  onClick={() => handleSelectOrgType('covered_entity')}
                  className="group relative bg-dark-900/50 border-2 border-dark-700 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                  <div className="relative">
                    <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 mb-5">
                      <BuildingLibraryIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      Covered Entity
                    </h3>
                    <p className="text-dark-400 text-sm leading-relaxed">
                      Healthcare providers, health plans, and healthcare clearinghouses
                      that transmit health information electronically.
                    </p>
                  </div>
                </button>

                {/* Business Associate */}
                <button
                  onClick={() => handleSelectOrgType('business_associate')}
                  className="group relative bg-dark-900/50 border-2 border-dark-700 rounded-2xl p-8 hover:border-copper-500/50 transition-all duration-300 text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-copper-500/5 to-copper-400/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                  <div className="relative">
                    <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-copper-600 to-copper-500 mb-5">
                      <BuildingOfficeIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-copper-400 transition-colors">
                      Business Associate
                    </h3>
                    <p className="text-dark-400 text-sm leading-relaxed">
                      Vendors, contractors, and subcontractors that create, receive,
                      maintain, or transmit PHI on behalf of a covered entity.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bundles View (after org type selected) */}
        {orgType && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                <p className="text-dark-400 text-sm font-medium mb-2">Total Bundles</p>
                <p className="text-4xl font-bold text-white">{bundles.length}</p>
              </div>
              <div className="bg-gradient-to-br from-copper-500/10 to-copper-400/10 backdrop-blur-xl border border-copper-500/20 rounded-2xl p-6">
                <p className="text-dark-400 text-sm font-medium mb-2">Total Policies</p>
                <p className="text-4xl font-bold text-white">{totalPolicies}</p>
              </div>
              <div className="bg-gradient-to-br from-copper-500/10 to-copper-400/10 backdrop-blur-xl border border-copper-500/20 rounded-2xl p-6">
                <p className="text-dark-400 text-sm font-medium mb-2">Organization Type</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mt-1 ${
                    orgType === 'covered_entity'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-copper-500/20 text-copper-400 border border-copper-500/30'
                  }`}
                >
                  {orgType === 'covered_entity' ? (
                    <BuildingLibraryIcon className="h-4 w-4" />
                  ) : (
                    <BuildingOfficeIcon className="h-4 w-4" />
                  )}
                  {orgTypeLabel}
                </span>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-2">
                Auto-Generated Policy Bundles
              </h3>
              <p className="text-dark-300 text-sm leading-relaxed">
                These bundles were automatically generated from your HIPAA policy library based on
                your <strong className="text-emerald-400">{orgTypeLabel}</strong> designation.
                Each bundle groups policies by their HIPAA safeguard category for streamlined
                compliance management. Click any bundle to view its included policies.
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-dark-400">
                  <ArrowPathIcon className="h-6 w-6 animate-spin" />
                  <span className="text-lg">Generating bundles...</span>
                </div>
              </div>
            )}

            {/* Bundle Cards */}
            {!loading && bundles.length === 0 && (
              <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-12 text-center">
                <DocumentTextIcon className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">No Bundles Generated</h3>
                <p className="text-dark-400 mb-6">
                  No policies were found for the selected organization type.
                </p>
                <button
                  onClick={handleRegenerate}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all"
                >
                  Try Regenerating
                </button>
              </div>
            )}

            {!loading && bundles.length > 0 && (
              <div className="space-y-4">
                {bundles.map((bundle) => {
                  const color = getCategoryColor(bundle.category);
                  const isExpanded = expandedId === bundle.id;

                  return (
                    <div
                      key={bundle.id}
                      className={`bg-dark-800/50 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-200 ${
                        isExpanded ? 'border-dark-600' : 'border-dark-700/50 hover:border-dark-600/50'
                      }`}
                    >
                      {/* Bundle Header */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : bundle.id)}
                        className="w-full p-6 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                              className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${color.gradient} border ${color.border}`}
                            >
                              <DocumentTextIcon className={`h-6 w-6 ${color.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1.5">
                                <h3 className="text-xl font-bold text-white truncate">
                                  {bundle.name}
                                </h3>
                                <span
                                  className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${color.gradient} ${color.text} border ${color.border}`}
                                >
                                  {bundle.policy_ids.length}{' '}
                                  {bundle.policy_ids.length === 1 ? 'policy' : 'policies'}
                                </span>
                              </div>
                              <p className="text-dark-400 text-sm">{bundle.description}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            {isExpanded ? (
                              <ChevronDownIcon className="h-5 w-5 text-dark-400" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-dark-400" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Policy List */}
                      {isExpanded && (
                        <div className="border-t border-dark-700/50 bg-dark-900/30 p-6">
                          <h4 className="text-sm font-semibold text-dark-400 mb-4 uppercase tracking-wide">
                            Included Policies ({bundle.policy_titles.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                            {bundle.policy_titles.map((title, idx) => (
                              <div
                                key={bundle.policy_ids[idx]}
                                className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-800/80 transition-colors"
                              >
                                <span
                                  className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${color.gradient} ${color.text} text-xs font-bold flex items-center justify-center border ${color.border}`}
                                >
                                  {idx + 1}
                                </span>
                                <span className="text-sm text-dark-300 leading-snug">
                                  {title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
