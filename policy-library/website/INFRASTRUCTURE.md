# HIPAA Compliance Portal - Infrastructure Documentation

**Last Updated:** 2026-02-13
**Status:** AUTHORITATIVE - Single Source of Truth
**Verification Status:** PARTIAL - See [Contabo Status](#contabo-verification-status)

---

## Executive Summary

This document describes the production infrastructure for the HIPAA compliance portal, which consists of **TWO SEPARATE SYSTEMS**:

1. **Incident Management System** (Contabo VPS) - portal.oneguyconsulting.com
   - **STATUS: UNVERIFIED** - Server unreachable as of 2026-02-13
2. **Policy Library & Privacy Officer Dashboard** (Vercel) - website-six-sigma-75.vercel.app/policies
   - **STATUS: VERIFIED** - Production ready

Both systems share a Supabase PostgreSQL database but are deployed independently.

---

## Contabo Verification Status

**CRITICAL: Contabo server is currently UNREACHABLE**

- Primary IP (170.64.136.207): Connection timeout
- Alternate IP (194.163.156.233): Permission denied (SSH key mismatch)
- Cannot verify production state, PM2 processes, or Nginx configuration
- All Contabo-specific details marked as **UNVERIFIED** below

**Impact**: Documentation Phase 2 is complete with existing evidence. Production verification (Phase 0-1) BLOCKED pending server access.

**Workaround**: Proceed with policy library deployment to Vercel; Contabo details provided for reference and future restoration.

---

## Production Architecture

### System 1: Incident Management Portal (Contabo VPS)

**⚠️ UNVERIFIED - Server unreachable as of 2026-02-13**

| Component | Value |
|-----------|-------|
| **Server** | Contabo VPS |
| **Primary IP** | 170.64.136.207 |
| **Alternate IP** | 194.163.156.233 |
| **Domain** | portal.oneguyconsulting.com |
| **Stack** | Node.js 18+ Express + PM2 + Nginx |
| **Port** | 5007 (internal), 443 (external via Nginx) |
| **SSH Access** | `ssh -i ~/.ssh/id_rsa_contabo root@170.64.136.207` |
| **Deploy Script** | `/Users/chuckw./incident-management-system/deploy-contabo.sh` |
| **Server Path** | `/var/www/incident-portal/` |
| **Git Source** | https://github.com/cweiselberg1/incident-management-portal.git |

**Purpose:**
- Incident tracking and management
- Physical site audits (HIPAA Step 9)
- IT risk assessments (HIPAA Step 10)
- Data device audits (HIPAA Step 11)
- Remediation plan management (HIPAA Step 4)

**Stack Details:**
- Runtime: Node.js 18+
- Framework: Express.js
- Process Manager: PM2
- Reverse Proxy: Nginx
- SSL: Let's Encrypt (via certbot)
- Database: Supabase PostgreSQL (shared)

**PM2 Process (UNVERIFIED):**
```bash
pm2 list
# Expected output:
# NAME             | STATUS | PORT
# incident-portal  | online | 5007
```

**Nginx Configuration (UNVERIFIED):**
- Location: `/etc/nginx/sites-available/incident-portal`
- Function: Reverse proxy from port 443 → 5007
- SSL: Let's Encrypt certificate termination
- Headers: X-Real-IP, X-Forwarded-For, X-Forwarded-Proto

**Environment Variables (UNVERIFIED):**
```bash
NODE_ENV=production
PORT=5007
COOKIE_SECURE=true
DATABASE_URL=postgresql://[USER]:[PASS]@db.jyjytbwjifeqtfowqcqf.supabase.co:5432/postgres
SESSION_SECRET=[SECURE_VALUE]
RESEND_API_KEY=[CONFIGURED]
EMAIL_FROM=incidents@oneguyconsulting.com
PRIVACY_OFFICER_EMAIL=cweiselberg1@gmail.com
APP_URL=https://portal.oneguyconsulting.com
```

---

### System 2: Policy Library (Vercel)

**✅ VERIFIED - Production ready**

| Component | Value |
|-----------|-------|
| **Platform** | Vercel |
| **Project ID** | prj_BnvVLRajipllQyqSLfLiHYCiYFgR |
| **Production URL** | https://website-six-sigma-75.vercel.app |
| **Base Path** | /policies |
| **Stack** | Next.js 16.1.6 + React 19.2.3 + TypeScript 5 |
| **Build Output** | .next (static and server functions) |
| **Deploy Method** | Git push to main branch (auto-deploy) |
| **Local Path** | `/Users/chuckw./policy-library/website/` |
| **Repository** | policy-library (within monorepo) |

⚠️ **Build Configuration Note:** TypeScript build errors are currently suppressed via `ignoreBuildErrors: true` in next.config.ts. This is temporary until Supabase types are generated. Production deployments should eventually remove this flag to catch type errors.

**Purpose:**
- Policy library documentation (HIPAA Step 5)
- Privacy Officer dashboard (UI complete, APIs pending - HIPAA Step 1)
- Employee policy management
- Policy publication system (HIPAA Step 6)
- Blog and HIPAA compliance guides

**Stack Details:**
- **Runtime**: Node.js (Vercel managed)
- **Framework**: Next.js 16.1.6 (App Router)
- **Frontend**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Markdown Processing**: Remark, Rehype (with GFM support)
- **Analytics**: Mixpanel 2.74.0
- **Database Client**: Supabase JS SDK 2.94.0
- **Authentication**: Supabase Auth with Next.js helpers

**Build Commands:**
```bash
cd /Users/chuckw./policy-library/website

# Development
npm run dev  # Runs on localhost:3000

# Production Build
npm run build  # Outputs to .next/

# Production Start
npm run start  # Runs production server

# Analysis
npm run build:analyze  # Bundle size analysis

# Linting
npm lint  # ESLint checks
```

**Deployment:**
```bash
# 1. Test locally
npm run build

# 2. Commit and push
git add .
git commit -m "feat: description"
git push origin main

# 3. Vercel auto-deploys
# Monitor at: https://vercel.com/dashboard
```

**Rollback:**
- Vercel Dashboard → Deployments tab
- Select previous deployment
- Click "Promote to Production"

**Environment Variables (Vercel):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jyjytbwjifeqtfowqcqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
NEXT_PUBLIC_SITE_URL=https://website-six-sigma-75.vercel.app
NEXT_PUBLIC_MIXPANEL_TOKEN=[MIXPANEL_TOKEN]
NEXT_PUBLIC_MIXPANEL_DEBUG=false
```

**Features:**
- Markdown-based policy documentation with frontmatter
- Server-side policy rendering with sanitization
- Static generation for performance
- Incremental Static Regeneration (ISR) for blog posts
- Policy download as ZIP files
- HIPAA compliance tagging and categorization

---

### Shared Database (Supabase)

**✅ VERIFIED - Production ready**

| Component | Value |
|-----------|-------|
| **Provider** | Supabase (PostgreSQL) |
| **Project ID** | jyjytbwjifeqtfowqcqf |
| **Endpoint** | db.jyjytbwjifeqtfowqcqf.supabase.co:5432 |
| **Database** | postgres |
| **Region** | [Verify in Supabase dashboard] |
| **Access** | Dashboard at supabase.com (cweiselberg1@gmail.com) |
| **Backups** | Daily automated backups (Supabase managed) |

**Key Tables:**

**Organization & Employee Management:**
- `organizations` - HIPAA entities (hospitals, clinics, etc.)
- `departments` - Organizational units
- `employees` - Staff members
- `employee_invitations` - Invitation workflows

**Policy Management:**
- `policy_bundles` - Grouped policy packages
- `department_policy_requirements` - Policy assignments by department
- `employee_policy_assignments` - Individual employee policy tracking
- `policy_publications` - Published policy versions

**Incident Management (UNVERIFIED - Contabo-specific):**
- `incidents` - Incident reports
- `incident_comments` - Discussion threads
- `incident_attachments` - Evidence files
- `remediation_plans` - Remediation tracking

**Security:**
- Row Level Security (RLS) enabled on all tables
- Policies prevent cross-organization access
- Service Role Key required for admin operations
- Anonymous key for client-side reads only

**Connection String (PostgreSQL):**
```bash
postgresql://postgres:[PASSWORD]@db.jyjytbwjifeqtfowqcqf.supabase.co:5432/postgres
```

**Backup Access:**
- Supabase Dashboard → Settings → Database → Backups
- Automated daily backups with 7-day retention
- Manual backups available on-demand

---

### DNS (Cloudflare)

| Record | Type | Name | Value | Proxy | Status |
|--------|------|------|-------|-------|--------|
| Incident Portal | A | portal | 170.64.136.207 | DNS only | **UNVERIFIED** |
| Main Site | A/CNAME | @ | [Verify current] | DNS only | **VERIFY** |
| WWW | CNAME | www | [Verify current] | DNS only | **VERIFY** |

**Nameservers:**
- archer.ns.cloudflare.com
- diva.ns.cloudflare.com

**Domain:** oneguyconsulting.com

**Subdomains:**
- `portal.oneguyconsulting.com` → 170.64.136.207 (Contabo - UNVERIFIED)
- `oneguyconsulting.com` → [Verify Vercel CNAME]
- `www.oneguyconsulting.com` → [Verify Vercel CNAME]

---

## Workflow Status (12-Step HIPAA Process)

| # | Step | Status | Location | Implementation |
|---|------|--------|----------|-----------------|
| 1 | Privacy Officer Assignment | UI COMPLETE, APIs NOT IMPLEMENTED | Vercel /policies/dashboard/privacy-officer/ | Next.js UI components (no backend) |
| 2 | Security Risk Assessment | NOT IMPLEMENTED | -- | Planned |
| 3 | Gap Analysis | NOT IMPLEMENTED | -- | Planned |
| 4 | Remediation Plans | IMPLEMENTED | Contabo portal.oneguyconsulting.com | Express API + PostgreSQL |
| 5 | Review Policies | IMPLEMENTED | Vercel /policies | Markdown rendering + taxonomy |
| 6 | Publish Policies | IMPLEMENTED | Vercel /policies | Static generation + download |
| 7 | User Training | MOSTLY IMPLEMENTED | [Verify location] | Mixpanel tracking enabled |
| 8 | Vendor Management | NOT IMPLEMENTED | -- | Planned |
| 9 | Physical Site Audit | IMPLEMENTED | Contabo /audit/physical/ | Express API + file uploads |
| 10 | IT Risk Questionnaire | IMPLEMENTED | Contabo /audit/it-risk/ | Express API + form submission |
| 11 | Data Device Audit | IMPLEMENTED | Contabo /audit/data-device/ | Express API + inventory tracking |
| 12 | Incident Management | IMPLEMENTED | Contabo /incidents | Express API + incident workflow |

**Summary:**
- ✅ **8 of 12 steps fully implemented**
- ⚠️ **1 partially complete** (Step 1: UI only, APIs pending)
- ❌ **3 not started** (Steps 2, 3, 8)

---

## Operational Procedures

### Health Checks

**Manual Health Checks:**
```bash
# Incident Portal (Contabo - UNVERIFIED)
curl -sI https://portal.oneguyconsulting.com
# Expected: HTTP/2 200 OK

# Policy Library (Vercel - VERIFIED)
curl -sI https://website-six-sigma-75.vercel.app/policies
# Expected: HTTP/2 200 OK

# Supabase API (VERIFIED)
curl -sI https://jyjytbwjifeqtfowqcqf.supabase.co/rest/v1/
# Expected: HTTP/2 200 OK or 3xx (redirect to docs)
```

**Monitoring Gaps:**
- [ ] TODO: Set up uptime monitoring (e.g., UptimeRobot, Better Uptime)
- [ ] TODO: Configure alerts for downtime
- [ ] TODO: Set up application error tracking (e.g., Sentry)
- [ ] TODO: Monitor database performance (slow queries)

---

### Restart Incident Portal (Contabo)

**⚠️ UNVERIFIED - Requires server access**

```bash
# Connect via SSH
ssh -i ~/.ssh/id_rsa_contabo root@170.64.136.207

# Check PM2 status
pm2 status

# View logs (last 50 lines)
pm2 logs incident-portal --lines 50

# Restart process
pm2 restart incident-portal

# View full logs
pm2 logs incident-portal

# Monitor in real-time
pm2 monit
```

---

### Deploy Update to Incident Portal (Contabo)

**⚠️ UNVERIFIED - Requires server access**

```bash
# On local machine
cd /Users/chuckw./incident-management-system

# Build
npm run build

# Deploy script
./deploy-contabo.sh

# Script performs:
# 1. SSH to server
# 2. Git pull latest code
# 3. npm install
# 4. npm run build
# 5. PM2 restart incident-portal
# 6. Nginx reload
```

---

### Deploy Update to Policy Library (Vercel)

**✅ VERIFIED - Standard procedure**

```bash
# On local machine
cd /Users/chuckw./policy-library/website

# Test locally first
npm run build
npm run start
# Navigate to http://localhost:3000/policies

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add HIPAA compliance checklist"
# or
git commit -m "fix: correct privacy rule references"
# or
git commit -m "docs: update incident procedures"

# Push to main branch (auto-deploys)
git push origin main

# Monitor deployment
# Option 1: Via Vercel Dashboard
#   https://vercel.com/dashboard
#   Select "policy-library-website"
#   View Deployments tab

# Option 2: Via git
#   git log --oneline  # See commits
#   git status         # See if pushed
```

**Vercel Deployment Process:**
1. Git push detected → Vercel webhook triggered
2. Vercel clones repository
3. Installs dependencies: `npm install`
4. Builds application: `npm run build`
5. Runs linting: `npm lint` (if configured)
6. Deploys to CDN
7. Promotes to production (on main branch)

**Typical deployment time:** 2-4 minutes

---

### Check SSL Certificate Expiry

**Incident Portal (Contabo - UNVERIFIED):**
```bash
curl -vI https://portal.oneguyconsulting.com 2>&1 | grep "expire"
# Expected output: expire date (e.g., "Oct 11 00:00:00 2026 GMT")
```

**Policy Library (Vercel):**
- Vercel manages SSL certificates automatically
- No manual renewal needed
- Check expiry in Vercel Dashboard → Settings

---

### Renew SSL Certificate (Contabo)

**⚠️ UNVERIFIED - Requires server access**

```bash
# Connect via SSH
ssh -i ~/.ssh/id_rsa_contabo root@170.64.136.207

# Renew certificate (Let's Encrypt)
certbot renew

# If renewal needed
certbot renew --dry-run  # Test renewal
certbot renew            # Actual renewal

# Reload Nginx to apply changes
systemctl reload nginx

# Verify renewal
curl -vI https://portal.oneguyconsulting.com 2>&1 | grep "expire"
```

**Renewal Automation:**
- Certbot cron job should run daily (standard on most Linux systems)
- Let's Encrypt certificates valid for 90 days
- Renewal attempted 30 days before expiry

---

### Database Backup

**Manual Backup (Supabase):**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select project: jyjytbwjifeqtfowqcqf
3. Navigate to: Settings → Database → Backups
4. Click "Initiate backup"
5. Wait for completion (typically 5-15 minutes)
6. Download backup file

**Automated Backups:**
- Supabase creates daily backups automatically
- Retention: 7 days for free tier, 30 days for Pro tier
- Access via Dashboard: Settings → Backups

**Restore Procedure:**
1. Supabase Dashboard → Settings → Backups
2. Select backup date
3. Click "Restore"
4. Confirm (this will overwrite current database)
5. Wait for restoration (5-30 minutes)

**WARNING:** Restore operation overwrites current data. Ensure backup is correct before proceeding.

---

### Verify Database Connection

**From Local Machine:**
```bash
# Using psql (PostgreSQL client)
psql postgresql://postgres:[PASSWORD]@db.jyjytbwjifeqtfowqcqf.supabase.co:5432/postgres

# Once connected, run:
\dt                    # List all tables
SELECT COUNT(*) FROM organizations;  # Check data

# Exit
\q
```

**From Application:**
```bash
# Next.js application
# Supabase client auto-connects on startup
# Check logs for connection errors

# Check at runtime (in browser console or server logs)
npm run dev
# Navigate to /api/health or similar endpoint
```

---

## Security Notes

### SSH Key Management

**Private Key Location:**
- Path: `~/.ssh/id_rsa_contabo`
- Permissions: 600 (read/write owner only)
- Generated: [Date TBD]
- Last rotated: [Date TBD]

**Protect this key:**
```bash
# Verify permissions (should be 600)
ls -l ~/.ssh/id_rsa_contabo

# If permissions wrong, fix them
chmod 600 ~/.ssh/id_rsa_contabo
```

### Environment Variables

**Never commit to git:**
- `.env` files (all variants)
- Credentials, API keys, passwords
- Database connection strings
- Session secrets
- JWT signing keys

**Storage locations:**
- **Local development**: `.env.local` (gitignored)
- **Vercel production**: Vercel Dashboard → Settings → Environment Variables
- **Contabo production**: Server-side `.env` file in `/var/www/incident-portal/.env` (UNVERIFIED)
- **GitHub Secrets**: Not currently used (consider for CI/CD)

**Variable rotation:**
- [ ] TODO: Rotate SESSION_SECRET quarterly
- [ ] TODO: Rotate database password annually
- [ ] TODO: Rotate API keys on key compromise

### Database Security

**Password Storage:**
- Supabase database password stored in `.env` files
- Never logged or exposed
- Access via Supabase Dashboard only

**RLS Policies:**
- All tables have Row Level Security enabled
- Policies prevent unauthorized cross-organization access
- Service Role Key required for admin operations
- Anon key limited to read-only operations

**Encryption:**
- Supabase encrypts data at rest
- HTTPS enforced for all connections
- SSL/TLS for PostgreSQL connections

### API Keys

**Supabase Keys:**
- `NEXT_PUBLIC_SUPABASE_URL`: Public (embedded in client)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public (embedded in client, read-only)
- `SUPABASE_SERVICE_ROLE_KEY`: SECRET (server-side only, never expose to client)

**Mixpanel Token:**
- `NEXT_PUBLIC_MIXPANEL_TOKEN`: Public (embedded in client for analytics)

**Key Compromise Response:**
1. Rotate compromised key immediately in Supabase Dashboard
2. Update environment variables in Vercel
3. Redeploy applications
4. Monitor for unauthorized access

---

## Disaster Recovery

### Incident Portal (Contabo) - Catastrophic Failure

**⚠️ UNVERIFIED - Requires server access**

**Recovery Steps:**
1. **Verify server status**
   - Check Contabo control panel for server status
   - Verify IP address hasn't changed
   - Test SSH connectivity

2. **If server is down:**
   ```bash
   # Via Contabo control panel:
   # - Restart VPS
   # - Wait 5 minutes for reboot
   # - Verify server comes online
   ```

3. **If application crashed:**
   ```bash
   ssh -i ~/.ssh/id_rsa_contabo root@170.64.136.207
   pm2 restart incident-portal
   pm2 logs incident-portal --lines 100
   ```

4. **If database connection lost:**
   - Verify Supabase status: https://status.supabase.com
   - Check database credentials in `.env`
   - Verify firewall rules allow connection
   - Restart application: `pm2 restart incident-portal`

5. **If Nginx is not working:**
   ```bash
   ssh -i ~/.ssh/id_rsa_contabo root@170.64.136.207
   systemctl status nginx
   nginx -t  # Test configuration
   systemctl restart nginx
   ```

6. **If SSL certificate is invalid:**
   ```bash
   ssh -i ~/.ssh/id_rsa_contabo root@170.64.136.207
   certbot renew --force-renewal
   systemctl reload nginx
   ```

**Rollback to Previous Deployment:**
```bash
cd /Users/chuckw./incident-management-system
git log --oneline  # View recent commits
git revert [bad-commit-hash]
git push
./deploy-contabo.sh  # Re-deploy
```

---

### Policy Library (Vercel) - Catastrophic Failure

**✅ VERIFIED - Standard recovery**

**Recovery Steps:**
1. **Check Vercel status page**
   - https://www.vercel.com/status
   - Verify platform is operational

2. **Check deployment status**
   - Vercel Dashboard → Deployments
   - Identify last successful deployment
   - Click "Promote to Production"

3. **Revert to previous commit**
   ```bash
   cd /Users/chuckw./policy-library/website
   git log --oneline -n 5  # View recent commits
   git revert [bad-commit-hash]
   git push origin main  # Auto-redeploys
   ```

4. **Manual rollback**
   - Vercel Dashboard → Deployments
   - Find deployment before the failure
   - Click the three-dot menu
   - Select "Promote to Production"

5. **If DNS is the issue**
   - Verify Cloudflare DNS records point to Vercel
   - Expected CNAME: `cname.vercel-dns.com` (or similar)
   - Propagation may take 15-30 minutes

**RTO (Recovery Time Objective):** 2-5 minutes
**RPO (Recovery Point Objective):** Last deployment (~5 minutes)

---

### Database (Supabase) - Data Corruption or Loss

**Recovery Steps:**
1. **Verify backup exists**
   - Supabase Dashboard → Settings → Backups
   - Identify backup before corruption
   - Note the timestamp

2. **Initiate restore**
   - Dashboard → Backups → Select backup
   - Click "Restore"
   - Confirm warning message
   - Wait for restoration (5-30 minutes)

3. **Verify data integrity**
   ```sql
   -- Check table row counts
   SELECT COUNT(*) FROM organizations;
   SELECT COUNT(*) FROM employees;
   SELECT COUNT(*) FROM incidents;

   -- Spot check a record
   SELECT * FROM organizations LIMIT 1;
   ```

4. **Restart applications**
   - Vercel: No action needed (reconnects automatically)
   - Contabo: `ssh ... && pm2 restart incident-portal`

**RTO:** 30 minutes maximum
**RPO:** 24 hours (daily backup cadence)

---

## Abandoned Infrastructure

### FastComet (Archived February 2026)

**Status:** Deployment 90% complete but never activated

**Reason:** Moved to Contabo VPS for full control and improved HIPAA compliance

**Archive Location:** `/Users/chuckw./policy-library/website/archive/fastcomet/`

**Contents:**
- Deploy scripts for FastComet shared hosting
- Nginx configuration
- Database setup documentation
- Environment configuration

**Decommissioning Status:**
- [x] Code archived locally
- [ ] TODO: Delete FastComet account
- [ ] TODO: Remove DNS records (if any)
- [ ] TODO: Confirm no production data on FastComet

**IMPORTANT:** Do NOT use FastComet for any production purposes. All new deployments use Vercel (policy library) and Contabo (incident portal).

---

## Monitoring & Alerting

### Current Status

- ❌ **Uptime monitoring:** NOT SET UP
- ❌ **Error tracking:** NOT SET UP
- ❌ **Performance monitoring:** NOT SET UP
- ✅ **Mixpanel analytics:** ENABLED (policy library)
- ✅ **Database backups:** AUTOMATED (Supabase)

### Recommended Setup

**1. Uptime Monitoring** (Choose one)
- UptimeRobot (free tier available)
- Better Uptime
- Freshping
- Monitoring interval: 5 minutes
- Alerts: Email + SMS

**2. Error Tracking** (Choose one)
- Sentry (excellent Next.js integration)
- Bugsnag
- Rollbar
- Alert threshold: Immediate on errors

**3. Performance Monitoring**
- Vercel Analytics (built-in)
- New Relic
- DataDog
- Key metrics: Response time, Core Web Vitals

**4. Database Monitoring**
- Supabase Dashboard (built-in logs)
- pgBadger (PostgreSQL log analysis)
- Monitor: Slow queries, connection count

---

## References

### Local Documentation

- **Incident Management System**: `/Users/chuckw./incident-management-system/`
- **Policy Library**: `/Users/chuckw./policy-library/website/`
- **Deployment Guide**: `/Users/chuckw./policy-library/website/docs/DEPLOYMENT-GUIDE.md`
- **Critical Finding**: `/Users/chuckw./.omc/autopilot/critical-finding.md`

### External Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Contabo VPS Documentation**: https://www.contabo.com/
- **Cloudflare Documentation**: https://developers.cloudflare.com/
- **Let's Encrypt**: https://letsencrypt.org/

### Credentials Access

**Dashboard Access:**
- Supabase: https://supabase.com/dashboard (cweiselberg1@gmail.com)
- Vercel: https://vercel.com/dashboard (GitHub auth)
- Cloudflare: https://dash.cloudflare.com/ ([Email TBD])
- Contabo: https://my.contabo.com/ ([User TBD])

---

## Appendix: Quick Reference Commands

### Vercel Deployment (Policy Library)

```bash
# Test locally
cd /Users/chuckw./policy-library/website
npm install
npm run build
npm run start

# Deploy to production
git add .
git commit -m "feat: description"
git push origin main  # Auto-deploys to Vercel
```

### Contabo Operations (Incident Portal - UNVERIFIED)

```bash
# SSH Connect
ssh -i ~/.ssh/id_rsa_contabo root@170.64.136.207

# Check Status
pm2 status
pm2 logs incident-portal --lines 50

# Restart
pm2 restart incident-portal

# Renew SSL
certbot renew
systemctl reload nginx
```

### Database Operations (Supabase)

```bash
# Local psql connection
psql postgresql://postgres:[PASSWORD]@db.jyjytbwjifeqtfowqcqf.supabase.co:5432/postgres

# List tables
\dt

# Check specific table
SELECT COUNT(*) FROM organizations;

# Exit
\q
```

### Health Checks

```bash
# Policy Library
curl -sI https://website-six-sigma-75.vercel.app/policies

# Incident Portal
curl -sI https://portal.oneguyconsulting.com

# Supabase
curl -sI https://jyjytbwjifeqtfowqcqf.supabase.co/rest/v1/
```

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Version** | 1.0 |
| **Last Updated** | 2026-02-13 |
| **Status** | Production Documentation |
| **Verification** | PARTIAL (See Contabo Status) |
| **Author** | Infrastructure Team |
| **Review Frequency** | Quarterly |
| **Next Review Date** | 2026-05-13 |

**Change History:**
- **2026-02-13**: Initial creation with Contabo verification issues flagged

