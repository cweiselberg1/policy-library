'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/lib/mixpanel/useAnalytics';
import { trackPageView } from '@/lib/mixpanel/events';

interface PageViewTrackerProps {
  pageName: string;
  properties?: Record<string, any>;
}

/**
 * Client component to track page views
 * Use this in server components to add analytics tracking
 */
export function PageViewTracker({ pageName, properties }: PageViewTrackerProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    const event = trackPageView(pageName, properties);
    track(event.event, event.properties);
  }, [pageName, properties, track]);

  return null;
}
