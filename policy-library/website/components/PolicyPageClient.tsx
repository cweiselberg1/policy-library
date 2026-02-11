'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/lib/mixpanel/useAnalytics';
import { trackPolicyView, trackPolicyDownload } from '@/lib/mixpanel/events';

interface PolicyPageClientProps {
  policyId: string;
  policyTitle: string;
  entityType: string;
}

/**
 * Client component to track policy views
 */
export function PolicyPageClient({ policyId, policyTitle, entityType }: PolicyPageClientProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    const event = trackPolicyView(policyId, policyTitle, entityType);
    track(event.event, event.properties);
  }, [policyId, policyTitle, entityType, track]);

  return null;
}

/**
 * Hook for tracking policy downloads
 */
export function useTrackPolicyDownload() {
  const { track } = useAnalytics();

  const trackDownload = (policyId: string, policyTitle: string, entityType: string) => {
    const event = trackPolicyDownload(policyId, policyTitle, entityType);
    track(event.event, event.properties);
  };

  return { trackDownload };
}
