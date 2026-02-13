# Netlify Deployment Guide

## Deploying to Netlify

### Step 1: Connect GitHub Repository
1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the `policy-library` repository
6. Click "Deploy site"

### Step 2: Configure Build Settings
The site is already configured with automatic build settings:
- **Build command:** `npm run build`
- **Publish directory:** `out`
- **Base directory:** `website` (if deploying from monorepo root)

These settings are defined in `netlify.toml` at the repository root.

### Step 3: Environment Variables (if needed)
If your site requires environment variables:
1. In Netlify dashboard, go to **Site settings > Build & deploy > Environment**
2. Add any required variables (e.g., API keys, feature flags)
3. Redeploy the site

### Manual Deployment
To test the build locally before deploying:

```bash
cd website
npm run build
```

The static site will be generated in the `out/` directory. You can serve this locally with:

```bash
npx serve out
```

## Next.js Export Configuration

The site is configured as a static export with:
- `output: 'export'` - Generates static HTML/CSS/JS files
- `images: { unoptimized: true }` - Disables Next.js image optimization for static exports

This makes the site fully static and suitable for static hosting like Netlify.

## URL Redirects

All routes are configured to redirect through `index.html` for client-side routing:

```
from = "/*"
to = "/index.html"
status = 200
```

This enables client-side navigation to work properly on static hosts.

## Custom Domain Setup

To add a custom domain:
1. In Netlify dashboard, go to **Site settings > Domain management**
2. Click "Add domain"
3. Enter your custom domain (e.g., `policies.example.com`)
4. Follow DNS configuration steps provided by Netlify
5. Wait for DNS propagation (typically 24-48 hours)

## Troubleshooting

### Build Fails
- Check that `npm run build` works locally in the `website/` directory
- Verify all dependencies are installed: `npm install`
- Check `next.config.ts` and `tsconfig.json` for configuration errors

### Site Shows 404s
- Verify the `netlify.toml` redirect rule is correctly configured
- Ensure the publish directory is set to `out`
- Check that Next.js build completed successfully

### Images Not Loading
- Ensure `images: { unoptimized: true }` is set in `next.config.ts`
- Verify image paths are relative and correct
- Check browser console for 404 errors on image requests

## Build Output

After running `npm run build`, the static site is generated in the `out/` directory:
```
out/
├── index.html
├── _next/
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── data/
├── policies/
│   ├── covered-entities/
│   └── business-associates/
└── [other routes].html
```

This entire `out/` directory is deployed to Netlify.
