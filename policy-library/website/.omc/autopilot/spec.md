# Employee Management System - Autonomous Deployment Specification

**Date:** 2026-02-09
**Status:** EXPANSION_COMPLETE
**Mode:** Autopilot

---

## Executive Summary

**Mission:** Complete the employee management system deployment autonomously by resolving critical blockers, creating missing components, and preparing for production.

**Critical Findings:**
1. **Two conflicting database migrations** - Must consolidate into single source of truth
2. **Missing `/components` directory** - All 12 components referenced by pages don't exist
3. **Missing API endpoints** - 3 critical routes needed by UI
4. **No RLS write policies** - Security gap blocking all data mutations
5. **Table name inconsistencies** - API routes reference wrong table names

---

## Phase 0: Requirements Analysis ✅

### Functional Requirements

**Task 1: Create Seed Data**
- Synthetic HIPAA-compliant test data
- 1-2 organizations, 4-6 hierarchical departments, 5-10 employees
- 2-3 policy bundles with assignments in varied states
- Idempotent script with teardown companion

**Task 2: Deployment Documentation**
- Single consolidated guide with prerequisites, env vars, commands
- Supabase dashboard + CLI instructions
- Verification SQL and rollback procedures

**Task 3: Missing Features**
- Resolve database schema conflicts (P0 blocker)
- Create missing API endpoints (P0 blocker)
- Build missing React components (P0 blocker)
- Add RLS write policies (P0 blocker)

**Task 4: Build Testing**
- `npm run build` passes with zero errors
- All TypeScript types resolve
- No missing imports

**Task 5: Production Readiness**
- Environment variables documented
- Migration consolidated and validated
- Backup/rollback procedures tested

### Non-Functional Requirements

- **Security:** RLS policies enforce org isolation at database level
- **Compliance:** All test data uses synthetic/fictional information (HIPAA)
- **Idempotency:** Migrations and seed scripts safe to run multiple times
- **Zero Downtime:** Deployment strategy preserves existing data

---

## Technical Specification

### Database Resolution Strategy

**DECISION: Use Migration B (`organizational_hierarchy.sql`) as foundation, merge HR fields from Migration A**

**Rationale:**
- Migration B models the compliance workflow (policy bundles, assignments, attestations)
- Existing API routes consume `employee_policy_assignments` (only in Migration B)
- Materialized path approach for department hierarchy is superior
- Migration A provides richer employee HR data model

**Consolidated Schema:**

```sql
-- Source of Truth: 20260209_employee_management_consolidated.sql

1. organizations (Merge A + B)
   - From B: slug NOT NULL, primary_contact_email, deleted_at, enable_sso
   - From A: subscription_tier, status, phone, website, address

2. departments (Merge A + B)
   - From B: code, path, path_depth, parent_id (materialized path)
   - From A: budget, manager_id
   - ENUM status: 'active', 'inactive', 'archived'

3. employees (Rename B's organization_members + Add A's HR fields)
   - Base: PK UUID, user_id FK auth.users, organization_id FK, department_id FK
   - From B: role ENUM (user_role_type)
   - From A: employee_id, position_title, employment_status, employment_type,
            start_date, end_date, phone, mobile_phone, location

4. employee_invitations (NEW - referenced by API but missing)
   - email, organization_id, department_id, position_title, employment_type
   - invited_by, invited_at, accepted_at, status ENUM

5. policy_bundles (From B - unchanged)
6. department_policy_requirements (From B - unchanged)
7. employee_policy_assignments (From B - unchanged)
8. audit_log (Use existing from 20260203 migration - do NOT create audit_events)
```

**Tables to DELETE:**
- Migration A's `roles`, `employee_roles`, `team_members`, `team_assignments`, `employee_permissions` (defer to Phase 2)
- Migration A's `audit_events` (consolidate on existing `audit_log`)

---

### Missing Implementations

#### P0: Critical Blockers

**Consolidated Migration:**
- File: `supabase/migrations/20260209_employee_management_consolidated.sql`
- Replaces both conflicting files
- Includes all RLS policies (read + write)
- Includes triggers for updated_at, department path maintenance
- Includes data migration for existing users table

**Missing API Endpoints:**

| Route | File | Methods | Purpose |
|-------|------|---------|---------|
| `/api/dashboard/stats` | `app/api/dashboard/stats/route.ts` | GET | Aggregate stats for PO dashboard |
| `/api/employees` | `app/api/employees/route.ts` | GET, POST, PATCH, DELETE | Employee CRUD |
| `/api/compliance/overview` | `app/api/compliance/overview/route.ts` | GET | Org-wide compliance rates |

**Table Name Fixes:**

| File | Line | Current | Fix To |
|------|------|---------|--------|
| `api/compliance/dashboard/route.ts` | 71 | `policy_assignments` | `employee_policy_assignments` |
| `api/policy-bundles/route.ts` | 38, 319 | `policy_assignments` | `employee_policy_assignments` |
| `api/policy-bundles/route.ts` | 38 | `policy_bundle_items` | Remove (use `policy_ids TEXT[]`) |

