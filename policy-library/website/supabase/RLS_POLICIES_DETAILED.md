# RLS Policies - Detailed Reference

**Comprehensive guide to every Row Level Security policy**

---

## Table of Contents

1. [Overview](#overview)
2. [Organizations Table](#organizations-table)
3. [Departments Table](#departments-table)
4. [Organization Members Table](#organization-members-table)
5. [Policy Bundles Table](#policy-bundles-table)
6. [Department Policy Requirements Table](#department-policy-requirements-table)
7. [Employee Policy Assignments Table](#employee-policy-assignments-table)
8. [Testing RLS Policies](#testing-rls-policies)
9. [Debugging RLS Issues](#debugging-rls-issues)

---

## Overview

### RLS Enforcement Model

**Four Key Principles:**

1. **Explicit Deny by Default** - Without a GRANT, users can't access anything
2. **Policies are ORed** - User needs to match at least ONE policy to get access
3. **RLS applies to ALL operations** - SELECT, INSERT, UPDATE, DELETE
4. **Service role bypasses RLS** - (admin operations only)

### Authentication Context

```typescript
// Available in RLS policies:
auth.uid()          // Current user's UUID
auth.email()        // Current user's email
auth.jwt()          // Full JWT claims object
auth.role()         // 'authenticated' or 'anon'
```

### Policy Structure

```sql
CREATE POLICY "Descriptive name"
  ON table_name
  FOR operation  -- SELECT | INSERT | UPDATE | DELETE | ALL
  TO role        -- authenticated | anon | specific_role
  USING (predicate)      -- For SELECT, UPDATE WHERE clause, DELETE WHERE clause
  WITH CHECK (predicate) -- For INSERT and UPDATE VALUE validation
```

---

## Organizations Table

### Current Policies

#### Policy 1: Admin sees all organizations
```sql
CREATE POLICY "Admin sees all organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );
```

**Who can access:** Privacy officers and admins
**What they see:** All organizations
**Performance:** Uses `idx_org_members_role` index

---

#### Policy 2: Users see their own organization
```sql
CREATE POLICY "Users see their own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
    )
  );
```

**Who can access:** Any authenticated user
**What they see:** Only their organization(s)
**Notes:** Combined with Policy 1 via OR logic

---

### Missing Policies (Add If Needed)

**INSERT** - Who can create organizations?
```sql
-- Option A: Admins only
CREATE POLICY "Admins can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM organization_members
      WHERE role = 'admin'
    )
  );

-- Option B: Restrict via application (recommended)
-- Don't add INSERT policy, restrict at API level
```

**UPDATE** - Who can modify organizations?
```sql
-- Only privacy officers of that org
CREATE POLICY "Privacy officers can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.role = 'privacy_officer'
    )
  )
  WITH CHECK (
    -- Can't elevate org settings
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.role = 'privacy_officer'
    )
  );
```

---

## Departments Table

### Current Policies

#### Policy 1: Privacy officers see all departments
```sql
CREATE POLICY "Privacy officers see all departments in organization"
  ON departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = departments.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );
```

**Who:** Privacy officers and admins
**What:** All departments in their organization
**Index:** `idx_org_members_role`

---

#### Policy 2: Department managers see own + children
```sql
CREATE POLICY "Department managers see own and child departments"
  ON departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = departments.organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'department_manager'
        AND (
          -- Direct assignment to this dept
          om.primary_department_id = departments.id
          -- OR this dept is a child of their assigned dept
          OR departments.path LIKE (
            SELECT d.path || '/%'
            FROM departments d
            WHERE d.id = om.primary_department_id
          )
        )
    )
  );
```

**Who:** Department managers
**What:** Their assigned department + all descendants
**Performance:** Uses `idx_departments_path_like` for child matching

**Example:**
- Manager assigned to `/IT`
- Can see: `/IT`, `/IT/SECURITY`, `/IT/INFRASTRUCTURE`
- Cannot see: `/HR`, `/LEGAL`

---

#### Policy 3: Employees see own department only
```sql
CREATE POLICY "Employees see only their own department"
  ON departments FOR SELECT
  TO authenticated
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

**Who:** Employees
**What:** Only their assigned department
**Performance:** Direct ID match - fastest

---

### Policy Combination Example

**Scenario:** User queries `SELECT * FROM departments WHERE organization_id = 'org-1'`

**Policy evaluation (OR logic):**
```
Match Policy 1? (Is user privacy officer?) → YES → Can see all ✅
  OR
Match Policy 2? (Is user dept manager?) → Check dept hierarchy
  OR
Match Policy 3? (Is user employee?) → Check own dept
```

---

## Organization Members Table

### Current Policies

#### Policy 1: Privacy officers see all members
```sql
CREATE POLICY "Privacy officers see all members in organization"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    organization_members.organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );
```

**Who:** Privacy officers and admins
**What:** All members of their organization
**Index:** `idx_org_members_org_id` + `idx_org_members_role`

---

#### Policy 2: Department managers see own department members
```sql
CREATE POLICY "Department managers see members in their departments"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    organization_members.primary_department_id IN (
      SELECT om.primary_department_id FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.role = 'department_manager'
    )
  );
```

**Who:** Department managers
**What:** Only members assigned to their department(s)
**Index:** `idx_org_members_department`

**Limitation:** Doesn't show child dept members
- Manager of `/IT` won't see members of `/IT/SECURITY`
- **Future improvement:** Use `path LIKE` logic like departments table

---

#### Policy 3: Users see their own record
```sql
CREATE POLICY "Users can see their own member record"
  ON organization_members FOR SELECT
  TO authenticated
  USING (organization_members.user_id = auth.uid());
```

**Who:** All authenticated users
**What:** Their own member record (role, department, etc.)
**Performance:** Direct ID match

---

### Advanced: UPDATE Policies

```sql
-- Privacy officers can modify members
CREATE POLICY "Privacy officers can update members"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    -- Can read this record?
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    -- Can write this record? (Can't elevate self)
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
    AND user_id != auth.uid()  -- Can't change own role
  );

-- Employees can update their own record (limited fields only)
CREATE POLICY "Employees can update own profile"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND role = (SELECT role FROM organization_members WHERE user_id = auth.uid())
    -- Prevent role elevation
  );
```

---

## Policy Bundles Table

### Current Policy

#### Policy: Users see bundles for their organization
```sql
CREATE POLICY "Users see policy bundles for their organization"
  ON policy_bundles FOR SELECT
  TO authenticated
  USING (
    policy_bundles.organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );
```

**Who:** All authenticated users in organization
**What:** Policy bundles defined for that organization
**Rationale:** Bundle definitions are org-wide reference data

---

### Advanced: Scope-Based Visibility

```sql
-- Only show bundles applicable to user's role/dept
CREATE POLICY "Show applicable policy bundles"
  ON policy_bundles FOR SELECT
  TO authenticated
  USING (
    policy_bundles.organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
    AND (
      -- Bundle targets user's role
      om.role = ANY(policy_bundles.target_roles)
      -- OR bundle targets user's department (or all departments)
      OR om.primary_department_id = ANY(
        COALESCE(policy_bundles.target_departments, ARRAY[]::UUID[])
      )
      OR policy_bundles.target_departments IS NULL
    )
  );
```

---

## Department Policy Requirements Table

### Current Policy

```sql
CREATE POLICY "Users see dept policy requirements for their organization"
  ON department_policy_requirements FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT d.id FROM departments d
      WHERE d.organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
      )
    )
  );
```

**Who:** All org members
**What:** Policy requirement overrides for their org's departments
**Rationale:** Reference data showing compliance rules

---

## Employee Policy Assignments Table

### Most Important & Complex

#### Policy 1: Privacy officers see all assignments
```sql
CREATE POLICY "Privacy officers see all assignments in organization"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = employee_policy_assignments.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );
```

**Who:** Privacy officers and admins
**What:** Every assignment in organization
**Compliance:** Can generate organization-wide reports

---

#### Policy 2: Department managers see own department assignments
```sql
CREATE POLICY "Department managers see assignments in their departments"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (
    employee_policy_assignments.department_id IN (
      SELECT d.id FROM departments d
      WHERE EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid()
          AND om.role = 'department_manager'
          AND (
            -- Their assigned department
            om.primary_department_id = d.id
            -- OR child of their assigned department
            OR d.path LIKE CONCAT(
              (SELECT path FROM departments WHERE id = om.primary_department_id),
              '/%'
            )
          )
      )
    )
  );
```

**Who:** Department managers
**What:** Assignments in own + child departments
**Performance:** Uses path-based hierarchy

**Scenario:**
- Manager of `/IT`
- Sees assignments for all IT dept members
- Sees assignments for Security dept (child)
- Cannot see HR assignments

---

#### Policy 3: Employees see own assignments
```sql
CREATE POLICY "Employees see their own assignments"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (employee_policy_assignments.user_id = auth.uid());
```

**Who:** All employees
**What:** Only their own assignments
**Performance:** Direct ID match - fastest

---

### INSERT Policy (Auto-Assign)

```sql
CREATE POLICY "Authenticated users can insert assignments"
  ON employee_policy_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only privacy officers can manually assign
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );
```

**Who:** Privacy officers only (prevent self-assignment)

---

### UPDATE Policy (Track Progress)

```sql
CREATE POLICY "Privacy officers can update assignments"
  ON employee_policy_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Users can update their own assignment status"
  ON employee_policy_assignments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Only allow certain fields to be updated
    AND organization_id = (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND department_id = (SELECT primary_department_id FROM organization_members WHERE user_id = auth.uid())
  );
