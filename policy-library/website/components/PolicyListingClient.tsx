'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { Policy } from '@/lib/policies';
import { useAnalytics } from '@/lib/mixpanel/useAnalytics';
import { trackSearchQuery, trackSearchResults, trackCategoryFilter, trackFilterClear } from '@/lib/mixpanel/events';

const CATEGORIES = [
  'All',
  'Administrative Safeguards',
  'Physical Safeguards',
  'Technical Safeguards',
  'Privacy Rule',
  'Breach Notification',
  'Organizational Requirements',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Administrative Safeguards': 'bg-evergreen-100 text-evergreen-800 ring-evergreen-600/20',
  'Physical Safeguards': 'bg-evergreen-100 text-evergreen-800 ring-evergreen-600/20',
  'Technical Safeguards': 'bg-copper-100 text-copper-700 ring-copper-600/20',
  'Privacy Rule': 'bg-pink-100 text-pink-800 ring-pink-600/20',
  'Breach Notification': 'bg-orange-100 text-orange-800 ring-orange-600/20',
  'Organizational Requirements': 'bg-copper-50 text-copper-700 ring-copper-600/20',
};

interface PolicyListingClientProps {
  policies: Policy[];
  entityType: 'covered_entity' | 'business_associate';
  title: string;
  description: string;
}

export function PolicyListingClient({ policies, entityType, title, description }: PolicyListingClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { track } = useAnalytics();

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesSearch =
        searchTerm === '' ||
        policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.hipaa_reference.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || policy.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [policies, searchTerm, selectedCategory]);

  // Track search results when search term or category changes
  useEffect(() => {
    if (searchTerm) {
      const queryEvent = trackSearchQuery(searchTerm, entityType);
      track(queryEvent.event, queryEvent.properties);

      const resultsEvent = trackSearchResults(searchTerm, filteredPolicies.length, entityType);
      track(resultsEvent.event, resultsEvent.properties);
    }
  }, [searchTerm, filteredPolicies.length, entityType, track]);

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const event = trackCategoryFilter(category, entityType);
    track(event.event, event.properties);
  };

  // Handle filter clear
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    const event = trackFilterClear(entityType);
    track(event.event, event.properties);
  };

  // Download functionality removed - handled elsewhere in business flow

  return (
    <div className="min-h-screen bg-pearl-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-evergreen-700 to-evergreen-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-dm-serif)' }}>{title}</h1>
            <p className="text-xl text-evergreen-100">{description}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-evergreen-100">
                <DocumentTextIcon className="h-5 w-5" />
                <span>{policies.length} policies available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pearl-400" />
                <input
                  type="text"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-pearl-200 rounded-lg focus:ring-2 focus:ring-evergreen-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pearl-400 hover:text-evergreen-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full py-2 px-3 border border-pearl-200 rounded-lg focus:ring-2 focus:ring-evergreen-500 focus:border-transparent"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Download functionality removed - handled elsewhere */}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-[--text-muted]">
            Showing {filteredPolicies.length} of {policies.length} policies
          </div>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <Link
              key={policy.id}
              href={`/policies/${encodeURIComponent(policy.id)}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-pearl-200"
            >
              <div className="flex items-start justify-between mb-3">
                <DocumentTextIcon className="h-6 w-6 text-evergreen-700 flex-shrink-0" />
                {policy.category && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
                      CATEGORY_COLORS[policy.category] || 'bg-pearl-100 text-evergreen-800 ring-pearl-300'
                    }`}
                  >
                    {policy.category}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-evergreen-950 mb-2 line-clamp-2">
                {policy.title}
              </h3>

              {policy.description && (
                <p className="text-sm text-[--text-muted] mb-4 line-clamp-3">
                  {policy.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto">
                {policy.hipaa_reference && (
                  <span className="text-xs text-[--text-muted]">{policy.hipaa_reference}</span>
                )}
                <ArrowRightIcon className="h-4 w-4 text-copper-600" />
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredPolicies.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 text-pearl-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-evergreen-950 mb-2">No policies found</h3>
            <p className="text-[--text-muted] mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-copper-600 text-white rounded-lg hover:bg-copper-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
