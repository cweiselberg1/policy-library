-- Fix infinite recursion in employees RLS policies
-- The issue: policies on "employees" use subqueries that reference "employees" itself,
-- which triggers RLS evaluation again → infinite loop.
-- Solution: Use SECURITY DEFINER helper functions that bypass RLS.

-- Step 1: Create helper functions (bypass RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM employees WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM employees WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_department_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT department_id FROM employees WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 2: Drop the recursive policies
DROP POLICY IF EXISTS "Privacy officers see all employees in org" ON employees;
DROP POLICY IF EXISTS "Department managers see own department employees" ON employees;

-- Step 3: Recreate them using the helper functions (no recursion)
CREATE POLICY "Privacy officers see all employees in org"
  ON employees FOR SELECT
  TO authenticated
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'privacy_officer')
  );

CREATE POLICY "Department managers see own department employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'department_manager'
    AND department_id = get_user_department_id()
  );

-- Step 4: Also fix policies on other tables that reference employees
-- These cause the same recursion when they trigger employees RLS

-- Fix policy_bundles
DROP POLICY IF EXISTS "Users see bundles for their organization" ON policy_bundles;
CREATE POLICY "Users see bundles for their organization"
  ON policy_bundles FOR SELECT
  TO authenticated
  USING (organization_id = get_user_org_id());

-- Fix employee_policy_assignments SELECT policies
DROP POLICY IF EXISTS "Privacy officers see all assignments in org" ON employee_policy_assignments;
CREATE POLICY "Privacy officers see all assignments in org"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'privacy_officer')
  );

DROP POLICY IF EXISTS "Managers see department assignments" ON employee_policy_assignments;
CREATE POLICY "Managers see department assignments"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'department_manager'
    AND department_id = get_user_department_id()
  );

-- Keep the simple self-access policy (no recursion issue)
-- "Employees can see their own record" already exists and is fine
-- "Employees see own assignments" should also be fine if it uses user_id = auth.uid()
