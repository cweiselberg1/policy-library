# System Merge & Deployment Plan

**Objective:** Merge Incident Management System into Policy Library and deploy to oneguyconsulting.com

**Timeline:** 2-3 days

---

## Current State

### System 1: Incident Management System
- **Location:** `/Users/chuckw./incident-management-system/`
- **Stack:** Express + React + Wouter + PostgreSQL
- **Features:**
  - User authentication (local passport strategy)
  - Incident reporting
  - Incident tracking dashboard
  - Anonymous reporting
  - Role-based access (user, privacy_officer, admin)
- **Database:** PostgreSQL (separate from policy library)
- **Deployed:** `portal.oneguyconsulting.com` (FastComet)

### System 2: Policy Library
- **Location:** `/Users/chuckw./policy-library/website/`
- **Stack:** Next.js 16 + React 19 + Supabase
- **Features:**
  - Employee management
  - Department hierarchy
  - Policy bundles
  - Training modules (HIPAA 101, CyberSecurity)
  - Compliance tracking
  - IT Risk Assessment
  - Physical audit
  - Data device audit
- **Database:** Supabase (PostgreSQL)
- **Deployed:** Vercel (NOT on custom domain)

---

## Target State

### One Unified System
- **Stack:** Next.js 16 + React 19 + Supabase
- **Deployed:** `oneguyconsulting.com`
- **Features:** ALL features from both systems
- **Database:** Single Supabase instance
- **Authentication:** Unified (Supabase Auth)

---

## Implementation Plan

### PHASE 1: Database Migration (4-6 hours)

#### Step 1.1: Export Incident Management Schema
- [ ] Extract PostgreSQL schema from incident management system
- [ ] Document all tables, columns, relationships
- [ ] Identify data that needs to be preserved

**Tables to migrate:**
```sql
- users (merge with Supabase auth.users + profiles)
- incidents
- comments (if exists)
- attachments (if exists)
```

#### Step 1.2: Create Supabase Migration
- [ ] Create new migration file: `20260212_incident_management.sql`
- [ ] Adapt incident tables to Supabase schema
- [ ] Add Row-Level Security (RLS) policies for multi-tenancy
- [ ] Create foreign keys to `profiles` and `organizations`

**New tables structure:**
```sql
-- incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  reported_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  category TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES profiles(id)
);

-- incident_comments table
CREATE TABLE incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_comments ENABLE ROW LEVEL SECURITY;

-- Users can view incidents in their organization
CREATE POLICY "org_incidents_select" ON incidents
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Privacy Officers can manage all incidents
CREATE POLICY "privacy_officer_incidents_all" ON incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'privacy_officer'
      AND organization_id = incidents.organization_id
    )
  );
```

#### Step 1.3: Test Migration
- [ ] Apply migration to Supabase
- [ ] Verify tables created correctly
- [ ] Test RLS policies with test data

---

### PHASE 2: Code Integration (8-10 hours)

#### Step 2.1: Create Incident Management Pages in Next.js
- [ ] Create `/app/dashboard/privacy-officer/incidents/page.tsx`
- [ ] Create `/app/dashboard/privacy-officer/incidents/[id]/page.tsx`
- [ ] Create `/app/dashboard/employee/report-incident/page.tsx`
- [ ] Create `/app/incident/report-anonymous/page.tsx` (public, no auth)

