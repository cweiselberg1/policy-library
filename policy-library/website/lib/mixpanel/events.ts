/**
 * Mixpanel Event Tracking Utilities
 *
 * Centralized event definitions for the HIPAA Policy Library
 * Ensures consistent tracking across the application
 */

export const EVENTS = {
  // Page View Events
  PAGE_VIEW: 'Page View',
  POLICY_VIEW: 'Policy View',

  // Navigation Events
  NAVIGATE_TO_CE: 'Navigate to CE',
  NAVIGATE_TO_BA: 'Navigate to BA',

  // Search Events
  SEARCH_QUERY: 'Search Query',
  SEARCH_RESULTS: 'Search Results',

  // Filter Events
  FILTER_CATEGORY: 'Filter Category',
  FILTER_CLEAR: 'Filter Clear',

  // Download Events
  DOWNLOAD_POLICY: 'Download Policy',
  DOWNLOAD_ALL: 'Download All Policies',

  // Interaction Events
  CLICK_POLICY_CARD: 'Click Policy Card',
  CLICK_CTA: 'Click CTA',
  CLICK_EXTERNAL_LINK: 'Click External Link',

  // Audit Events
  AUDIT_STARTED: 'Physical Audit Started',
  AUDIT_COMPLETED: 'Physical Audit Completed',
  AUDIT_RESET: 'Physical Audit Reset',
  AUDIT_REPORT_EXPORTED: 'Physical Audit Report Exported',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

/**
 * Track page view
 */
export function trackPageView(pageName: string, properties?: Record<string, any>) {
  return {
    event: EVENTS.PAGE_VIEW,
    properties: {
      page_name: pageName,
      ...properties,
    },
  };
}

/**
 * Track policy view
 */
export function trackPolicyView(policyId: string, policyTitle: string, entityType: string) {
  return {
    event: EVENTS.POLICY_VIEW,
    properties: {
      policy_id: policyId,
      policy_title: policyTitle,
      entity_type: entityType,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Track search query
 */
export function trackSearchQuery(query: string, entityType?: string) {
  return {
    event: EVENTS.SEARCH_QUERY,
    properties: {
      search_query: query,
      query_length: query.length,
      entity_type: entityType,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Track search results
 */
export function trackSearchResults(query: string, resultCount: number, entityType?: string) {
  return {
    event: EVENTS.SEARCH_RESULTS,
    properties: {
      search_query: query,
      result_count: resultCount,
      entity_type: entityType,
      has_results: resultCount > 0,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Track category filter
 */
export function trackCategoryFilter(category: string, entityType: string) {
  return {
    event: EVENTS.FILTER_CATEGORY,
    properties: {
      category,
      entity_type: entityType,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Track filter clear
 */
export function trackFilterClear(entityType: string) {
  return {
    event: EVENTS.FILTER_CLEAR,
    properties: {
      entity_type: entityType,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Track policy download
 */
export function trackPolicyDownload(policyId: string, policyTitle: string, entityType: string) {
  return {
    event: EVENTS.DOWNLOAD_POLICY,
    properties: {
      policy_id: policyId,
      policy_title: policyTitle,
      entity_type: entityType,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Track navigation to CE or BA
 */
export function trackNavigate(destination: 'CE' | 'BA', source: string) {
  return {
    event: destination === 'CE' ? EVENTS.NAVIGATE_TO_CE : EVENTS.NAVIGATE_TO_BA,
    properties: {
      source,
      destination,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Track CTA clicks
 */
export function trackCTAClick(ctaName: string, ctaLocation: string) {
  return {
    event: EVENTS.CLICK_CTA,
    properties: {
      cta_name: ctaName,
      cta_location: ctaLocation,
      timestamp: new Date().toISOString(),
    },
  };
}