**Missing Components (12 files):**

```
components/
  employee/
    ✗ ProgressSummary.tsx
    ✗ CompletedPolicies.tsx
  employees/
    ✗ InviteEmployeeModal.tsx
    ✗ EmployeeList.tsx
  departments/
    ✗ DepartmentTree.tsx
    ✗ CreateDepartmentModal.tsx
  policy-bundles/
    ✗ CreateBundleModal.tsx
    ✗ BundleList.tsx
  compliance/
    ✗ ComplianceDashboard.tsx
    ✗ EmployeeComplianceMatrix.tsx
  attestation/
    ✗ PolicyViewer.tsx
    ✗ AttestationForm.tsx
```

**RLS Write Policies:**

Every table needs INSERT/UPDATE/DELETE policies:

```sql
-- Pattern: Privacy Officers write to org-scoped tables
CREATE POLICY "Privacy officers can [action] [table]"
  ON [table] FOR [INSERT|UPDATE|DELETE]
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = [table].organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

-- Pattern: Employees update own assignments
CREATE POLICY "Employees can update own assignments"
  ON employee_policy_assignments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

Apply to: organizations, departments, employees, employee_invitations, policy_bundles, department_policy_requirements, employee_policy_assignments

---

#### P1: Core Functionality

**Seed Data Script:**
- File: `supabase/seed.sql`
- Creates demo organization: "Acme Healthcare System"
- Creates departments: Clinical > Emergency > Triage, IT > Security
- Creates 5 employees with varied roles
- Creates 2 policy bundles
- Creates policy assignments (some complete, some overdue)

**Deployment Documentation:**
- File: `.omc/autopilot/DEPLOYMENT_GUIDE.md`
- Prerequisites checklist
- Environment variables
- Migration execution (Supabase dashboard + CLI)
- Verification SQL
- Rollback procedure
- Smoke test checklist

---

### Dependencies & Environment

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=         # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Public key
SUPABASE_SERVICE_ROLE_KEY=        # Admin operations
NEXT_PUBLIC_SITE_URL=             # Invitation redirects
```

**Migration Execution Order:**
1. ✅ `001_create_training_tables.sql` (applied)
2. ✅ `20260203_policy_publication_system.sql` (applied - creates audit_log)
3. ✅ `20260203_remediation_plan_tracking.sql` (applied)
4. ⏳ `20260209_employee_management_consolidated.sql` (NEW)

**Build Requirements:**
- Node.js (Next.js 16.1.6)
- `npm install` (dependencies in package.json)
- `next build` must pass with zero errors

---

## Implementation Plan

### Phase 1: Resolve Database Conflicts (8-12 hours)
**Owner:** executor-high (opus)

1. Delete `20260209_add_employee_management.sql`
2. Delete `20260209_organizational_hierarchy.sql`
3. Create `20260209_employee_management_consolidated.sql`:
   - Merged organizations table
   - Merged departments table with materialized path
   - Rename organization_members → employees with HR fields
   - Add employee_invitations table
   - All RLS policies (read + write)
   - Triggers (updated_at, department path)
   - Data migration for existing users
4. Update `types/database.ts` with new tables
5. Verify migration syntax

---

### Phase 2: Build Missing API Endpoints (6-8 hours)
**Owner:** executor (sonnet) x3 parallel

**Endpoint 1:** `/api/dashboard/stats/route.ts`
- Aggregate: total employees, total departments, compliance rate
- Query employee_policy_assignments for completion stats

**Endpoint 2:** `/api/employees/route.ts`
- GET: List employees with filters (department, role, status)
- POST: Create employee (called by invite acceptance)
- PATCH: Update employee
- DELETE: Soft delete (set status inactive)

**Endpoint 3:** `/api/compliance/overview/route.ts`
- Org-wide compliance percentages
- By department breakdown
- Overdue employees list

**Fixes:**
- Update `api/compliance/dashboard/route.ts:71` → `employee_policy_assignments`
- Update `api/policy-bundles/route.ts:38,319` → remove `policy_bundle_items`, use array

---

### Phase 3: Build Missing Components (12-16 hours)
**Owner:** designer (sonnet) x3 parallel

