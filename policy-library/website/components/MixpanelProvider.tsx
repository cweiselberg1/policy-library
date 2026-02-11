'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/mixpanel/analytics';

interface MixpanelProviderProps {
  children: React.ReactNode;
}

/**
 * Mixpanel Provider Component
 *
 * Initializes Mixpanel with HIPAA-compliant settings.
 * - No IP tracking
 * - No geolocation
 * - Only tracks anonymized events
 */
export function MixpanelProvider({ children }: MixpanelProviderProps) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    const debug = process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === 'true';

    if (token && token !== 'your_token_here') {
      initAnalytics({
        token,
        enabled: true,
        debug,
        region: 'us',
        trackPageViews: false, // We'll track manually for better control
        persistenceType: 'localStorage',
        ignoreDoNotTrack: false, // Respect Do Not Track
        privacyMode: true, // Enable privacy mode for HIPAA compliance
      }).catch((error) => {
        console.error('[Mixpanel] Initialization error:', error);
      });
    } else if (debug) {
      console.log('[Mixpanel] Not initialized - token not configured');
    }
  }, []);

  return <>{children}</>;
}