#### Step 2.2: Build API Routes
- [ ] Create `/app/api/incidents/route.ts` (GET all, POST create)
- [ ] Create `/app/api/incidents/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] Create `/app/api/incidents/[id]/comments/route.ts`
- [ ] Create `/app/api/incidents/anonymous/route.ts` (public endpoint)

#### Step 2.3: Create React Components
- [ ] `components/incidents/IncidentList.tsx`
- [ ] `components/incidents/IncidentDetail.tsx`
- [ ] `components/incidents/IncidentForm.tsx`
- [ ] `components/incidents/IncidentStatusBadge.tsx`
- [ ] `components/incidents/IncidentFilters.tsx`
- [ ] `components/incidents/AnonymousReportForm.tsx`

#### Step 2.4: Update Navigation
- [ ] Add "Incidents" to Privacy Officer dashboard navigation
- [ ] Add "Report Incident" to Employee dashboard
- [ ] Update dashboard stats to include incident counts
- [ ] Add incident notification badges

#### Step 2.5: Migrate Business Logic
**From incident management system:**
- [ ] Copy incident validation logic
- [ ] Copy status transition rules
- [ ] Copy notification logic (if exists)
- [ ] Adapt authentication to use Supabase Auth

**Example API Route:**
```typescript
// app/api/incidents/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get incidents for user's organization
  const { data: incidents, error } = await supabase
    .from('incidents')
    .select(`
      *,
      reported_by:profiles!incidents_reported_by_fkey(id, full_name, email),
      assigned_to:profiles!incidents_assigned_to_fkey(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(incidents);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Get user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  // Create incident
  const { data: incident, error } = await supabase
    .from('incidents')
    .insert({
      organization_id: profile?.organization_id,
      reported_by: user.id,
      title: body.title,
      description: body.description,
      severity: body.severity,
      category: body.category,
      status: 'open'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(incident, { status: 201 });
}
```

---

### PHASE 3: Authentication Unification (4-6 hours)

#### Step 3.1: Migrate Existing Users
- [ ] Export users from incident management PostgreSQL
- [ ] Create migration script to:
  - Create Supabase auth users
  - Create corresponding profiles
  - Preserve roles and metadata
  - Send password reset emails

**Migration Script:**
```typescript
// scripts/migrate-users.ts
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const oldDb = new pg.Client({
  connectionString: process.env.OLD_DATABASE_URL
});

async function migrateUsers() {
  await oldDb.connect();

  // Get all users from old system
  const result = await oldDb.query('SELECT * FROM users');

  for (const user of result.rows) {
    // Create in Supabase (will trigger email verification)
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        username: user.username,
        role: user.role
      }
    });

    if (error) {
      console.error(`Failed to migrate ${user.email}:`, error);
      continue;
    }

    // Create profile
    await supabase.from('profiles').insert({
      id: authUser.user.id,
      email: user.email,
      full_name: user.username,
      role: user.role
    });

    console.log(`✓ Migrated ${user.email}`);
  }

  await oldDb.end();
}

migrateUsers();
```

#### Step 3.2: Update Existing Policy Library Users
- [ ] Add `role` field to profiles table if missing
- [ ] Update existing users to have appropriate roles
- [ ] Ensure cweiselberg1@gmail.com has `privacy_officer` role

#### Step 3.3: Remove Old Auth System
- [ ] Delete incident management system's passport/session code
- [ ] All auth now handled by Supabase

---

### PHASE 4: Domain Configuration (2-3 hours)

#### Step 4.1: Prepare Vercel Project
- [ ] Ensure all environment variables are set in Vercel
- [ ] Test build succeeds
- [ ] Verify Supabase connection works

#### Step 4.2: Configure Custom Domain in Vercel
**In Vercel Dashboard:**
1. [ ] Go to Project Settings → Domains
2. [ ] Add domain: `oneguyconsulting.com`
3. [ ] Add domain: `www.oneguyconsulting.com`
4. [ ] Copy DNS records provided by Vercel

**DNS Records to add:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Step 4.3: Update DNS at Domain Registrar
- [ ] Log into domain registrar (GoDaddy/Namecheap/etc)
- [ ] Add/update DNS records as above
- [ ] Wait for propagation (15-60 minutes)

#### Step 4.4: Verify SSL
- [ ] Vercel auto-provisions SSL via Let's Encrypt
- [ ] Test HTTPS works
- [ ] Test HTTP → HTTPS redirect

#### Step 4.5: Remove Old Deployment
- [ ] Backup incident management data
- [ ] Remove old FastComet deployment
- [ ] Update any hardcoded URLs in code

---

### PHASE 5: Testing & Validation (3-4 hours)

#### Step 5.1: Functionality Testing
- [ ] Test Privacy Officer login
- [ ] Test Employee login
- [ ] Test all incident management features:
  - [ ] Create incident
  - [ ] View incident list
  - [ ] Update incident status
  - [ ] Add comments
  - [ ] Anonymous reporting
  - [ ] Filter/search incidents
- [ ] Test all existing policy library features:
  - [ ] Employee management
  - [ ] Department management
  - [ ] Policy bundles
  - [ ] Training modules
  - [ ] Audits
- [ ] Test cross-feature integration:
  - [ ] Dashboard shows incident stats
  - [ ] Incidents linked to employees
  - [ ] Incident reports in compliance tracking

#### Step 5.2: Security Testing
- [ ] Test RLS policies prevent cross-org access
- [ ] Test role-based permissions
- [ ] Test anonymous reporting (no auth required)
- [ ] Test authentication flows
- [ ] Test password reset

#### Step 5.3: Performance Testing
- [ ] Test page load times
- [ ] Test with realistic data volume
- [ ] Check for N+1 queries
- [ ] Verify caching works

#### Step 5.4: User Acceptance Testing
- [ ] Login with cweiselberg1@gmail.com
- [ ] Verify lands on Privacy Officer dashboard
- [ ] Verify all features accessible
- [ ] Verify domain works (oneguyconsulting.com)

---

## File Structure After Merge

```
/Users/chuckw./policy-library/website/
├── app/
│   ├── dashboard/
│   │   ├── privacy-officer/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── policy-bundles/
│   │   │   ├── compliance/
│   │   │   └── incidents/              ← NEW
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   └── employee/
│   │       ├── policies/
│   │       └── report-incident/        ← NEW
│   │           └── page.tsx
│   ├── incident/
│   │   └── report-anonymous/           ← NEW (public)
│   │       └── page.tsx
│   ├── api/
│   │   ├── incidents/                  ← NEW
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── anonymous/route.ts
│   │   ├── employees/
│   │   ├── departments/
│   │   └── policies/
│   └── ...
├── components/
│   ├── incidents/                      ← NEW
│   │   ├── IncidentList.tsx
│   │   ├── IncidentDetail.tsx
│   │   ├── IncidentForm.tsx
│   │   ├── IncidentStatusBadge.tsx
│   │   └── AnonymousReportForm.tsx
│   └── ...
├── supabase/
│   └── migrations/
│       └── 20260212_incident_management.sql  ← NEW
└── ...
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All code merged and tested locally
- [ ] Database migrations created and tested
- [ ] Environment variables documented
- [ ] User migration script ready
- [ ] Backup of existing data

### Deployment Day
- [ ] Apply Supabase migrations
- [ ] Run user migration script
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Update DNS records
- [ ] Test on staging URL first
- [ ] Point domain to production
- [ ] Verify SSL works
- [ ] Test all critical paths
- [ ] Remove old deployment

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify email notifications work
- [ ] User acceptance testing
- [ ] Document any issues
- [ ] Update documentation

---

## Rollback Plan

If something goes wrong:

1. **Revert DNS**
   - Point domain back to old FastComet deployment
   - Takes 15-60 minutes to propagate

2. **Restore Database**
   - Use Supabase point-in-time recovery
   - Or restore from backup

3. **Revert Code**
   - Use Vercel instant rollback to previous deployment
   - Takes < 1 minute

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data loss during migration | Low | High | Take backups before migration, test migration script |
| DNS propagation delays | Medium | Medium | Do deployment during low-traffic period, keep old system running |
| Auth conflicts | Low | High | Test thoroughly with multiple user roles |
| Performance degradation | Low | Medium | Load test before go-live |
| RLS policy bugs | Medium | High | Extensive testing with multi-org data |

---

## Success Criteria

✅ **System is successful when:**
1. oneguyconsulting.com loads the unified system
2. Privacy Officer can log in and access all features
3. Employees can log in and access their features
4. Incident management works (create, view, update, resolve)
5. Anonymous reporting works (no auth required)
6. All existing policy library features still work
7. Multi-tenant isolation is maintained
8. No data loss from migration
9. SSL certificate is valid
10. Old incident management deployment is decommissioned

---

## Timeline

**Total: 2-3 days**

| Phase | Duration | Can Start |
|-------|----------|-----------|
| Phase 1: Database Migration | 4-6 hours | Immediately |
| Phase 2: Code Integration | 8-10 hours | After Phase 1 |
| Phase 3: Auth Unification | 4-6 hours | After Phase 2 |
| Phase 4: Domain Config | 2-3 hours | After Phase 3 |
| Phase 5: Testing | 3-4 hours | After Phase 4 |

**Recommended Schedule:**
- **Day 1 (Morning):** Phase 1 - Database
- **Day 1 (Afternoon):** Phase 2 - Code Integration
- **Day 2 (Morning):** Phase 2 cont'd + Phase 3 - Auth
- **Day 2 (Afternoon):** Phase 4 - Domain + Phase 5 - Testing
- **Day 3:** Buffer for issues + final testing

---

## Questions to Answer Before Starting

1. ✅ **Domain registrar?** Where is oneguyconsulting.com registered?
2. ✅ **Existing incident data?** Should we migrate existing incidents from old system?
3. ✅ **User migration?** Migrate all users or just Privacy Officer?
4. ✅ **Old deployment?** Keep running during transition or immediate cutover?
5. ✅ **Email service?** Use Resend (current) or Supabase email?

---

## Next Steps

**To proceed, I need your approval on:**
1. Overall approach (merge systems, deploy to domain)
2. Timeline (2-3 days acceptable?)
3. Answers to questions above
4. When to start (immediately or schedule for specific date?)

**Once approved, I will:**
1. Start with Phase 1 (Database Migration)
2. Create all necessary files and migrations
3. Test each phase before moving to next
4. Keep you updated on progress
5. Handle deployment to oneguyconsulting.com
