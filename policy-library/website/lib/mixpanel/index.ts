/**
 * Mixpanel Integration - Main Export
 *
 * Central export point for all Mixpanel integration utilities.
 */

// Core service
export { AnalyticsService, getAnalytics, initAnalytics } from './analytics';

// Types
export type {
  MixpanelConfig,
  UserProperties,
  EventProperties,
  IAnalyticsService,
  AnalyticsContextValue,
  StandardEvent,
} from './types';

export {
  AuthEvents,
  NavigationEvents,
  FormEvents,
  PaymentEvents,
  ProfileEvents,
  EngagementEvents,
  ErrorEvents,
} from './types';

// Next.js client-side
export { useAnalytics, usePageView, useIdentify } from './useAnalytics';

// Next.js provider (optional)
export { AnalyticsProvider, useAnalyticsContext } from './provider';

// React (non-Next.js)
export {
  useAnalytics as useReactAnalytics,
  usePageTracking,
  useUserIdentification,
} from './react-hook';
