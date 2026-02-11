/**
 * Mixpanel Integration - Core Analytics Service
 *
 * Universal analytics service that works in both browser and server environments.
 * Supports Mixpanel with graceful degradation if not configured.
 */

import type {
  MixpanelConfig,
  UserProperties,
  EventProperties,
  IAnalyticsService,
} from './types';

/**
 * Universal Analytics Service
 *
 * Works with both mixpanel-browser (client) and mixpanel (server).
 * Gracefully handles missing configuration without throwing errors.
 */
export class AnalyticsService implements IAnalyticsService {
  private mixpanel: any = null;
  private config: MixpanelConfig | null = null;
  private isInitialized = false;
  private isBrowser = typeof window !== 'undefined';
  private queue: Array<() => void> = [];

  /**
   * Initialize Mixpanel
   *
   * @param config - Mixpanel configuration
   */
  async init(config: MixpanelConfig): Promise<void> {
    // Don't initialize if already done or disabled
    if (this.isInitialized || !config.enabled) {
      console.log('[Analytics] Skipped initialization (disabled or already initialized)');
      return;
    }

    // Don't initialize without token
    if (!config.token) {
      console.warn('[Analytics] No Mixpanel token provided. Analytics disabled.');
      return;
    }

    try {
      this.config = config;

      if (this.isBrowser) {
        // Browser environment - use mixpanel-browser
        const { default: mixpanel } = await import('mixpanel-browser');

        // API host based on region
        const apiHost = this.getApiHost(config.region);

        mixpanel.init(config.token, {
          debug: config.debug ?? false,
          track_pageview: config.trackPageViews ?? false,
          persistence: (config.persistenceType ?? 'localStorage') as any,
          api_host: apiHost,
          cross_subdomain_cookie: config.crossSubdomainCookie ?? true,
          secure_cookie: config.secureCookie ?? true,
          ignore_dnt: config.ignoreDoNotTrack ?? false,
          // Privacy settings
          property_blacklist: config.privacyMode ? ['$current_url', '$initial_referrer', '$initial_referring_domain'] : [],
          opt_out_tracking_by_default: config.privacyMode ?? false,
        });

        this.mixpanel = mixpanel;
      } else {
        // Server environment - static site, no server-side tracking needed
        console.log('[Analytics] Server-side tracking not enabled (static site)');
        return;
      }

      this.isInitialized = true;

      if (config.debug) {
        console.log('[Analytics] Initialized successfully', {
          environment: this.isBrowser ? 'browser' : 'server',
          region: config.region ?? 'us',
        });
      }

      // Process queued events
      this.processQueue();
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Get Mixpanel API host based on region
   */
  private getApiHost(region?: 'us' | 'eu' | 'india'): string {
    switch (region) {
      case 'eu':
        return 'https://api-eu.mixpanel.com';
      case 'india':
        return 'https://api-in.mixpanel.com';
      case 'us':
      default:
        return 'https://api.mixpanel.com';
    }
  }

  /**
   * Process queued events after initialization
   */
  private processQueue(): void {
    if (this.queue.length > 0 && this.config?.debug) {
      console.log(`[Analytics] Processing ${this.queue.length} queued events`);
    }

    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) fn();
    }
  }

  /**
   * Check if analytics is enabled and ready
   */
  isEnabled(): boolean {
    return this.isInitialized && this.config?.enabled === true;
  }

  /**
   * Track an event
   *
   * @param event - Event name
   * @param properties - Event properties
   */
  track(event: string, properties?: EventProperties): void {
    if (!this.isEnabled()) {
      if (this.config?.debug) {
        console.log('[Analytics] Track called but analytics disabled:', event, properties);
      }
      return;
    }

    // If not initialized yet, queue the event
    if (!this.isInitialized) {
      this.queue.push(() => this.track(event, properties));
      return;
    }

    try {
      // Add common metadata
      const enrichedProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        platform: this.isBrowser ? 'web' : 'server',
      };

      this.mixpanel.track(event, enrichedProperties);

      if (this.config?.debug) {
        console.log('[Analytics] Event tracked:', event, enrichedProperties);
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Identify a user
   *
   * @param userId - Unique user identifier
   * @param properties - User properties
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.isEnabled()) {
      if (this.config?.debug) {
        console.log('[Analytics] Identify called but analytics disabled:', userId);
      }
      return;
    }

    if (!this.isInitialized) {
      this.queue.push(() => this.identify(userId, properties));
      return;
    }

    try {
      if (this.isBrowser) {
        this.mixpanel.identify(userId);
        if (properties) {
          this.mixpanel.people.set(properties);
        }
      } else {
        // Server-side identification
        this.mixpanel.people.set(userId, properties || {});
      }

      if (this.config?.debug) {
        console.log('[Analytics] User identified:', userId, properties);
      }
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error);
    }
  }

  /**
   * Set user properties
   *
   * @param properties - User properties to set
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isEnabled() || !this.isInitialized) {
      return;
    }

    try {
      if (this.isBrowser) {
        this.mixpanel.people.set(properties);
      }
      // Server-side requires userId in people.set call, handled in identify
    } catch (error) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }

  /**
   * Increment a user property
   *
   * @param property - Property name
   * @param by - Amount to increment by (default: 1)
   */
  incrementUserProperty(property: string, by: number = 1): void {
    if (!this.isEnabled() || !this.isInitialized) {
      return;
    }

    try {
      if (this.isBrowser) {
        this.mixpanel.people.increment(property, by);
      }
    } catch (error) {
      console.error('[Analytics] Failed to increment user property:', error);
    }
  }

  /**
   * Track a page view
   *
   * @param pageName - Page name or path
   * @param properties - Additional properties
   */
  trackPageView(pageName?: string, properties?: EventProperties): void {
    if (!this.isEnabled()) {
      return;
    }

    const pageProperties = {
      page: pageName || (this.isBrowser ? window.location.pathname : ''),
      ...properties,
    };

    this.track('Page Viewed', pageProperties);
  }

  /**
   * Reset user identity (e.g., on logout)
   */
  reset(): void {
    if (!this.isEnabled() || !this.isInitialized) {
      return;
    }

    try {
      if (this.isBrowser) {
        this.mixpanel.reset();
      }

      if (this.config?.debug) {
        console.log('[Analytics] User identity reset');
      }
    } catch (error) {
      console.error('[Analytics] Failed to reset:', error);
    }
  }
}

// Singleton instance
let analyticsInstance: AnalyticsService | null = null;

/**
 * Get or create analytics service instance
 */
export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
}

/**
 * Initialize analytics with configuration
 */
export async function initAnalytics(config: MixpanelConfig): Promise<AnalyticsService> {
  const analytics = getAnalytics();
  await analytics.init(config);
  return analytics;
}

export default AnalyticsService;
