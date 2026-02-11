/**
 * Mixpanel Integration - React Hook (Express + React)
 *
 * React hook for Express + React projects (non-Next.js).
 * Use with create-react-app or custom React setups.
 */

import { useEffect, useState, useCallback } from 'react';
import type {
  EventProperties,
  UserProperties,
  AnalyticsContextValue,
} from './types';
import { getAnalytics } from './analytics';

/**
 * React hook for analytics (Express + React)
 *
 * @example
 * ```tsx
 * import { useAnalytics } from './lib/mixpanel/react-hook';
 *
 * function MyComponent() {
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
 * Hook for tracking page views with react-router
 *
 * @example
 * ```tsx
 * import { useLocation } from 'react-router-dom';
 * import { usePageTracking } from './lib/mixpanel/react-hook';
 *
 * function App() {
 *   const location = useLocation();
 *   usePageTracking(location.pathname);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePageTracking(pathname?: string) {
  const analytics = useAnalytics();

  useEffect(() => {
    if (analytics.isEnabled() && pathname) {
      analytics.trackPageView(pathname);
    }
  }, [analytics, pathname]);
}

/**
 * Hook for identifying user automatically
 *
 * @example
 * ```tsx
 * import { useUserIdentification } from './lib/mixpanel/react-hook';
 *
 * function UserProfile({ user }) {
 *   useUserIdentification(user?.id, {
 *     $email: user?.email,
 *     $name: user?.name,
 *   });
 *
 *   return <div>Profile</div>;
 * }
 * ```
 */
export function useUserIdentification(
  userId: string | null | undefined,
  properties?: UserProperties
) {
  const analytics = useAnalytics();

  useEffect(() => {
    if (userId && analytics.isEnabled()) {
      analytics.identify(userId, properties);
    }
  }, [analytics, userId, properties]);
}
