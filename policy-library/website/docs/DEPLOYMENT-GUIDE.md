# Deployment Guide

## Overview

This guide covers deployment procedures for the Policy Library website and associated services. The system spans multiple platforms:

- **Policy Library Website**: Vercel (primary) + static export option
- **Incident Management Portal**: Contabo VPS (unverified)
- **Database**: Supabase (PostgreSQL)
- **DNS**: Cloudflare/FastComet
- **Monitoring**: Mixpanel, error tracking

**Last Updated**: February 13, 2026
**Status**: Policy Library verified working. Incident portal deployment unverified.

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Vercel Deployment (Policy Library)](#vercel-deployment-policy-library)
3. [Contabo Deployment (Incident Portal)](#contabo-deployment-incident-portal)
4. [Supabase Database Management](#supabase-database-management)
5. [DNS and Cloudflare Configuration](#dns-and-cloudflare-configuration)
6. [SSL Certificate Management](#ssl-certificate-management)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- Node.js 18+ (v18 recommended)
- Git
- Supabase CLI (for database operations)
- Vercel CLI (optional, for local testing)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/cweiselberg1/policy-library.git
cd policy-library/website

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

### Environment Configuration

Edit `.env.local` with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jyjytbwjifeqtfowqcqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Mixpanel Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=<your-mixpanel-token>

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_TRAINING=true
NEXT_PUBLIC_ENABLE_INCIDENTS=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Note**: Do not commit `.env.local` to version control. Use `.env.example` as the template.

### Running Locally

```bash
# Development server
npm run dev

# Production build (local)
npm run build
npm start

# Analyze bundle size (optional)
npm run build:analyze
```

Visit `http://localhost:3000` to verify.

### Testing Locally

```bash
# Lint code
npm run lint

# Type checking
npx tsc --noEmit

# Run browser tests (Playwright)
npx playwright test
```

---

## Vercel Deployment (Policy Library)

### Status: ✅ VERIFIED WORKING

The Policy Library website is deployed to Vercel and is currently production-ready.

**Live Site**: https://oneguyconsulting.com
**Preview URL**: https://policy-library-staging.vercel.app

### Prerequisites

- GitHub account with repository access
- Vercel account (or create free tier)
- GitHub personal access token (if needed)

### Deployment Process

#### Option 1: Automatic Deployment (Recommended)

Vercel automatically deploys on every `git push` to `main` branch.

```bash
# Make changes
git add .
git commit -m "feat: description of changes"
git push origin main

# Vercel automatically builds and deploys
# Check https://vercel.com/deployments for status
```

#### Option 2: Manual Deployment via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Follow prompts to link project (first time only)
```

#### Option 3: Dashboard Deployment

1. Go to https://vercel.com/dashboard
2. Select "policy-library" project
3. Click "Deployments" tab
4. Click the latest commit
5. Click "Promote to Production" button

### Pre-Deployment Checklist

Before deploying, verify:

```bash
# Type checking
npx tsc --noEmit

# Build locally
npm run build

# Check build succeeds with no errors
# Expected output: ✓ Compiled successfully
```

### Deployment Configuration

The project includes `.vercel.json` (if needed) for custom routing:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Environment Variables in Vercel

Set in Vercel Dashboard: Project → Settings → Environment Variables

Required variables (same as local `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MIXPANEL_TOKEN`
- `NEXT_PUBLIC_APP_URL=https://oneguyconsulting.com`

### Monitoring Deployments

#### View Deployment Status

1. Go to https://vercel.com/deployments
2. Click on a deployment to see:
   - Build logs
   - Performance metrics
   - Function invocations
   - Error rates

#### Performance Insights

Vercel provides Web Vitals:
- **LCP** (Largest Contentful Paint): Target < 2.5s
- **CLS** (Cumulative Layout Shift): Target < 0.1
- **FID** (First Input Delay): Target < 100ms

View at: Project → Analytics → Web Vitals

### Vercel CLI Commands Reference

```bash
# List all deployments
vercel list

# View deployment details
vercel inspect <deployment-url>

# View logs
vercel logs

# Set environment variable
vercel env add VARIABLE_NAME

# Clear cache and redeploy
vercel --prod --skip-build
```

---

## Contabo Deployment (Incident Portal)

### Status: ⚠️ UNVERIFIED - Server currently unreachable

The Incident Portal deployment script exists but has not been tested on a live Contabo server. Use with caution.

**Target Domain**: https://portal.oneguyconsulting.com (DNS not configured)

### Prerequisites

- Contabo VPS (2GB+ RAM, Ubuntu 20.04+ recommended)
- SSH access to VPS
- Domain name (portal.oneguyconsulting.com)
- DNS management access

### Pre-Deployment Verification

**Important**: Before running the deployment script, verify your server:

```bash
# SSH into your Contabo VPS
ssh root@<your-vps-ip>

# Check Ubuntu version
lsb_release -a

# Verify internet connectivity
ping google.com

# Check available disk space
df -h

# Check available memory
free -h
```

System should have at least:
- 2GB RAM
- 10GB free disk space
- Ubuntu 20.04 LTS or later

### Deployment Script

The script `/Users/chuckw./incident-management-system/deploy-contabo.sh` automates deployment.

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Incident Management Portal to Contabo VPS..."

# Install Node.js 18 if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    apt-get update
    apt-get install -y nginx certbot python3-certbot-nginx
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Create app directory
mkdir -p /var/www/incident-portal
cd /var/www/incident-portal

# Clone from GitHub
echo "📥 Cloning application..."
git clone https://github.com/cweiselberg1/incident-management-portal.git .

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🏗️  Building application..."
npm run build

# Create .env file (with placeholders - FILL THESE IN)
cat > .env << 'EOF'
NODE_ENV=production
PORT=5007
COOKIE_SECURE=true
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
SESSION_SECRET=your-secret-key-here
RESEND_API_KEY=your-resend-key
EMAIL_FROM=incidents@oneguyconsulting.com
PRIVACY_OFFICER_EMAIL=your-email@example.com
APP_URL=https://portal.oneguyconsulting.com
EOF

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete incident-portal 2>/dev/null || true
pm2 start dist/index.js --name incident-portal
pm2 save
pm2 startup systemd -u root --hp /root

# Configure nginx
echo "⚙️  Configuring nginx..."
cat > /etc/nginx/sites-available/incident-portal << 'EOF'
server {
    listen 80;
    server_name portal.oneguyconsulting.com;

    location / {
        proxy_pass http://localhost:5007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/incident-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Deployment complete!"
```

### Manual Deployment Steps (UNVERIFIED)

⚠️ **Warning**: These steps have not been tested. Proceed with caution.

```bash
# 1. SSH into VPS
ssh root@<your-vps-ip>

# 2. Update system
apt-get update
apt-get upgrade -y

# 3. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs npm

# 4. Install nginx
apt-get install -y nginx certbot python3-certbot-nginx

# 5. Install PM2 globally
npm install -g pm2

# 6. Clone application
mkdir -p /var/www/incident-portal
cd /var/www/incident-portal
git clone https://github.com/cweiselberg1/incident-management-portal.git .

# 7. Install dependencies
npm install

# 8. Build
npm run build

# 9. Create .env file
# IMPORTANT: Edit with your actual values!
cat > .env << 'EOF'
NODE_ENV=production
PORT=5007
COOKIE_SECURE=true
DATABASE_URL=postgresql://username:password@host:5432/database
SESSION_SECRET=your-random-secret
RESEND_API_KEY=your-api-key
EMAIL_FROM=incidents@oneguyconsulting.com
PRIVACY_OFFICER_EMAIL=your-email@example.com
APP_URL=https://portal.oneguyconsulting.com
EOF

# 10. Start with PM2
pm2 start dist/index.js --name incident-portal
pm2 save
pm2 startup
pm2 save

# 11. Configure nginx reverse proxy
cat > /etc/nginx/sites-available/incident-portal << 'EOF'
server {
    listen 80;
    server_name portal.oneguyconsulting.com;

    location / {
        proxy_pass http://localhost:5007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/incident-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 12. Server IP (for DNS configuration)
curl -s ifconfig.me
```

### Post-Deployment (UNVERIFIED)

After deployment, the next steps are:

```bash
# 1. Point DNS to VPS IP (see DNS section below)
# 2. Wait 5-30 minutes for DNS propagation
# 3. Install SSL certificate

certbot --nginx -d portal.oneguyconsulting.com
```

### Monitoring Contabo Deployment (UNVERIFIED)

If deployment were working:

```bash
# SSH to server
ssh root@<your-vps-ip>

# Check application status
pm2 status

# View logs
pm2 logs incident-portal

# Restart application
pm2 restart incident-portal

# Check nginx status
systemctl status nginx

# View nginx error logs
tail -f /var/log/nginx/error.log
```

### Rollback on Contabo (UNVERIFIED)

```bash
# SSH to server
ssh root@<your-vps-ip>

# Stop application
pm2 stop incident-portal

# Restore previous version from git
cd /var/www/incident-portal
git checkout <previous-commit>

# Rebuild and restart
npm install
npm run build
pm2 restart incident-portal
```

---

## Supabase Database Management

### Database Connection

**Project ID**: jyjytbwjifeqtfowqcqf
**Region**: us-east-1
**Database**: PostgreSQL

### Accessing Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Login with your credentials
3. Select "policy-library" project
4. Navigate to relevant section

### Applying Database Migrations

Migrations are version-controlled in `/supabase/migrations/`

#### Option 1: Supabase Dashboard (Easiest)

```bash
# 1. Go to Supabase Dashboard
# 2. Click "SQL Editor"
# 3. Click "New Query"
# 4. Copy contents of migration file:
cat /Users/chuckw./policy-library/website/supabase/migrations/20260212_incident_management.sql

# 5. Paste into SQL Editor
# 6. Click "Run"
# 7. Verify success message
```

#### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Push migrations to remote
cd /Users/chuckw./policy-library/website
supabase db push

# Verify migrations applied
supabase db show
```

### Database Schema Verification

```bash
# View all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

# View table structure
\d+ table_name

# Check indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

### Backup and Recovery

#### Automated Backups (Supabase)

Supabase performs daily backups automatically. Access via Dashboard:

1. Go to Project → Settings → Backups
2. View backup history
3. Download specific backups if needed

#### Manual Backup

```bash
# Export entire database
pg_dump -h jyjytbwjifeqtfowqcqf.supabase.co \
  -U postgres \
  -d postgres > backup-$(date +%Y%m%d).sql

# Export specific table
pg_dump -h jyjytbwjifeqtfowqcqf.supabase.co \
  -U postgres \
  -d postgres \
  -t table_name > table_backup.sql
```

#### Restore from Backup

```bash
# Restore entire database
psql -h jyjytbwjifeqtfowqcqf.supabase.co \
  -U postgres \
  -d postgres < backup-20260213.sql

# Restore specific table
psql -h jyjytbwjifeqtfowqcqf.supabase.co \
  -U postgres \
  -d postgres < table_backup.sql
```

### Monitoring Database

#### View Logs

In Supabase Dashboard: Project → Logs

```bash
# Filter by error level
SELECT * FROM postgres_logs WHERE level = 'ERROR';

# Check slow queries
SELECT * FROM postgres_logs
WHERE duration_ms > 1000
ORDER BY timestamp DESC;
```

#### Connection Pool Status

In Dashboard: Project → Settings → Database

- Check active connections
- View max connections (usually 30 for free tier)
- Monitor usage patterns

### Row-Level Security (RLS)

Database policies control data access. View in Dashboard:

Project → Authentication → Policies

Current policies:
- Users can only view own profile data
- Privacy officers can view incidents in their organization
- Employees can view own incident reports

---

## DNS and Cloudflare Configuration

### Current DNS Setup

**Primary Domain**: oneguyconsulting.com
**Registrar**: FastComet (or Namecheap)
**DNS Provider**: Cloudflare (recommended)

### Vercel Domain Configuration

#### Add Domain to Vercel

1. Go to https://vercel.com/dashboard
2. Select "policy-library" project
3. Click Settings → Domains
4. Click "Add"
5. Enter: `oneguyconsulting.com`
6. Click "Add" again for `www.oneguyconsulting.com`

#### Vercel provides DNS records to add:

Vercel will show:
- A record for `@` pointing to Vercel IP
- CNAME record for `www` pointing to Vercel DNS

### Cloudflare Configuration (Recommended)

#### Step 1: Add Site to Cloudflare

```bash
# Go to https://dash.cloudflare.com
# Click "Add a domain"
# Enter: oneguyconsulting.com
# Select free plan
# Follow setup wizard
```

#### Step 2: Update Nameservers

In your registrar (FastComet/Namecheap):

1. Find "Nameservers" or "DNS" settings
2. Change to Cloudflare nameservers:
   - `alice.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`
3. Wait 24-48 hours for propagation

#### Step 3: Configure DNS Records in Cloudflare

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | @ | `76.76.21.21` (Vercel) | Proxied |
| CNAME | www | `cname.vercel-dns.com` | Proxied |
| CNAME | api | Your API domain | DNS only |

#### Step 4: Configure SSL/TLS

In Cloudflare Dashboard:

1. Go to SSL/TLS → Overview
2. Select "Full" or "Full (strict)"
3. Go to SSL/TLS → Edge Certificates
4. Enable "Always Use HTTPS"
5. Enable "Automatic HTTPS Rewrites"

#### Step 5: Configure Page Rules (Optional)

1. Go to Rules → Page Rules
2. Add rule: `oneguyconsulting.com/*`
3. Actions:
   - Always Use HTTPS: ON
   - Minimum TLS Version: TLS 1.2

### DNS Propagation Verification

```bash
# Check DNS propagation
nslookup oneguyconsulting.com

# Expected output:
# Address: 76.76.21.21 (Vercel IP)

# Check CNAME resolution
nslookup www.oneguyconsulting.com

# View all DNS records
dig oneguyconsulting.com +short

# Check from multiple locations
https://www.whatsmydns.net/
```

### Update DNS for Contabo (UNVERIFIED)

If deploying Incident Portal to Contabo:

```bash
# 1. Get your Contabo VPS IP
ssh root@<vps-ip>
curl -s ifconfig.me
# Example output: 185.215.xxx.xxx

# 2. In Cloudflare, add DNS record:
# Type: A
# Name: portal
# Value: 185.215.xxx.xxx (your Contabo IP)
# Proxy: DNS only (required for non-Cloudflare servers)

# 3. Wait for propagation
nslookup portal.oneguyconsulting.com
```

---

## SSL Certificate Management

### Vercel SSL (Automatic)

Vercel automatically:
- Issues SSL certificates via Let's Encrypt
- Renews certificates automatically (60+ days before expiry)
- Handles all certificate management

No action required.

### Contabo SSL (Manual - UNVERIFIED)

If using Contabo:

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Issue certificate
certbot --nginx -d portal.oneguyconsulting.com

# Auto-renewal verification
systemctl enable certbot.timer
systemctl start certbot.timer

# Check renewal status
certbot renew --dry-run

# View certificates
certbot certificates
```

### Certificate Monitoring

#### Vercel Certificate Status

In Vercel Dashboard: Project → Settings → Certificates

Shows:
- Expiration date
- Issuance date
- Auto-renewal status

#### Monitor Certificates

```bash
# Check certificate expiry (macOS)
echo | openssl s_client -servername oneguyconsulting.com \
  -connect oneguyconsulting.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Get all cert details
openssl s_client -servername oneguyconsulting.com \
  -connect oneguyconsulting.com:443 </dev/null 2>/dev/null | \
  openssl x509 -text
```

---

## Post-Deployment Verification

### Immediate Checks (5-10 minutes after deployment)

```bash
# 1. Check site loads
curl -I https://oneguyconsulting.com
# Expected: HTTP/1.1 200 OK

# 2. Check homepage renders
curl https://oneguyconsulting.com | head -50

# 3. Check all main routes
curl -I https://oneguyconsulting.com/covered-entities
curl -I https://oneguyconsulting.com/business-associates
curl -I https://oneguyconsulting.com/audit/it-risk
curl -I https://oneguyconsulting.com/dashboard/privacy-officer
curl -I https://oneguyconsulting.com/blog

# 4. Check API endpoints
curl https://oneguyconsulting.com/api/health 2>/dev/null || echo "API endpoint not available"
```

### Functional Verification (via browser)

1. **Homepage**
   - [ ] Page loads
   - [ ] All policy cards visible
   - [ ] Links work
   - [ ] Analytics fire (check Network tab)

2. **Policy Pages**
   - [ ] Click a policy card
   - [ ] Policy detail page loads
   - [ ] PDF download works
   - [ ] Search functionality works

3. **Authentication (if applicable)**
   - [ ] Login page loads
   - [ ] Login works
   - [ ] Session persists
   - [ ] Logout works

4. **Blog Section**
   - [ ] Blog page loads
   - [ ] Articles display
   - [ ] Article detail loads
   - [ ] Formatting is correct

5. **Audit Tools**
   - [ ] Physical Audit page loads
   - [ ] IT Risk Assessment loads
   - [ ] Forms are interactive
   - [ ] Export functionality works

### Performance Verification

Check Vercel Analytics:

```bash
# Deployment metrics
# - Build time (should be < 2 minutes)
# - Function calls (check for errors)
# - Response times (should be < 500ms)
```

In browser, check Web Vitals:

```bash
# Open DevTools → Performance
# Check:
# - Largest Contentful Paint (LCP) < 2.5s
# - First Input Delay (FID) < 100ms
# - Cumulative Layout Shift (CLS) < 0.1
```

### Security Verification

```bash
# 1. SSL certificate check
curl -vI https://oneguyconsulting.com 2>&1 | grep -i certificate

# 2. Security headers
curl -I https://oneguyconsulting.com | grep -i "strict-transport\|x-frame\|x-content"

# 3. Check HSTS enabled
curl -I https://oneguyconsulting.com | grep -i hsts

# 4. Run SSL test
# Go to: https://www.ssllabs.com/ssltest/
# Enter: oneguyconsulting.com
# Expected grade: A or A+
```

### Monitoring Setup

#### Mixpanel Verification

1. Go to https://mixpanel.com
2. Select project
3. Check events are firing:
   - page_view
   - policy_accessed
   - assessment_started
   - etc.

#### Error Tracking

If using Sentry:
1. Go to https://sentry.io
2. Select "policy-library" project
3. Verify no new errors
4. Check error trends

---

## Rollback Procedures

### Vercel Rollback (Instant)

If deployment causes issues:

```bash
# Via Vercel Dashboard
# 1. Go to https://vercel.com/deployments
# 2. Find the previous working deployment
# 3. Click the "..." menu
# 4. Click "Promote to Production"
# 5. Done - takes 30 seconds

# Via Vercel CLI
vercel rollback
```

### Git Rollback (If needed)

```bash
# Find previous working commit
git log --oneline | head -10

# Revert to specific commit
git revert <commit-hash>
git push origin main

# Vercel auto-deploys the reverted code
```

### Database Rollback (Supabase)

```bash
# In Supabase Dashboard
# 1. Go to Settings → Backups
# 2. Find the backup before the change
# 3. Click "Restore"
# 4. Confirm - this is destructive

# Or restore from backup file
psql < backup-20260213.sql
```

### Contabo Rollback (UNVERIFIED)

```bash
# SSH to server
ssh root@<vps-ip>

# Stop application
pm2 stop incident-portal

# Restore previous code
cd /var/www/incident-portal
git log --oneline
git checkout <previous-commit>

# Rebuild
npm install
npm run build

# Restart
pm2 restart incident-portal
```

---

## Troubleshooting

### Common Deployment Issues

#### Issue: Build fails with "Dependency not found"

```bash
# Solution 1: Clear cache and rebuild
npm cache clean --force
npm install
npm run build

# Solution 2: Check Node version
node --version
# Should be 18+

# Solution 3: Check for package-lock issues
rm package-lock.json
npm install
```

#### Issue: TypeScript errors after deployment

```bash
# Run type check locally
npx tsc --noEmit

# Fix any errors, then:
git add .
git commit -m "fix: resolve TypeScript errors"
git push
```

#### Issue: 404 on routes after deployment

Check if route file exists:

```bash
# For route /audit/it-risk, file should be:
ls -la app/audit/it-risk/page.tsx

# If missing, create it:
# See MISSING-FEATURES.md for details
```

#### Issue: Environment variables not loaded

```bash
# Verify in Vercel Dashboard
# 1. Go to Settings → Environment Variables
# 2. Check variables are set for "Production"
# 3. Redeploy after changes (environment changes require new build)

# Verify in Next.js
# Variables starting with NEXT_PUBLIC_ are available to browser
# Other variables are server-only
```

#### Issue: Database connection errors

```bash
# Verify Supabase credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check Supabase project is active
# Dashboard → Project → Settings → General

# Verify database is running
# Dashboard → Logs → Recent logs

# Check connection limits
# Dashboard → Settings → Database → Connections
```

#### Issue: Slow page loads

```bash
# Check Vercel Analytics
# 1. Go to Analytics → Web Vitals
# 2. Identify slow pages
# 3. Check function execution time

# Optimize images
# Use Next.js Image component with proper sizing

# Check API response times
# Use Vercel Functions to optimize backend

# Clear Cloudflare cache if applicable
# https://dash.cloudflare.com → Purge Cache
```

### Debug Commands

```bash
# Check server status
curl -I https://oneguyconsulting.com

# Check DNS resolution
nslookup oneguyconsulting.com
dig oneguyconsulting.com

# Check certificate
openssl s_client -servername oneguyconsulting.com \
  -connect oneguyconsulting.com:443 </dev/null

# Monitor Vercel logs
vercel logs --follow

# View build logs
vercel logs --type=build

# Check Supabase logs
# Dashboard → Logs → Edge Function Logs

# Local testing with production env
NODE_ENV=production npm run build && npm start
```

### Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare Docs**: https://developers.cloudflare.com

---

## Summary

| Environment | Status | Deployment Method | Auto-Deploy | Verification |
|-------------|--------|-------------------|--------------|--------------|
| Local Dev | ✅ | `npm run dev` | - | Browser test |
| Vercel (Prod) | ✅ VERIFIED | Git push + auto | Yes | Live site test |
| Contabo (Incident) | ⚠️ UNVERIFIED | SSH + bash script | No | Manual after DNS |

**Recommendation**: Use Vercel for all new deployments. Contabo deployment is documented but untested.

---

**Last Updated**: February 13, 2026
**Maintained by**: One Guy Consulting
**Version**: 1.0