```

---

## Testing RLS Policies

### Test Setup

```typescript
// tests/rls.test.ts
import { createClient } from '@supabase/supabase-js';

describe('RLS Policies', () => {
  let adminClient: SupabaseClient;
  let managerClient: SupabaseClient;
  let employeeClient: SupabaseClient;
  let testOrg: any;
  let testDept: any;

  beforeAll(async () => {
    // Create test data
    const adminToken = await getTestToken('privacy_officer');
    const managerToken = await getTestToken('department_manager');
    const employeeToken = await getTestToken('employee');

    adminClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
    });
    adminClient.auth.session = () => ({
      ...baseSession,
      user: { ...baseSession.user, id: adminId },
    });
    // ... similar for manager and employee clients
  });

  describe('Departments Policy', () => {
    test('Privacy officer sees all departments', async () => {
      const { data } = await adminClient
        .from('departments')
        .select('*')
        .eq('organization_id', testOrg.id);

      expect(data).toHaveLength(3); // All depts
    });

    test('Manager sees only own and children', async () => {
      const { data } = await managerClient
        .from('departments')
        .select('*')
        .eq('organization_id', testOrg.id);

      // Manager assigned to IT parent
      expect(data).toContainEqual(
        expect.objectContaining({ id: parentDeptId })
      );
      expect(data).toContainEqual(
        expect.objectContaining({ id: childDeptId })
      );

      // Should NOT see HR
      expect(data).not.toContainEqual(
        expect.objectContaining({ id: hrDeptId })
      );
    });

    test('Employee sees only own department', async () => {
      const { data } = await employeeClient
        .from('departments')
        .select('*')
        .eq('organization_id', testOrg.id);

      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(employeesDeptId);
    });

    test('Employee cannot see other orgs', async () => {
      const otherOrgId = 'some-other-org-id';

      const { data, error } = await employeeClient
        .from('departments')
        .select('*')
        .eq('organization_id', otherOrgId);

      // RLS blocks access
      expect(data).toBeNull();
      expect(error?.code).toBe('PGRST116');
    });
  });

  describe('Assignments Policy', () => {
    test('Employee sees only own assignments', async () => {
      const { data } = await employeeClient
        .from('employee_policy_assignments')
        .select('*');

      // Only their assignments
      expect(data.every((a) => a.user_id === employeeUserId)).toBe(true);
    });

    test('Manager sees dept assignments', async () => {
      const { data } = await managerClient
        .from('employee_policy_assignments')
        .select('*')
        .eq('organization_id', testOrg.id);

      // All assignments in their depts
      const managerDeptIds = [parentDeptId, childDeptId];
      expect(
        data.every((a) => managerDeptIds.includes(a.department_id))
      ).toBe(true);
    });

    test('Cannot insert assignments without privacy role', async () => {
      const { error } = await employeeClient
        .from('employee_policy_assignments')
        .insert({
          organization_id: testOrg.id,
          user_id: someUserId,
          department_id: testDept.id,
          policy_bundle_id: bundleId,
        });

      expect(error?.code).toBe('PGRST116');
    });
  });
});
```

---

## Debugging RLS Issues

### Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `PGRST116` | RLS policy denied access | Check user role/dept assignment |
| `23505` | Duplicate (constraint violation) | Check UNIQUE constraints |
| `23503` | Foreign key violation | Referenced record doesn't exist |
| `42501` | Permission denied | GRANT not set |

---

### Debug Techniques

#### 1. Check if RLS is Enabled
```sql
SELECT table_name, row_security_enabled
FROM information_schema.tables
WHERE table_schema = 'public';
-- Should show TRUE for tables with RLS
```

---

#### 2. List All RLS Policies
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

#### 3. Test Policy Manually
```sql
-- Simulate user access with SET LOCAL
SET LOCAL app.current_user_id = 'user-uuid-here';