**Batch 1 - Employee Components (designer #1):**
- `ProgressSummary.tsx` - Circular progress widget
- `CompletedPolicies.tsx` - Collapsible completed list
- `InviteEmployeeModal.tsx` - Modal form
- `EmployeeList.tsx` - Table with sort/filter

**Batch 2 - Department/Bundle Components (designer #2):**
- `DepartmentTree.tsx` - Recursive tree with expand/collapse
- `CreateDepartmentModal.tsx` - Modal form with parent selector
- `CreateBundleModal.tsx` - Policy picker modal
- `BundleList.tsx` - Card grid

**Batch 3 - Compliance/Attestation (designer #3):**
- `ComplianceDashboard.tsx` - Bar charts
- `EmployeeComplianceMatrix.tsx` - Employee x policy grid
- `PolicyViewer.tsx` - Markdown renderer
- `AttestationForm.tsx` - Signature + checkbox

---

### Phase 4: Add RLS Write Policies (2-4 hours)
**Owner:** executor (sonnet)

Add to consolidated migration:
- Organizations: INSERT (admin only), UPDATE, DELETE
- Departments: INSERT, UPDATE, DELETE (PO + admin)
- Employees: INSERT (invite acceptance), UPDATE, DELETE (PO + admin)
- Employee invitations: INSERT, UPDATE
- Policy bundles: INSERT, UPDATE, DELETE
- Dept policy requirements: INSERT, UPDATE, DELETE
- Employee policy assignments: INSERT (auto-assign), UPDATE (employee self-attest)

---

### Phase 5: Create Seed Data (4-6 hours)
**Owner:** executor (sonnet)

File: `supabase/seed.sql`
- Organization: "Acme Healthcare System" (UUID, slug, contact)
- Departments: Clinical (parent) → Emergency → Triage, IT → Security
- Policy bundles: "HIPAA Basics" (3 policies), "Clinical Staff" (5 policies)
- Employees: 1 admin, 2 privacy officers, 5 employees (varied departments)
- Policy assignments: Some completed, some pending, some overdue

---

### Phase 6: Write Deployment Docs (2-3 hours)
**Owner:** writer (haiku)

File: `.omc/autopilot/DEPLOYMENT_GUIDE.md`
- Prerequisites: Supabase project, env vars
- Step 1: Apply consolidated migration (dashboard + CLI)
- Step 2: Run seed data (optional)
- Step 3: Deploy Next.js app (Vercel/Netlify)
- Step 4: Verification SQL queries
- Step 5: Smoke test checklist
- Rollback: Revert migration procedure

---

### Phase 7: Test and Verify (4-6 hours)
**Owner:** qa-tester (sonnet)

1. Run `next build` - verify zero TypeScript errors
2. Test all API endpoints with curl/Postman
3. Manual UI testing: invite → accept → assign → attest flow
4. RLS verification: User A cannot see Org B data
5. Performance: Dashboard loads < 2 seconds
6. Documentation review: All steps executable

---

## Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| **Consolidate migrations** | Single source of truth, no conflicts | Upfront work, large file |
| **Rename organization_members → employees** | Matches types, API routes | Migration data migration needed |
| **Use materialized path for hierarchy** | Fast queries, unlimited depth | Complex path maintenance trigger |
| **Role-scoped RLS policies** | Proper security, audit-ready | Slightly slower queries |
| **Defer teams/roles tables** | Reduces scope, faster MVP | Phase 2 feature work later |

---

## Success Criteria

**Deployment Ready When:**
- ✅ `next build` passes with zero errors
- ✅ Single consolidated migration file
- ✅ All 12 components exist and compile
- ✅ All 3 missing API endpoints implemented
- ✅ RLS write policies enable data mutations
- ✅ Seed data script creates test organization
- ✅ Deployment guide is complete and tested
- ✅ Manual testing: full invite→attest flow works

---

## References

**Conflicting Migrations (TO DELETE):**
- `supabase/migrations/20260209_add_employee_management.sql`
- `supabase/migrations/20260209_organizational_hierarchy.sql`

**Existing Migrations (KEEP):**
- `supabase/migrations/001_create_training_tables.sql`
- `supabase/migrations/20260203_policy_publication_system.sql` (has audit_log)
- `supabase/migrations/20260203_remediation_plan_tracking.sql`

**Type Definitions:**
- `types/employee-management.ts` (aligned with Migration A - needs update)
- `types/database.ts` (missing all new tables - needs regeneration)

**API Routes:**
- `app/api/organizations/route.ts` ✅
- `app/api/departments/route.ts` ✅
- `app/api/employees/invite/route.ts` ✅
- `app/api/policy-bundles/route.ts` ✅
- `app/api/compliance/dashboard/route.ts` ✅
- `app/api/employee/assignments/route.ts` ✅
- `app/api/employee/attest/route.ts` ✅
- `app/api/certificates/[id]/route.ts` ✅

**UI Pages:**
- `app/dashboard/privacy-officer/page.tsx`
- `app/dashboard/privacy-officer/employees/page.tsx`
- `app/dashboard/privacy-officer/departments/page.tsx`
- `app/dashboard/privacy-officer/policy-bundles/page.tsx`
- `app/dashboard/privacy-officer/compliance/page.tsx`
- `app/dashboard/employee/page.tsx`
- `app/dashboard/employee/policies/page.tsx`
- `app/dashboard/employee/policies/[id]/page.tsx`

---

**Status:** SPECIFICATION_COMPLETE | Ready for Phase 2: Execution
