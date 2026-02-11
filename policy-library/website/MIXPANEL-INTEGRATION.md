# Mixpanel Analytics Integration

This document describes the Mixpanel analytics integration for the HIPAA Policy Library website.

## Overview

Mixpanel is integrated to track user behavior and engagement with the policy library. The integration is designed to be **HIPAA-compliant** by default, ensuring no personally identifiable information (PII) is tracked.

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Mixpanel Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=your_actual_token_here
NEXT_PUBLIC_MIXPANEL_DEBUG=true  # Set to false in production
```

**Getting a Mixpanel Token:**
1. Sign up at [mixpanel.com](https://mixpanel.com)
2. Create a new project
3. Copy your project token from Project Settings
4. Paste it into `.env.local`

### 2. HIPAA Compliance Settings

The integration is pre-configured with HIPAA-compliant settings:

- ✅ **No IP address tracking** - `ignoreDoNotTrack: false`
- ✅ **Privacy mode enabled** - Blocks tracking of URLs, referrers, and domains
- ✅ **Respects Do Not Track** - Honors browser DNT settings
- ✅ **No PII tracking** - Only tracks policy IDs, categories, and interaction types
- ✅ **Graceful degradation** - Works without token, doesn't break the site

### 3. Installation

Dependencies are already installed:
```bash
npm install mixpanel-browser
```

## Events Being Tracked

### Page Views
| Event Name | Properties | Triggered When |
|------------|-----------|----------------|
| `Page View` | `page_name`, `entity_type`, `policy_count` | User visits any page |
| `Policy View` | `policy_id`, `policy_title`, `entity_type` | User views a specific policy |

### Search & Filters
| Event Name | Properties | Triggered When |
|------------|-----------|----------------|
| `Search Query` | `search_query`, `query_length`, `entity_type` | User types in search box |
| `Search Results` | `search_query`, `result_count`, `has_results` | Search results are displayed |
| `Filter Category` | `category`, `entity_type` | User changes category filter |
| `Filter Clear` | `entity_type` | User clears all filters |

### Downloads
| Event Name | Properties | Triggered When |
|------------|-----------|----------------|
| `Download Policy` | `policy_id`, `policy_title`, `entity_type` | User downloads a policy |

### Navigation
| Event Name | Properties | Triggered When |
|------------|-----------|----------------|
| `Navigate to CE` | `source`, `destination` | User navigates to CE policies |
| `Navigate to BA` | `source`, `destination` | User navigates to BA policies |

## File Structure

```
website/
├── lib/
│   └── mixpanel/
│       ├── analytics.ts        # Core analytics service
│       ├── types.ts            # TypeScript type definitions
│       ├── useAnalytics.ts     # React hook for tracking
│       ├── provider.tsx        # Original provider (not used)
│       ├── events.ts           # Event tracking utilities
│       ├── index.ts            # Exports
│       ├── middleware.ts       # Server-side tracking (optional)
│       ├── react-hook.tsx      # Additional hooks
│       ├── server.ts           # Server-side utilities
│       └── useAnalytics.ts     # Client hook
├── components/
│   ├── MixpanelProvider.tsx    # Simplified provider component
│   ├── PageViewTracker.tsx     # Page view tracking component
│   ├── PolicyPageClient.tsx    # Policy page tracking
│   └── HomeClient.tsx          # Home page tracking utilities
└── app/
    ├── layout.tsx              # MixpanelProvider wrapper
    ├── page.tsx                # Home page with tracking
    ├── covered-entities/
    │   └── page.tsx            # CE page with tracking
    ├── business-associates/
    │   └── page.tsx            # BA page with tracking
    └── policies/
        └── [id]/
            └── page.tsx        # Policy detail page with tracking
```

## How to Add New Events

### 1. Define the Event in `lib/mixpanel/events.ts`

```typescript
export const EVENTS = {
  // ... existing events
  YOUR_NEW_EVENT: 'Your New Event',
} as const;

export function trackYourNewEvent(param1: string, param2: number) {
  return {
    event: EVENTS.YOUR_NEW_EVENT,
    properties: {
      param1,
      param2,
      timestamp: new Date().toISOString(),
    },
  };
}
```

### 2. Use in a Client Component

```typescript
'use client';

import { useAnalytics } from '@/lib/mixpanel/useAnalytics';
import { trackYourNewEvent } from '@/lib/mixpanel/events';

export function YourComponent() {
  const { track } = useAnalytics();

  const handleAction = () => {
    const event = trackYourNewEvent('value1', 42);
    track(event.event, event.properties);
  };

  return <button onClick={handleAction}>Click Me</button>;
}
```

### 3. For Server Components

Use the `PageViewTracker` component or create a similar client component:

```typescript
// In your server component
import { PageViewTracker } from '@/components/PageViewTracker';

export default function ServerPage() {
  return (
    <>
      <PageViewTracker pageName="Your Page" properties={{ custom: 'data' }} />
      {/* ... rest of your content */}
    </>
  );
}
```

## Testing

### Local Testing

1. Set `NEXT_PUBLIC_MIXPANEL_DEBUG=true` in `.env.local`
2. Run `npm run dev`
3. Open browser console
4. Look for `[Analytics]` log messages
5. Navigate around the site and verify events are logged

### Verify in Mixpanel Dashboard

1. Log into your Mixpanel project
2. Go to "Events" tab
3. You should see events appearing in real-time
4. Check "Live View" to see events as they happen

### Test HIPAA Compliance

Verify these are **NOT** tracked:
- ❌ User IP addresses
- ❌ Email addresses
- ❌ Names
- ❌ Device IDs
- ❌ Full URLs (only page names)

Verify these **ARE** tracked:
- ✅ Policy IDs (e.g., `covered-entities/access-control`)
- ✅ Policy titles
- ✅ Entity types (`covered_entity`, `business_associate`)
- ✅ Search queries (anonymized)
- ✅ Category selections
- ✅ Timestamps

## Troubleshooting

### Events Not Appearing in Console

1. Check `.env.local` has `NEXT_PUBLIC_MIXPANEL_DEBUG=true`
2. Restart dev server after changing env vars
3. Clear browser cache
4. Check browser console for errors

### Events Not Appearing in Mixpanel Dashboard

1. Verify token is correct in `.env.local`
2. Check token is not `your_token_here` (placeholder)
3. Wait 1-2 minutes for events to appear (not always instant)
4. Check "Live View" in Mixpanel for real-time events
5. Verify project is not archived in Mixpanel

### TypeScript Errors

1. Ensure all imports are correct
2. Run `npm install` to install types
3. Restart TypeScript server in VSCode

## Privacy & Opt-Out

Users can opt out of tracking in two ways:

1. **Browser Do Not Track:** The integration respects the browser's DNT header
2. **Disable Token:** If no token is configured, tracking is disabled automatically

To completely disable analytics:
```bash
# Remove or comment out in .env.local
# NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

## Production Deployment

Before deploying to production:

1. ✅ Set production Mixpanel token in Netlify environment variables
2. ✅ Set `NEXT_PUBLIC_MIXPANEL_DEBUG=false`
3. ✅ Test events in production Mixpanel project
4. ✅ Verify HIPAA compliance settings are active
5. ✅ Add privacy notice to footer (optional, recommended)

## Support

For questions or issues:
- Mixpanel Documentation: https://docs.mixpanel.com
- Integration Code: See `lib/mixpanel/` directory
- HIPAA Compliance: Review `components/MixpanelProvider.tsx` settings

## License

This integration follows the same license as the parent project.
