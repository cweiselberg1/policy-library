# Organizational Hierarchy Migration Strategy

**Version:** 1.0
**Date:** 2026-02-09
**Status:** Design & Implementation Guide
**Schema Version:** 20260209_organizational_hierarchy

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [New Architecture](#new-architecture)
4. [Migration Phases](#migration-phases)
5. [RLS Strategy](#rls-strategy)
6. [Trigger Design](#trigger-design)
7. [Foreign Key Strategy](#foreign-key-strategy)
8. [Data Integrity](#data-integrity)
9. [Rollback Plan](#rollback-plan)
10. [Testing Checklist](#testing-checklist)

---

## Executive Summary

This migration adds **hierarchical organizational management** to the policy library system without breaking existing functionality. Key improvements:

### New Capabilities
- **Multi-tenant support** - Isolated organizations with independent users
- **Unlimited department nesting** - Via materialized path pattern (efficient querying)
- **Policy bundling** - Group policies by role/department
- **Role-based access control** - Privacy Officer → Department Manager → Employee
- **Automated assignment tracking** - Due dates, completion %, overdue alerts

### Backwards Compatibility
- Existing users automatically migrated to "Default Organization"
- Legacy `users.department` and `users.role` fields synced via trigger
- All existing training tables remain untouched
- Phase-in approach allows gradual adoption

### Performance Guarantees
- Department hierarchy queries: **O(log n)** via materialized path
- User assignment queries: **< 50ms** with proper indexing
- RLS policies evaluated at query-time (no additional round-trips)

---

## Current State Analysis

### Existing Schema (Before Migration)

```
auth.users (Supabase managed)
    ↓
users (policy-library custom)
  - id (UUID)
  - email, full_name
  - department (TEXT) ← loose string
  - role (TEXT) ← loose string
  - created_at, updated_at

training_progress (per user)
policy_acknowledgments (per user)
module_completions (per user)
training_sessions (per user)

remediation_plans
policy_publications
audit_log
```

### Limitations

| Issue | Impact | Solution |
|-------|--------|----------|
| No org isolation | Users from different orgs see each other | Organizations table + RLS |
| Flat departments | Can't model hierarchies | Materialized path with triggers |
| String roles | No type safety | ENUM + RLS policies |
| Manual assignments | No tracking, overdue alerts | employee_policy_assignments table |
| No audit trail for org changes | Compliance blind spot | Triggers update audit_log |

---

## New Architecture

### Table Relationships

```
organizations (root)
    ↓
    ├─ departments (tree with materialized path)
    │    ├─ department_policy_requirements
    │    └─ organization_members (many-to-many)
    │
    ├─ policy_bundles (grouped policies)
    │    └─ employee_policy_assignments (tracks individuals)
    │
    └─ organization_members (role assignments)

employee_policy_assignments
    ↑
    └─ Links user → bundle → department → due_date
```

### Core Tables

#### 1. **organizations**
```sql
- id (UUID) PRIMARY KEY
- name (TEXT) UNIQUE
- slug (TEXT) UNIQUE
- primary_contact_email, legal_entity_name
- max_users_allowed, enable_sso
- created_at, updated_at, deleted_at (soft delete)
```

**Purpose:** Multi-tenant isolation
**Key Feature:** Soft deletes for audit trail

---

#### 2. **departments** (with Materialized Path)

```sql
- id (UUID) PRIMARY KEY
- organization_id (FK)
- parent_id (FK, self-referential)
- name, code (e.g., "IT", "IT-SEC")
- path (TEXT) → "/IT/IT-SEC" ← materialized path
- path_depth (INT) → 2
- policy_officer_user_id (FK)
- status (ENUM: active, inactive, archived)
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

**Materialized Path Example:**
```
Organization: "Acme Corp"
├─ /ACME                                    (depth 1, root)
│  ├─ /ACME/IT                              (depth 2)
│  │  ├─ /ACME/IT/SECURITY                  (depth 3)
│  │  └─ /ACME/IT/INFRASTRUCTURE            (depth 3)
│  ├─ /ACME/HR                              (depth 2)
│  └─ /ACME/LEGAL                           (depth 2)
└─ /ACME/OPERATIONS                         (depth 2)
   └─ /ACME/OPERATIONS/COMPLIANCE           (depth 3)
```

**Advantages:**
- ✅ Unlimited nesting (unlike closure tables)
- ✅ Fast ancestor queries: `WHERE path LIKE '/IT/%'`
- ✅ Fast path calculation via trigger
- ✅ Single column index covers most queries

**Query Patterns:**
```sql
-- All children of /IT (recursive)
SELECT * FROM departments
WHERE path LIKE '/IT/%'
  AND organization_id = $org_id;

-- Direct children only (depth = parent_depth + 1)
SELECT * FROM departments
WHERE parent_id = $dept_id;

-- Ancestors
SELECT * FROM departments
WHERE organization_id = $org_id
  AND $child_path LIKE path || '%'
ORDER BY path_depth DESC;
```

---

#### 3. **organization_members**

```sql
- id (UUID) PRIMARY KEY
- organization_id (FK)
- user_id (FK → auth.users)
- role (ENUM: privacy_officer, compliance_manager,
               department_manager, employee, admin)
- primary_department_id (FK, nullable for POs)
- is_active, is_locked
- invited_at, activated_at, last_login_at
- created_at, updated_at, deleted_at
```

**Role Hierarchy:**
```
admin (all access)
    ↓
privacy_officer (organization-wide)
    ↓
compliance_manager (multiple departments)
    ↓
department_manager (own dept + children)
    ↓
employee (self + assigned policies)
```

---

#### 4. **policy_bundles**

```sql
- id (UUID) PRIMARY KEY
- organization_id (FK)
- name, slug, description
- target_roles (user_role_type[]) → {employee, department_manager}
- target_departments (UUID[]) → NULL means all depts
- policy_ids (TEXT[]) → {policy-001, policy-002}
- is_default (BOOLEAN) → auto-assign to new users?
- is_required (BOOLEAN) → blocks certain actions if incomplete?
- due_days (INT) → 30
- created_at, updated_at, deleted_at
```

**Examples:**
```json
{
  "name": "Onboarding Bundle",
  "target_roles": ["employee"],
  "target_departments": null,
  "policy_ids": ["HIPAA-101", "HIPAA-SECURITY", "INCIDENT-RESPONSE"],
  "is_default": true,
  "due_days": 7
}

{
  "name": "IT Security Bundle",
  "target_roles": ["employee", "department_manager"],
  "target_departments": ["UUID-IT", "UUID-IT-SEC"],
  "policy_ids": ["ACCESS-CONTROL", "ENCRYPTION", "INCIDENT-RESPONSE"],
  "is_required": true,
  "due_days": 30
}
```

---

#### 5. **department_policy_requirements**

```sql
- id (UUID) PRIMARY KEY
- department_id (FK)
- policy_bundle_id (FK)
- due_days (INT, nullable) → override bundle default
- enforcement_level (ENUM: required, recommended, optional)
- additional_requirements (JSONB)
- created_at, updated_at
```

**Purpose:** Department-specific overrides
**Example:** Security dept requires 7-day completion vs default 30 days

---

#### 6. **employee_policy_assignments**

```sql
- id (UUID) PRIMARY KEY
- organization_id (FK)
- user_id (FK)
- department_id (FK)
- policy_bundle_id (FK)
- status (ENUM: assigned, acknowledged, completed, overdue, waived)
- assigned_at, due_at, acknowledged_at, completed_at
- completion_percentage (INT, 0-100)
- is_overdue (COMPUTED: NOW() > due_at AND status NOT IN (completed, waived))
- reassigned_count, last_reassigned_at
- notes, waiver_reason
- created_at, updated_at
```

**Triggers:**
- Auto-calculate `due_at` from bundle + dept override
- Auto-mark as overdue when `NOW() > due_at`
- Track reassignments

---

## Migration Phases

### Phase 1: Schema Creation (Zero Downtime)

**Duration:** ~30 seconds
**Risk:** Low (only additions, no drops)

```bash
# 1. Create all new tables (if not exists guards)
# 2. Create indexes in background (CONCURRENTLY)
# 3. Enable RLS (queries still work, policies not enforced yet)
# 4. Migrate existing users to default org
# 5. Log audit event
```

**Command:**
```bash
psql $DATABASE_URL < migrations/20260209_organizational_hierarchy.sql
```

**Verification:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%organization%'
OR table_name LIKE '%department%'
OR table_name LIKE '%assignment%';
```

---

### Phase 2: Data Migration (Concurrent)

**Duration:** ~1-5 minutes depending on user count
**Risk:** Low (additive only)

```sql
-- Already executed in migration file
INSERT INTO organization_members (organization_id, user_id, role, ...)
SELECT org.id, u.id, ...
FROM organizations org
CROSS JOIN public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM organization_members om
  WHERE om.user_id = u.id AND om.organization_id = org.id
);
```

**What happens:**
- Each existing user gets membership in "Default Organization"
- Role inferred from `users.role` field
- Department set to "All Employees" root dept
- No disruption to active sessions

---

### Phase 3: RLS Enforcement (Gradual)

**Option A: Immediate (Recommended for new deployments)**
```sql
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
-- etc.
```

**Option B: Phased (For existing production)**
```sql
-- Week 1: Policies exist but not enforced (using test role)
CREATE ROLE test_rls;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
GRANT test_rls ON departments;

-- Week 2: Test with subset of users
ALTER ROLE authenticated SET log_statement = 'all';

-- Week 3: Enforce globally
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
```

**Verify RLS is working:**
```sql
-- As privacy_officer in org A, should NOT see users from org B
SELECT * FROM organization_members
WHERE organization_id = $org_b_id; -- Returns 0 rows (RLS applied)
```

---

### Phase 4: Application Updates (Coordinated)

**When:** After Phase 1 & 2 complete, before Phase 3 enforcement

Frontend/API changes:
1. Load organization context from `organization_members` table
2. Use `path LIKE` for dept hierarchy queries
3. Check RLS policies before critical operations
4. Display overdue assignments in dashboard

**Example Query Update:**
```typescript
// BEFORE: No multi-tenancy
const user = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// AFTER: With multi-tenancy
const { data: member } = await supabase
  .from('organization_members')
  .select('*, organization:organizations(*), department:departments(*)')
  .eq('user_id', userId)
  .eq('organization_id', currentOrgId)
  .single();

const { data: assignments } = await supabase
  .from('employee_policy_assignments')
  .select('*, policy_bundle:policy_bundles(*)')
  .eq('user_id', userId)
  .eq('organization_id', currentOrgId)
  .order('due_at', { ascending: true });
```

---

## RLS Strategy

### Design Principle

**"Each role sees only what they can act on"**

### Role-Based Access Matrix

| Role | Organizations | Departments | Members | Assignments |
|------|---|---|---|---|
| **admin** | All in org | All | All | All |
| **privacy_officer** | Own org | All | All | All (can edit) |
| **compliance_manager** | Own org | Assigned depts + children | Own depts | Own depts |
| **department_manager** | Own org | Own + children | Own dept | Own dept |
| **employee** | Own org | Own dept only | Self only | Self only |

### RLS Policy Details

#### Organizations
```sql
-- Privacy officers + admins can see all orgs they're members of
CREATE POLICY "Admin sees all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );

-- Employees see only their org
CREATE POLICY "Users see own organization"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
    )
  );
```

#### Departments (Most Complex)
```sql
-- Privacy officers see all
CREATE POLICY "Privacy officers see all departments"
  ON departments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = departments.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );

-- Department managers see own + all children
CREATE POLICY "Managers see own and child departments"
  ON departments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = departments.organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'department_manager'
        AND (
          -- Either they're assigned to this dept
          om.primary_department_id = departments.id
          -- Or this dept is a child of their dept
          OR departments.path LIKE (
            SELECT d.path || '/%'
            FROM departments d
            WHERE d.id = om.primary_department_id
          )
        )
    )
  );

-- Employees see only their dept
CREATE POLICY "Employees see own department"
  ON departments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = departments.organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'employee'
        AND om.primary_department_id = departments.id
    )
  );
```

#### Employee Assignments (Hierarchical)
```sql
-- Privacy officers see all assignments
CREATE POLICY "Privacy officers see all assignments"
  ON employee_policy_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = employee_policy_assignments.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );

-- Department managers see assignments in their dept hierarchy
CREATE POLICY "Managers see assignments in their departments"
  ON employee_policy_assignments FOR SELECT
  USING (
    employee_policy_assignments.department_id IN (
      SELECT d.id FROM departments d
      WHERE EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid()
          AND om.role = 'department_manager'
          AND (
            -- Own dept
            om.primary_department_id = d.id
            -- Or child of own dept
            OR d.path LIKE CONCAT(
              (SELECT path FROM departments WHERE id = om.primary_department_id),
              '/%'
            )
          )
      )
    )
  );

-- Employees see only their assignments
CREATE POLICY "Employees see own assignments"
  ON employee_policy_assignments FOR SELECT
  USING (employee_policy_assignments.user_id = auth.uid());
```

### Critical Implementation Notes

1. **RLS applies to all operations** - SELECT, INSERT, UPDATE, DELETE
2. **Policies are OR'd together** - User needs to match at least one
3. **No data leakage in subqueries** - Use `EXISTS` not `IN`
4. **Performance:** Indexes on `(organization_id, user_id)` and `(organization_id, role)` are critical
5. **Testing:** Always test as different roles with Supabase test client

---

## Trigger Design

### Trigger 1: Maintain Department Path

**Event:** BEFORE INSERT/UPDATE on departments
**Purpose:** Auto-compute and validate path

```sql
CREATE OR REPLACE FUNCTION maintain_department_path()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_path TEXT;
  v_parent_depth INTEGER;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := '/' || NEW.code;
    NEW.path_depth := 1;
  ELSE
    SELECT path, path_depth INTO v_parent_path, v_parent_depth
    FROM departments
    WHERE id = NEW.parent_id
      AND organization_id = NEW.organization_id;

    IF v_parent_path IS NULL THEN
      RAISE EXCEPTION 'Parent not found or wrong organization';
    END IF;

    NEW.path := v_parent_path || '/' || NEW.code;
    NEW.path_depth := v_parent_depth + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Example:**
```sql
-- Insert parent
INSERT INTO departments (organization_id, parent_id, name, code)
VALUES ('org-1', NULL, 'IT', 'IT');
-- Auto-generates: path = '/IT', path_depth = 1

-- Insert child
INSERT INTO departments (organization_id, parent_id, name, code)
VALUES ('org-1', 'dept-1', 'Security', 'SEC');
-- Auto-generates: path = '/IT/SEC', path_depth = 2
```

---

### Trigger 2: Calculate Assignment Due Dates

**Event:** BEFORE INSERT on employee_policy_assignments
**Purpose:** Auto-set due_at based on bundle + dept overrides

```sql
CREATE OR REPLACE FUNCTION calculate_assignment_due_date()
RETURNS TRIGGER AS $$
DECLARE
  v_due_days INTEGER;
BEGIN
  -- Try dept override first, then bundle default
  SELECT COALESCE(dpr.due_days, pb.due_days, 30)
  INTO v_due_days
  FROM policy_bundles pb
  LEFT JOIN department_policy_requirements dpr
    ON dpr.policy_bundle_id = pb.id
    AND dpr.department_id = NEW.department_id
  WHERE pb.id = NEW.policy_bundle_id;

  NEW.due_at := NEW.assigned_at + (v_due_days || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Execution Order:**
1. Policy Bundle due_days: 30 (default)
2. Department Override: 14 (for Security dept)
3. **Result: due_at = TODAY + 14 days**

---

### Trigger 3: Sync Legacy Users Table

**Event:** AFTER INSERT/UPDATE on organization_members
**Purpose:** Keep old `users.role` + `users.department` in sync

```sql
CREATE OR REPLACE FUNCTION sync_user_profile_from_org_member()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    role = NEW.role::TEXT,
    department = (
      SELECT code FROM departments
      WHERE id = NEW.primary_department_id
    ),
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Purpose:** Gradual migration - old code can still read `users.role` and `users.department`

---

### Trigger 4: Timestamp Auto-Update

**Event:** BEFORE UPDATE on all tables
**Purpose:** Standard updated_at maintenance

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to: organizations, departments, organization_members, policy_bundles, employee_policy_assignments

---

## Foreign Key Strategy

### Integrity Constraints

```sql
-- organizations
CONSTRAINTS: name UNIQUE, slug UNIQUE

-- departments
CONSTRAINTS:
  - organization_id FK ON DELETE CASCADE
  - parent_id FK ON DELETE CASCADE (self-ref)
  - policy_officer_user_id FK ON DELETE SET NULL
  - unique(organization_id, code)
  - unique(organization_id, path)
  - CHECK path format

-- organization_members
CONSTRAINTS:
  - organization_id FK ON DELETE CASCADE
  - user_id FK ON DELETE CASCADE
  - primary_department_id FK ON DELETE SET NULL
  - unique(organization_id, user_id)

-- policy_bundles
CONSTRAINTS:
  - organization_id FK ON DELETE CASCADE
  - unique(organization_id, slug)

-- employee_policy_assignments
CONSTRAINTS:
  - organization_id FK ON DELETE CASCADE
  - user_id FK ON DELETE CASCADE
  - department_id FK ON DELETE CASCADE
  - policy_bundle_id FK ON DELETE CASCADE
  - unique(user_id, policy_bundle_id, assigned_at)
  - CHECK assigned_at <= due_at
```

### Cascading Deletes

| Event | Cascade Behavior |
|-------|------------------|
| Org deleted | All members, depts, assignments deleted |
| Dept deleted | Child depts, members deleted; assignments deleted |
| User deleted | Member record, assignments deleted |
| Policy bundle deleted | All assignments deleted |

**Example:** If Security dept is archived:
```sql
UPDATE departments SET deleted_at = NOW()
WHERE id = 'dept-security';

-- Trigger: All employee_policy_assignments for that dept are soft-deleted
-- RLS: The deleted dept becomes invisible to employees
```

---

## Data Integrity

### Validation Rules

#### 1. Department Paths Are Immutable (After Creation)
```sql
-- Once created, path should never change
-- (Updating path requires re-cascading to all children)
-- Solution: Triggers prevent path updates except via parent_id change
```

#### 2. Circular Parent References Forbidden
```sql
-- Prevent: dept.parent_id pointing to its own child
-- Solution: CHECK constraint + trigger validation
```

#### 3. Users Cannot Exist in 0 Organizations
```sql
-- Every auth.user should have at least one organization_members record
-- Solution: Trigger on users table to auto-create membership
```

#### 4. Due Dates Must Be In Future
```sql
-- Prevent backdating assignments
-- Solution: CHECK (due_at > assigned_at)
```

#### 5. Completed Assignments Cannot Be Reassigned
```sql
-- Once status = 'completed', block updates
-- Solution: Application logic (not enforced at DB level to allow corrections)
```

### Consistency Checks

Run after migration:
```sql
-- Verify all users have org membership
SELECT COUNT(*) FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM organization_members om WHERE om.user_id = u.id
);
-- Should return 0

-- Verify path format
SELECT id, path FROM departments
WHERE path !~ '^/[A-Z0-9-/]*$'
-- Should return 0 rows

-- Verify unique paths per org
SELECT organization_id, path, COUNT(*)
FROM departments
GROUP BY organization_id, path
HAVING COUNT(*) > 1
-- Should return 0 rows

-- Verify depth calculations
SELECT d.id, d.path_depth,
  (LENGTH(d.path) - LENGTH(REPLACE(d.path, '/', '')) + 1) as calculated_depth
FROM departments d
WHERE d.path_depth !=
  (LENGTH(d.path) - LENGTH(REPLACE(d.path, '/', '')) + 1)
-- Should return 0 rows
```

---

## Rollback Plan

### If Migration Fails During Execution

**Option 1: Partial Rollback (Recommended)**
```sql
-- Drop new tables (cascades work correctly)
DROP TABLE employee_policy_assignments CASCADE;
DROP TABLE department_policy_requirements CASCADE;
DROP TABLE policy_bundles CASCADE;
DROP TABLE organization_members CASCADE;
DROP TABLE departments CASCADE;
DROP TABLE organizations CASCADE;

-- Drop functions/triggers
DROP FUNCTION IF EXISTS maintain_department_path();
DROP FUNCTION IF EXISTS calculate_assignment_due_date();
-- ... etc

-- Drop types
DROP TYPE IF EXISTS user_role_type;
DROP TYPE IF EXISTS department_status_type;
DROP TYPE IF EXISTS assignment_status_type;

-- Revert users table (if modified)
-- Already done: no changes to existing tables
```

**Time:** ~5 seconds

---

### If Application Code Breaks

**Option 1: Disable RLS Temporarily**
```sql
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
-- ... disable all
-- Queries work, but no access control
```

**Option 2: Rollback RLS Only**
```sql
DROP POLICY IF EXISTS "Admin can see all organizations" ON organizations;
-- ... drop policies
-- Queries work, default behavior = no access
```

---

### If Data Corruption Occurs

**Point-in-Time Recovery:**
```bash
# Restore from backup made before migration
# Supabase: Use dashboard backup/restore
# Self-hosted: pg_dump from pre-migration snapshot

# Then re-run migration
```

---

## Testing Checklist

### Unit Tests (PostgreSQL Functions)

```sql
-- Test 1: Department path generation
BEGIN;
  INSERT INTO organizations (name, slug, primary_contact_email)
  VALUES ('test-org', 'test-org', 'test@example.com');

  INSERT INTO departments (organization_id, name, code, parent_id)
  VALUES (
    (SELECT id FROM organizations WHERE slug = 'test-org'),
    'Root', 'ROOT', NULL
  );

  -- Verify path
  SELECT path FROM departments WHERE code = 'ROOT'
  -- Should return: '/ROOT'
ROLLBACK;

-- Test 2: Department nesting
BEGIN;
  -- Create org
  INSERT INTO organizations (name, slug, primary_contact_email)
  VALUES ('test-org-2', 'test-org-2', 'test@example.com');

  -- Create parent
  INSERT INTO departments (organization_id, name, code, parent_id)
  VALUES (
    (SELECT id FROM organizations WHERE slug = 'test-org-2'),
    'IT', 'IT', NULL
  );

  -- Create child
  INSERT INTO departments (organization_id, name, code, parent_id)
  VALUES (
    (SELECT id FROM organizations WHERE slug = 'test-org-2'),
    'Security', 'SEC',
    (SELECT id FROM departments WHERE code = 'IT')
  );

  -- Verify paths
  SELECT code, path, path_depth FROM departments ORDER BY code
  -- Should return:
  -- IT,  /IT,      1
  -- SEC, /IT/SEC,  2
ROLLBACK;
```

### Integration Tests (Application Layer)

```typescript
// Test 1: RLS prevents cross-org access
const orgA = await createOrg('Org A');
const orgB = await createOrg('Org B');
const userA = await createUser(orgA);
const userB = await createUser(orgB);

// Logged in as userA in orgA
const members = await db
  .from('organization_members')
  .select('*')
  .eq('organization_id', orgB.id);

expect(members.data).toHaveLength(0);  // RLS applied

// Test 2: Department hierarchy query
const orgC = await createOrg('Org C');
const dept1 = await createDept(orgC, null, 'IT');
const dept2 = await createDept(orgC, dept1.id, 'Security');
const dept3 = await createDept(orgC, dept2.id, 'Compliance');

// Find all descendants of IT
const allITChildren = await db
  .from('departments')
  .select('*')
  .like('path', '/IT/%');

expect(allITChildren.data).toHaveLength(2);  // Security, Compliance

// Test 3: Assignment due dates
const bundle = await createBundle(orgC, { due_days: 30 });
const assignment = await createAssignment(user, bundle);

expect(assignment.due_at).toBe(
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
);

// Test 4: Department override
const deptOverride = await createDeptOverride(dept2, bundle, { due_days: 7 });
const assignmentWithOverride = await createAssignment(user, bundle, dept2);

expect(assignmentWithOverride.due_at).toBe(
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
);
```

### Performance Tests

```sql
-- Test 1: Path query performance (< 50ms)
EXPLAIN ANALYZE
SELECT * FROM departments
WHERE organization_id = $org_id
  AND path LIKE '/IT/%';

-- Test 2: RLS policy evaluation (< 100ms per query)
EXPLAIN ANALYZE
SELECT * FROM employee_policy_assignments
WHERE organization_id = $org_id;

-- Test 3: Large hierarchy (1000+ depts)
-- Create 1000-deep hierarchy
-- Query ancestor/descendant - should be < 50ms

-- Test 4: Concurrent writes
-- 10 concurrent assignments to same bundle
-- No deadlocks or unique constraint violations
```

### Security Tests

```sql
-- Test 1: Privacy officer cannot elevate own role
-- Attempt: UPDATE organization_members SET role = 'admin'
-- Result: Should block at application layer or via policy

-- Test 2: Employee cannot see other employees' assignments
SELECT * FROM employee_policy_assignments
WHERE user_id != auth.uid()
-- RLS should return 0 rows

-- Test 3: Department manager cannot modify other depts
UPDATE departments SET description = 'Hacked'
WHERE id != (SELECT primary_department_id FROM organization_members WHERE user_id = auth.uid())
-- Should fail or block

-- Test 4: Cross-org data leakage
-- Create users in org A and B
-- Query as user A, attempt to see org B assignments
-- RLS should prevent
```

### Smoke Tests (Post-Deployment)

```bash
# 1. Run consistency checks
psql $DB < /path/to/consistency_checks.sql

# 2. Verify legacy compatibility
# - Old code can still read users.role
# - Old code can still read users.department
# - Existing training flows still work

# 3. Check audit log
SELECT * FROM audit_log WHERE event_type LIKE '%migration%'

# 4. Monitor slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 50  -- 50ms threshold

# 5. Test backup/restore
pg_dump | pg_restore  -- Verify idempotence
```

---

## Implementation Checklist

### Pre-Deployment
- [ ] Review this document with DBA
- [ ] Schedule maintenance window (if needed)
- [ ] Create backup
- [ ] Test rollback procedure
- [ ] Load test new RLS policies
- [ ] Update API documentation

### Migration Day
- [ ] Run Phase 1 (schema creation)
- [ ] Run consistency checks
- [ ] Run integration tests
- [ ] Deploy Phase 2 code (if needed)
- [ ] Monitor error logs for 30 minutes
- [ ] Enable Phase 3 RLS (or schedule for later)

### Post-Deployment
- [ ] Verify all users have org membership
- [ ] Check audit log entries
- [ ] Monitor query performance
- [ ] Gather user feedback
- [ ] Schedule team training on new concepts

---

## References

### Schema File
- `/supabase/migrations/20260209_organizational_hierarchy.sql`

### Related Views
- `v_department_hierarchy` - Department tree structure
- `v_user_assignments_summary` - User compliance status

### Key Indexes (Performance Critical)
```
idx_departments_path
idx_assignments_org_user_status
idx_assignments_is_overdue
idx_org_members_role
```

---

## Questions & Answers

**Q: Can I rename a department code after creation?**
A: No - it would break the materialized path. Create a new dept or update via API that handles cascade.

**Q: What happens if a user is deleted?**
A: All their assignments are soft-deleted (deleted_at set). They stay in database for audit.

**Q: Can a user belong to multiple organizations?**
A: Yes! Create multiple organization_members records with same user_id, different organization_id.

**Q: How do I query user's assigned policies?**
A: See v_user_assignments_summary view for summary, or join with employee_policy_assignments.

**Q: What if RLS policies have a bug?**
A: Disable RLS temporarily, fix policies, re-enable. Or rollback migration.

---

**Migration Strategy v1.0 - Ready for Implementation**
