/**
 * Mixpanel Integration - Type Definitions
 *
 * Shared TypeScript types for type-safe event tracking across all projects.
 */

/**
 * Mixpanel configuration options
 */
export interface MixpanelConfig {
  token: string;
  region?: 'us' | 'eu' | 'india';
  enabled?: boolean;
  debug?: boolean;
  trackPageViews?: boolean;
  trackAutomaticEvents?: boolean;
  privacyMode?: boolean;
  persistenceType?: 'localStorage' | 'cookie' | 'memory';
  crossSubdomainCookie?: boolean;
  secureCookie?: boolean;
  ignoreDoNotTrack?: boolean;
}

/**
 * User properties for identification
 */
export interface UserProperties {
  $email?: string;
  $name?: string;
  $created?: string;
  $avatar?: string;
  // Custom properties
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Standard authentication events
 */
export enum AuthEvents {
  SIGNUP = 'User Signed Up',
  LOGIN = 'User Logged In',
  LOGOUT = 'User Logged Out',
  PASSWORD_RESET = 'Password Reset Requested',
  PASSWORD_CHANGED = 'Password Changed',
  EMAIL_VERIFIED = 'Email Verified',
  MFA_ENABLED = 'MFA Enabled',
  MFA_DISABLED = 'MFA Disabled',
}

/**
 * Standard navigation events
 */
export enum NavigationEvents {
  PAGE_VIEW = 'Page Viewed',
  LINK_CLICKED = 'Link Clicked',
  NAVIGATION = 'Navigation',
  SEARCH = 'Search Performed',
}

/**
 * Standard form events
 */
export enum FormEvents {
  FORM_VIEWED = 'Form Viewed',
  FORM_STARTED = 'Form Started',
  FORM_SUBMITTED = 'Form Submitted',
  FORM_ERROR = 'Form Error',
  FORM_ABANDONED = 'Form Abandoned',
}

/**
 * Standard payment events
 */
export enum PaymentEvents {
  SUBSCRIPTION_STARTED = 'Subscription Started',
  SUBSCRIPTION_CANCELLED = 'Subscription Cancelled',
  SUBSCRIPTION_RENEWED = 'Subscription Renewed',
  PAYMENT_SUCCESS = 'Payment Successful',
  PAYMENT_FAILED = 'Payment Failed',
  TRIAL_STARTED = 'Trial Started',
  TRIAL_ENDED = 'Trial Ended',
}

/**
 * Standard profile events
 */
export enum ProfileEvents {
  PROFILE_VIEWED = 'Profile Viewed',
  PROFILE_UPDATED = 'Profile Updated',
  SETTINGS_CHANGED = 'Settings Changed',
  PREFERENCE_UPDATED = 'Preference Updated',
}

/**
 * Standard engagement events
 */
export enum EngagementEvents {
  FEATURE_USED = 'Feature Used',
  BUTTON_CLICKED = 'Button Clicked',
  MODAL_OPENED = 'Modal Opened',
  MODAL_CLOSED = 'Modal Closed',
  TAB_CHANGED = 'Tab Changed',
  FILTER_APPLIED = 'Filter Applied',
  SORT_APPLIED = 'Sort Applied',
  EXPORT_INITIATED = 'Export Initiated',
  DOWNLOAD_STARTED = 'Download Started',
}

/**
 * Standard error events
 */
export enum ErrorEvents {
  ERROR_OCCURRED = 'Error Occurred',
  API_ERROR = 'API Error',
  VALIDATION_ERROR = 'Validation Error',
  NETWORK_ERROR = 'Network Error',
}

/**
 * Union type of all standard events
 */
export type StandardEvent =
  | AuthEvents
  | NavigationEvents
  | FormEvents
  | PaymentEvents
  | ProfileEvents
  | EngagementEvents
  | ErrorEvents;

/**
 * Event properties type
 */
export type EventProperties = Record<string, string | number | boolean | undefined | null | object>;

/**
 * Analytics service interface
 */
export interface IAnalyticsService {
  init(config: MixpanelConfig): Promise<void>;
  track(event: string | StandardEvent, properties?: EventProperties): void;
  identify(userId: string, properties?: UserProperties): void;
  reset(): void;
  setUserProperties(properties: UserProperties): void;
  incrementUserProperty(property: string, by?: number): void;
  trackPageView(pageName?: string, properties?: EventProperties): void;
  isEnabled(): boolean;
}

/**
 * Analytics context for React
 */
export interface AnalyticsContextValue extends IAnalyticsService {
  isReady: boolean;
}
