# Employee Management System - Deployment Guide

Complete guide for deploying the employee management system to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Migration](#database-migration)
4. [Seed Data (Optional)](#seed-data-optional)
5. [Build and Deploy](#build-and-deploy)
6. [Verification Steps](#verification-steps)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)
9. [Post-Deployment Tasks](#post-deployment-tasks)

---

## Prerequisites

Before deploying, ensure you have:

- **Supabase Project**: Free tier or higher at https://supabase.com
- **Node.js**: Version 18+ with npm
- **Git Repository**: Code pushed and ready
- **Environment Variables**: Access to manage secrets in deployment platform

### Optional but Recommended

- **Supabase CLI**: For local testing (`npm install -g supabase`)
- **psql**: PostgreSQL client for direct database access
- **Vercel or Netlify Account**: For hosting (if using these platforms)

---

## Environment Variables

Configure the following variables in your deployment platform (Vercel, Netlify, etc.).

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Application Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=[your-mixpanel-token]
NEXT_PUBLIC_MIXPANEL_DEBUG=false

# Build Analysis
# ANALYZE=true  # Only set to true for analyzing bundle size
```

### How to Find Your Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy the values:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (keep secret!)

---

## Database Migration

The database migration creates all required tables, indexes, RLS policies, triggers, and views.

### Option 1: Supabase Dashboard (Recommended for First-Time Setup)

1. Log in to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Open this file: `supabase/migrations/20260209_employee_management_consolidated.sql`
6. Copy all contents
7. Paste into the SQL Editor
8. Click **Run** button
9. Wait for completion (should take 30-60 seconds)
10. Verify in **Table Editor**: Check that tables exist (organizations, departments, employees, etc.)

### Option 2: Supabase CLI (For Automated Deployments)

```bash
# Install CLI (one-time)
npm install -g supabase

# Authenticate
supabase login

# Link to your project
cd /path/to/policy-library/website
supabase link --project-ref [your-project-ref]

# Push migrations
supabase db push

# Verify
supabase status
```

### Option 3: Direct PostgreSQL Connection (Advanced)

```bash
# Get your database connection string from Supabase dashboard:
# Settings > Database > Connection String > URI

psql [your-connection-string] -f supabase/migrations/20260209_employee_management_consolidated.sql
```

### Verification

After migration, verify tables exist:

```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'organizations', 'departments', 'employees',
  'employee_invitations', 'policy_bundles',
  'department_policy_requirements', 'employee_policy_assignments'
)
ORDER BY table_name;
```

Expected result: 7 rows returned

---

## Seed Data (Optional)

Seed data is optional. Use it to test the system with sample data before go-live.

### IMPORTANT: Replace Placeholder UUIDs

The seed.sql file contains placeholder UUIDs for auth.users. You MUST replace these with real Supabase auth user IDs.

### Step 1: Get Real Auth User IDs

In Supabase SQL Editor, run:

```sql
SELECT id, email FROM auth.users
ORDER BY created_at;
```

This returns all registered users. Copy the UUID values (first column).

### Step 2: Update Seed File

Edit `supabase/seed.sql` and replace:

```sql
-- OLD (placeholder)
'00000000-0000-0000-0000-000000000001' -- REPLACE WITH REAL AUTH USER ID

-- NEW (example)
'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
```

Lines to update (search for "REPLACE WITH REAL"):
- Line 342: Admin user
- Line 378: Privacy Officer (ED)
- Line 414: Privacy Officer (IT)
- Line 450: Department Manager
- Line 486: Employee (Nurse)
- Line 522: Employee (Surgeon)
- Line 558: Employee (Billing)
- Line 594: Employee (HR)
- Line 630: Employee (IT Security)
- Line 666: Employee (Paramedic)

### Step 3: Run Seed Data

In Supabase SQL Editor:

1. Click **New Query**
2. Copy contents of `supabase/seed.sql`
3. Paste into editor
4. Click **Run**
5. Wait for completion

### Step 4: Verify Seed Data

```sql
-- Verify counts
SELECT COUNT(*) as organization_count FROM organizations;
SELECT COUNT(*) as department_count FROM departments;
SELECT COUNT(*) as employee_count FROM employees;
SELECT COUNT(*) as policy_bundle_count FROM policy_bundles;
SELECT COUNT(*) as assignment_count FROM employee_policy_assignments;

-- Check compliance rates
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employee_policy_assignments), 2) as percentage
FROM employee_policy_assignments
GROUP BY status;

-- Check overdue assignments
SELECT
  e.first_name || ' ' || e.last_name as employee,
  epa.policy_id,
  epa.due_at,
  NOW() - epa.due_at as days_overdue
FROM employee_policy_assignments epa
JOIN employees e ON e.id = epa.employee_id
WHERE epa.status = 'assigned' AND epa.due_at < NOW()
ORDER BY epa.due_at DESC;
```

Expected results:
- 1 organization
- 8 departments (including nested hierarchy)
- 10 employees across various roles
- 3 policy bundles
- 11 policy assignments (mix of completed, pending, overdue)

---

## Build and Deploy

### Local Testing

Before deploying to production, test locally:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm run start

# Navigate to http://localhost:3000
```

The build should complete without errors. If there are TypeScript errors, fix them before deploying.

### Deploy to Vercel (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub/GitLab repository
   - Click "Import"

2. **Configure Environment Variables**
   - In Vercel project settings, go to **Settings > Environment Variables**
   - Add all variables from [Environment Variables](#environment-variables) section
   - Save

3. **Configure Build**
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`
   - Leave other settings as default
   - Click "Deploy"

4. **Wait for Deployment**
   - Vercel will build and deploy automatically
   - Check deployment status in Vercel dashboard
   - Look for green checkmark = success

### Deploy to Netlify

1. **Connect Repository**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Select GitHub/GitLab
   - Choose your repository

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Show advanced"
   - Add environment variables from [Environment Variables](#environment-variables)

3. **Deploy**
   - Click "Deploy site"
   - Monitor deployment logs
   - Check for success message

### Deploy to Custom Server

For self-hosted deployments:

```bash
# On your server
cd /path/to/deployment

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Start production server (consider using PM2 for persistence)
npm run start

# OR with PM2
pm2 start "npm start" --name "policy-library"
```

---

## Verification Steps

### Post-Deployment Checklist

Run these checks immediately after deployment to verify everything works:

- [ ] Database migration applied successfully
- [ ] Environment variables configured correctly
- [ ] Application builds without errors
- [ ] Privacy Officer dashboard loads
- [ ] Employee portal loads
- [ ] Can create an organization
- [ ] Can create departments
- [ ] Can invite employees
- [ ] Can assign policies
- [ ] Can complete policy attestation
- [ ] RLS policies prevent cross-organization access

### Verification Queries

Run these SQL queries in Supabase to verify setup:

```sql
-- Verify all tables exist and have RLS enabled
SELECT
  tablename,
  (SELECT count(*) FROM information_schema.table_constraints
   WHERE table_name = pg_tables.tablename
   AND constraint_type = 'PRIMARY KEY') as has_pk,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'organizations', 'departments', 'employees',
  'employee_invitations', 'policy_bundles',
  'department_policy_requirements', 'employee_policy_assignments'
)
ORDER BY tablename;

-- Expected: 7 rows, all with rowsecurity = TRUE

-- Verify key indexes exist
SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE tablename IN (
  'organizations', 'departments', 'employees',
  'employee_policy_assignments'
)
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected: 20+ indexes

-- Verify RLS policies enabled
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
GROUP BY tablename
ORDER BY tablename;

-- Expected: policies on all 7 tables

-- Check seed data (if loaded)
SELECT
  'organizations' as table_name,
  COUNT(*) as count
FROM organizations
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'policy_bundles', COUNT(*) FROM policy_bundles
UNION ALL
SELECT 'employee_policy_assignments', COUNT(*) FROM employee_policy_assignments;
```

### Test Functionality

1. **Test Authentication**
   - Sign up as a new user
   - Verify email confirmation works
   - Sign in with credentials
   - Sign out successfully

2. **Test Privacy Officer Dashboard**
   - Create organization
   - Create departments
   - View all employees
   - Create policy bundle
   - Assign policies to employees

3. **Test Employee Portal**
   - Accept policy invitation
   - View assigned policies
   - Complete policy attestation
   - View compliance dashboard

4. **Test RLS Security**
   - Log in as Employee A
   - Verify cannot see Employee B's data
   - Log in as different organization
   - Verify cannot see another organization's data

---

## Rollback Procedure

If deployment fails, follow this rollback procedure.

### Step 1: Identify the Issue

Check deployment logs:
- Vercel: Dashboard > Deployments tab
- Netlify: Dashboard > Deploys tab
- Custom: Application logs

### Step 2: Rollback Application Code

If application code has errors:

```bash
# Revert to previous commit
git revert [bad-commit-hash]
git push origin main

# On deployment platform:
# - Vercel: Auto-redeploys on git push
# - Netlify: Auto-redeploys on git push
# - Custom: Pull and rebuild
```

### Step 3: Rollback Database (If Migration Failed)

If database migration failed, you need to drop created tables and re-run the corrected migration.

**WARNING: This deletes all data. Backup first.**

```sql
-- Run in Supabase SQL Editor
-- Drop tables in reverse dependency order

DROP TABLE IF EXISTS employee_policy_assignments CASCADE;
DROP TABLE IF EXISTS department_policy_requirements CASCADE;
DROP TABLE IF EXISTS policy_bundles CASCADE;
DROP TABLE IF EXISTS employee_invitations CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop enum types (if needed)
DROP TYPE IF EXISTS assignment_status_type CASCADE;
DROP TYPE IF EXISTS employment_type CASCADE;
DROP TYPE IF EXISTS employment_status_type CASCADE;
DROP TYPE IF EXISTS department_status_type CASCADE;
DROP TYPE IF EXISTS user_role_type CASCADE;

-- Now re-run the migration with fixes:
-- Paste contents of supabase/migrations/20260209_employee_management_consolidated.sql
```

### Step 4: Verify Rollback

```sql
-- Verify tables are gone
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'organizations', 'departments', 'employees',
  'employee_invitations', 'policy_bundles',
  'department_policy_requirements', 'employee_policy_assignments'
);

-- Expected: 0 rows
```

### Step 5: Investigate Root Cause

Review error logs and fix:
1. TypeScript errors
2. Missing environment variables
3. Database constraint violations
4. RLS policy conflicts

Then re-deploy after fixes.

---

## Troubleshooting

### Common Issues and Solutions

#### "Table already exists" Error

**Cause**: Migration already applied or conflicting migration

**Solution**:
```sql
-- Check if table exists
SELECT EXISTS(
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'organizations'
);

-- If TRUE: Migration already applied, proceed to verification
-- If FALSE: Different issue, check migration SQL
```

#### "Permission denied" When Accessing Tables

**Cause**: RLS policies preventing access or insufficient user role

**Solution**:
1. Verify user is in `employees` table with correct organization
2. Check RLS policy logic
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is used for admin operations

```sql
-- Check if user has employee record
SELECT * FROM employees
WHERE user_id = auth.uid()
LIMIT 1;

-- If no result: User not in organization, need to create employee record
```

#### "Build Failed" During Deployment

**Cause**: TypeScript errors or missing dependencies

**Solution**:
```bash
# Local testing
npm install
npm run build

# Fix any errors shown
# Check for:
# - Missing imports
# - Type mismatches
# - Syntax errors

# Re-deploy
git push origin main
```

#### "Cannot Insert into Table" Error

**Cause**: RLS write policies preventing insert

**Solution**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'organizations';

-- Verify user has appropriate role
SELECT role FROM employees
WHERE user_id = auth.uid()
LIMIT 1;

-- Expected: admin, privacy_officer, or compliance_manager
```

#### Environment Variables Not Loading

**Cause**: Variables not set in deployment platform

**Solution**:
1. **Vercel**: Go to Project Settings > Environment Variables
2. **Netlify**: Go to Site Settings > Build & Deploy > Environment
3. Verify variable names match exactly (case-sensitive)
4. Redeploy after setting variables

#### "next build" Fails Locally

**Cause**: Node modules or dependencies issue

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# If still failing, check Node version
node --version  # Should be 18+
```

---

## Post-Deployment Tasks

### Immediate (Day 1)

- [ ] Verify all verification checks pass
- [ ] Test user signup and authentication
- [ ] Create test organization and departments
- [ ] Test employee invitation workflow
- [ ] Verify email sending works (if configured)
- [ ] Check application logs for errors

### Within 1 Week

- [ ] Train Privacy Officers on system usage
- [ ] Configure email templates in Supabase Auth (optional)
- [ ] Set up backup schedule in Supabase (Settings > Backups)
- [ ] Configure custom domain (if applicable)
- [ ] Set up monitoring/alerting (Vercel/Netlify)
- [ ] Publish documentation to users

### Within 1 Month

- [ ] Review application performance metrics
- [ ] Monitor RLS policy effectiveness
- [ ] Check audit logs for anomalies
- [ ] Verify backup restoration works (test restore)
- [ ] Plan capacity for additional organizations
- [ ] Set up SSL/TLS certificate renewal

### Ongoing

- [ ] Monitor application error rates
- [ ] Review and audit user access
- [ ] Update dependencies monthly
- [ ] Backup and test recovery procedures
- [ ] Review compliance with HIPAA (if applicable)
- [ ] Maintain RLS policies as schema changes

---

## Success Criteria

Your deployment is successful when:

✅ All tables created and RLS policies enabled
✅ Application builds and starts without errors
✅ Environment variables set correctly
✅ All verification queries return expected results
✅ Authentication works (signup/signin/signout)
✅ Privacy Officer can manage organizations
✅ Employees can view assigned policies
✅ Policy attestation workflow functions
✅ Cross-organization access is blocked by RLS
✅ No errors in application logs

---

## Support and Escalation

If issues persist after troubleshooting:

1. **Check Supabase Status**: https://status.supabase.com
2. **Review Application Logs**: Check deployment platform logs
3. **Check Database Logs**: Supabase > Settings > Logs
4. **Contact Support**:
   - Vercel: https://vercel.com/support
   - Netlify: https://www.netlify.com/support/
   - Supabase: https://supabase.com/support

---

## Appendix: Quick Reference Commands

### Build and Deploy (Vercel/Netlify)

```bash
# Test locally
npm install && npm run build && npm run start

# Deploy (auto on git push)
git push origin main
```

### Database (Supabase CLI)

```bash
# Link project
supabase link --project-ref [ref]

# Push migrations
supabase db push

# Pull latest schema
supabase db pull
```

### Environment Variables (Example)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Verification (SQL)

```sql
-- Check tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('organizations', 'departments', 'employees',
                   'employee_invitations', 'policy_bundles',
                   'department_policy_requirements',
                   'employee_policy_assignments');

-- Check RLS
SELECT tablename, COUNT(*) FROM pg_policies GROUP BY tablename;

-- Check seed data
SELECT COUNT(*) FROM employees;
```

---

**Document Version**: 1.0
**Last Updated**: 2026-02-09
**Status**: Production Ready
