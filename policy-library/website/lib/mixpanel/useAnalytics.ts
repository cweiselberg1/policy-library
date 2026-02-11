/**
 * Mixpanel Integration - React Hook (Next.js Client Components)
 *
 * Client-side React hook for using analytics in components.
 * Use in Next.js App Router client components with 'use client' directive.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type {
  EventProperties,
  UserProperties,
  AnalyticsContextValue,
} from './types';
import { getAnalytics } from './analytics';

/**
 * React hook for analytics tracking
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useAnalytics } from '@/lib/mixpanel/useAnalytics';
 *
 * export default function MyComponent() {
 *   const analytics = useAnalytics();
 *
 *   const handleClick = () => {
 *     analytics.track('Button Clicked', { button: 'submit' });
 *   };
 *
 *   return <button onClick={handleClick}>Submit</button>;
 * }
 * ```
 */
export function useAnalytics(): AnalyticsContextValue {
  const [isReady, setIsReady] = useState(false);
  const analytics = getAnalytics();

  useEffect(() => {
    setIsReady(analytics.isEnabled());
  }, [analytics]);

  const track = useCallback(
    (event: string, properties?: EventProperties) => {
      analytics.track(event, properties);
    },
    [analytics]
  );

  const identify = useCallback(
    (userId: string, properties?: UserProperties) => {
      analytics.identify(userId, properties);
    },
    [analytics]
  );

  const reset = useCallback(() => {
    analytics.reset();
  }, [analytics]);

  const setUserProperties = useCallback(
    (properties: UserProperties) => {
      analytics.setUserProperties(properties);
    },
    [analytics]
  );

  const incrementUserProperty = useCallback(
    (property: string, by?: number) => {
      analytics.incrementUserProperty(property, by);
    },
    [analytics]
  );

  const trackPageView = useCallback(
    (pageName?: string, properties?: EventProperties) => {
      analytics.trackPageView(pageName, properties);
    },
    [analytics]
  );

  const isEnabled = useCallback(() => {
    return analytics.isEnabled();
  }, [analytics]);

  return {
    isReady,
    track,
    identify,
    reset,
    setUserProperties,
    incrementUserProperty,
    trackPageView,
    isEnabled,
    init: analytics.init.bind(analytics),
  };
}

/**
 * Hook for tracking page views automatically
 *
 * @param pageName - Optional page name (defaults to pathname)
 * @param properties - Additional properties
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { usePageView } from '@/lib/mixpanel/useAnalytics';
 *
 * export default function Page() {
 *   usePageView('Dashboard', { section: 'analytics' });
 *   return <div>Dashboard</div>;
 * }
 * ```
 */
export function usePageView(pageName?: string, properties?: EventProperties) {
  const analytics = useAnalytics();

  useEffect(() => {
    if (analytics.isEnabled()) {
      analytics.trackPageView(pageName, properties);
    }
  }, [analytics, pageName, properties]);
}

/**
 * Hook for identifying user on mount
 *
 * @param userId - User ID
 * @param properties - User properties
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useIdentify } from '@/lib/mixpanel/useAnalytics';
 *
 * export default function UserProfile({ user }) {
 *   useIdentify(user.id, {
 *     $email: user.email,
 *     $name: user.name,
 *   });
 *
 *   return <div>Profile</div>;
 * }
 * ```
 */
export function useIdentify(userId: string | null, properties?: UserProperties) {
  const analytics = useAnalytics();

  useEffect(() => {
    if (userId && analytics.isEnabled()) {
      analytics.identify(userId, properties);
    }
  }, [analytics, userId, properties]);
}
