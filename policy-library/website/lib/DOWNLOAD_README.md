# Download Functionality

This document describes the client-side download functionality for the HIPAA Policy Library.

## Overview

The download system allows users to download individual policies or complete policy packages as ZIP files. Since the site uses Next.js static export, all download functionality is implemented client-side using the browser's download API.

## Architecture

### Files

1. **`lib/download.ts`** - Core download utilities (client-side compatible)
2. **`components/DownloadButton.tsx`** - Bulk download button for entity types
3. **`components/PolicyDownloadButton.tsx`** - Individual policy download button
4. **`app/downloads/page.tsx`** - Dedicated downloads page

### Key Functions

#### `downloadPolicy(policy, content)`
Downloads a single policy as a markdown file.

**Parameters:**
- `policy`: Object with `title` property
- `content`: Policy markdown content

**Behavior:**
- Sanitizes the policy title for use as filename
- Creates a `.md` file download
- Triggers browser download dialog

#### `downloadPoliciesAsZip(policies, entityType)`
Downloads all policies for an entity type as a ZIP file.

**Parameters:**
- `policies`: Array of policy objects with `file_path` and `content`
- `entityType`: `'covered_entity'` or `'business_associate'`

**Behavior:**
- Creates a ZIP file using JSZip
- Preserves directory structure from `file_path`
- Removes entity type prefix to avoid duplication
- Filename format: `{type}-policies-{YYYY-MM-DD}.zip`
- Uses DEFLATE compression (level 9)

#### `downloadSelectedPolicies(policies, filename)`
Downloads a custom selection of policies as a ZIP file.

**Parameters:**
- `policies`: Array of policy objects with `file_path` and `content`
- `filename`: Custom filename (default: `'selected-policies.zip'`)

**Behavior:**
- Same as `downloadPoliciesAsZip` but with custom filename

## Usage

### Bulk Download Button

```tsx
import { DownloadButton } from '@/components/DownloadButton';
import { getAllPolicies, getPolicyContent } from '@/lib/policies';

export default function Page() {
  // Prepare policies with content on server-side
  const policies = getAllPolicies('covered_entity').map(p => ({
    ...p,
    content: getPolicyContent(p)
  }));

  return (
    <DownloadButton
      policies={policies}
      entityType="covered_entity"
      label="Download All CE Policies"
    />
  );
}
```

### Individual Policy Download

```tsx
import { PolicyDownloadButton } from '@/components/PolicyDownloadButton';
import { getPolicyById, getPolicyContent } from '@/lib/policies';

export default function PolicyPage({ params }) {
  const policy = getPolicyById(params.id, 'covered_entity');
  const content = getPolicyContent(policy);

  return (
    <PolicyDownloadButton
      policy={policy}
      content={content}
      variant="primary"
    />
  );
}
```

## Implementation Notes

### Server-Side Data Preparation

Because the download functions run in the browser, policy content must be prepared server-side:

```tsx
// ✅ CORRECT - Prepare content on server
export default function Page() {
  const policies = getAllPolicies('covered_entity').map(p => ({
    ...p,
    content: getPolicyContent(p)  // Server-side only
  }));

  return <DownloadButton policies={policies} entityType="covered_entity" />;
}

// ❌ WRONG - Can't read files in browser
'use client';
export function ClientComponent() {
  const handleClick = () => {
    const policies = getAllPolicies('covered_entity');
    // getPolicyContent() won't work here - it uses Node.js fs
  };
}
```

### Static Export Compatibility

The download functionality is fully compatible with Next.js static export (`output: 'export'`):

- No API routes required
- All logic runs in the browser
- Works on any static host (Netlify, Vercel, S3, etc.)

### Browser Compatibility

The download functions use standard browser APIs:
- `Blob` API
- `URL.createObjectURL()`
- `HTMLAnchorElement.download`

Compatible with all modern browsers. No server-side processing required.

## ZIP File Structure

Downloaded ZIP files preserve the original directory structure:

```
covered-entities-policies-2026-02-02.zip
├── privacy-rule/
│   ├── administrative-requirements/
│   │   ├── notice_of_privacy_practices_policy_p.md
│   │   ├── personal_representatives_policy.md
│   │   └── ...
│   ├── use-and-disclosure/
│   │   └── ...
│   └── individual-rights/
│       └── ...
├── security-rule/
│   ├── administrative-safeguards/
│   ├── physical-safeguards/
│   └── technical-safeguards/
└── breach-notification/
    └── ...
```

## Testing

The downloads page (`/downloads`) provides a user-friendly interface for testing bulk downloads:

```bash
npm run dev
# Navigate to http://localhost:3000/downloads
```

## Dependencies

- **jszip** (v3.10.1) - ZIP file creation
- Included in `package.json`

## Future Enhancements

Potential improvements:
- Progress indicators for large ZIP files
- Download resume capability
- Custom policy selection interface
- PDF export option
- Email delivery option