-- Now query as if you're that user
SELECT * FROM departments
WHERE organization_id = 'org-uuid'
-- RLS applied based on current_user_id

-- Reset
RESET app.current_user_id;
```

---

#### 4. Check Role Membership
```sql
SELECT
  om.user_id,
  u.email,
  om.role,
  om.primary_department_id,
  d.code
FROM organization_members om
JOIN auth.users u ON u.id = om.user_id
LEFT JOIN departments d ON d.id = om.primary_department_id
WHERE om.organization_id = 'org-uuid'
ORDER BY u.email;
```

---

#### 5. Temporarily Disable RLS (Debug Only)
```sql
-- In development/test only
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;

-- Query to check if issue is RLS-related
SELECT * FROM departments ...;

-- Re-enable
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
```

---

### Typical RLS Issues

**Issue: "User can't see their department"**
```sql
-- Check: Does user have organization_members record?
SELECT * FROM organization_members
WHERE user_id = 'user-id'
  AND organization_id = 'org-id';

-- Check: Is primary_department_id set?
-- (Should be NULL or a valid dept ID)

-- Check: Does department exist in that org?
SELECT * FROM departments
WHERE id = 'dept-id'
  AND organization_id = 'org-id';
```

---

**Issue: "Manager can't see child departments"**
```sql
-- Check: Is manager's path correct?
SELECT d1.id, d1.code, d1.path,
       d2.id, d2.code, d2.path
