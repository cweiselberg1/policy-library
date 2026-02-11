/**
 * Mixpanel Integration - React Context Provider (Next.js)
 *
 * Optional React Context provider for analytics.
 * Use if you prefer context-based approach over direct hook usage.
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AnalyticsContextValue, MixpanelConfig } from './types';
import { initAnalytics } from './analytics';
import { useAnalytics } from './useAnalytics';

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  config: MixpanelConfig;
}

/**
 * Analytics Provider Component
 *
 * Wrap your app with this provider to initialize analytics.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AnalyticsProvider } from '@/lib/mixpanel/provider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AnalyticsProvider
 *           config={{
 *             token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!,
 *             enabled: process.env.NODE_ENV === 'production',
 *             region: 'us',
 *           }}
 *         >
 *           {children}
 *         </AnalyticsProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AnalyticsProvider({ children, config }: AnalyticsProviderProps) {
  const analytics = useAnalytics();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && config.token) {
      initAnalytics(config).then(() => {
        setInitialized(true);
      });
    }
  }, [config, initialized]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics from context
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useAnalyticsContext } from '@/lib/mixpanel/provider';
 *
 * export default function MyComponent() {
 *   const analytics = useAnalyticsContext();
 *
 *   const handleClick = () => {
 *     analytics.track('Button Clicked');
 *   };
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export function useAnalyticsContext(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
}
