'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/lib/mixpanel/useAnalytics';
import { trackPageView, trackNavigate, trackCTAClick } from '@/lib/mixpanel/events';

interface HomeClientProps {
  children: React.ReactNode;
}

export function HomeClient({ children }: HomeClientProps) {
  const { track } = useAnalytics();

  // Track page view on mount
  useEffect(() => {
    const event = trackPageView('Home');
    track(event.event, event.properties);
  }, [track]);

  return <>{children}</>;
}

// Hook for tracking navigation clicks
export function useTrackNavigation() {
  const { track } = useAnalytics();

  const trackNavigationClick = (destination: 'CE' | 'BA', source: string) => {
    const event = trackNavigate(destination, source);
    track(event.event, event.properties);
  };

  const trackCTA = (ctaName: string, ctaLocation: string) => {
    const event = trackCTAClick(ctaName, ctaLocation);
    track(event.event, event.properties);
  };

  return { trackNavigationClick, trackCTA };
}