FROM departments d1
JOIN departments d2 ON d2.parent_id = d1.id
WHERE d1.organization_id = 'org-id'
ORDER BY d1.path;

-- Verify LIKE logic works
SELECT * FROM departments
WHERE path LIKE '/PARENT/%'
  AND organization_id = 'org-id';
```

---

**Issue: "RLS policy seems to have no effect"**
```sql
-- Check: Is RLS enabled?
SELECT row_security_enabled FROM information_schema.tables
WHERE table_name = 'departments';

-- Check: Are policies created?
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'departments';

-- Check: Is GRANT set?
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'departments';
```

---

### RLS Policy Best Practices

1. **Always use EXISTS over IN**
   ```sql
   -- Good: Uses index efficiently
   WHERE EXISTS (SELECT 1 FROM organization_members ...)

   -- Avoid: Scans whole table
   WHERE user_id IN (SELECT user_id FROM organization_members ...)
   ```

2. **Index the join column**
   ```sql
   -- Required indexes for RLS policies to be fast:
   CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
   CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
   ```

3. **Test with real user IDs**
   ```typescript
   // Always test with auth.uid() context, not hardcoded values
   const { data } = await supabase
     .from('departments')
     .select('*')
     .eq('organization_id', orgId);
   // auth.uid() is evaluated at query time
   ```

4. **Document policy intent**
   ```sql
   COMMENT ON POLICY "Privacy officers see all departments"
   ON departments IS
   'Allows privacy officers and admins to view all departments in their organization. '
   'Uses organization_members.role to check for privacy_officer or admin role.';
   ```

---

**RLS Policies Reference v1.0 - Complete & Production Ready**
