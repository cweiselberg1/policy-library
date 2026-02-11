-- ============================================================================
-- SEED DATA FOR EMPLOYEE MANAGEMENT SYSTEM
-- ============================================================================
-- Purpose: Populate test data for development and demonstration
-- Created: 2026-02-10
-- ============================================================================

-- Note: This seed data uses the default organization created by the main migration
-- The default organization has ID from auth.users table of the first user

-- ============================================================================
-- SEED: DEPARTMENTS
-- ============================================================================
-- Creates a realistic department hierarchy for testing

INSERT INTO public.departments (name, code, path, parent_id, description, organization_id)
SELECT
  'Engineering' as name,
  'ENG' as code,
  '/ENG' as path,
  NULL as parent_id,
  'Engineering and product development' as description,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE code = 'ENG'
);

INSERT INTO public.departments (name, code, path, parent_id, description, organization_id)
SELECT
  'Backend Engineering' as name,
  'BACKEND' as code,
  '/ENG/BACKEND' as path,
  (SELECT id FROM departments WHERE code = 'ENG') as parent_id,
  'Backend services and APIs' as description,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE code = 'BACKEND'
);

INSERT INTO public.departments (name, code, path, parent_id, description, organization_id)
SELECT
  'Frontend Engineering' as name,
  'FRONTEND' as code,
  '/ENG/FRONTEND' as path,
  (SELECT id FROM departments WHERE code = 'ENG') as parent_id,
  'User interfaces and web applications' as description,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE code = 'FRONTEND'
);

INSERT INTO public.departments (name, code, path, parent_id, description, organization_id)
SELECT
  'Compliance & Privacy' as name,
  'COMP' as code,
  '/COMP' as path,
  NULL as parent_id,
  'HIPAA compliance and privacy office' as description,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE code = 'COMP'
);

INSERT INTO public.departments (name, code, path, parent_id, description, organization_id)
SELECT
  'Human Resources' as name,
  'HR' as code,
  '/HR' as path,
  NULL as parent_id,
  'Human resources and employee services' as description,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE code = 'HR'
);

-- ============================================================================
-- SEED: POLICY BUNDLES
-- ============================================================================
-- Creates standard HIPAA policy bundles

INSERT INTO public.policy_bundles (name, description, target_roles, policies, default_due_days, organization_id)
SELECT
  'HIPAA Security Rule - All Staff' as name,
  'Required security training for all employees handling PHI' as description,
  ARRAY['employee', 'manager']::text[] as target_roles,
  jsonb_build_array(
    jsonb_build_object('title', 'Security Awareness Training', 'category', 'Security'),
    jsonb_build_object('title', 'Password Policy', 'category', 'Security'),
    jsonb_build_object('title', 'Device Security', 'category', 'Security'),
    jsonb_build_object('title', 'Workstation Security', 'category', 'Security')
  ) as policies,
  30 as default_due_days,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM policy_bundles WHERE name = 'HIPAA Security Rule - All Staff'
);

INSERT INTO public.policy_bundles (name, description, target_roles, policies, default_due_days, organization_id)
SELECT
  'HIPAA Privacy Rule - All Staff' as name,
  'Required privacy training for all employees' as description,
  ARRAY['employee', 'manager', 'privacy_officer']::text[] as target_roles,
  jsonb_build_array(
    jsonb_build_object('title', 'Notice of Privacy Practices', 'category', 'Privacy'),
    jsonb_build_object('title', 'Minimum Necessary Standard', 'category', 'Privacy'),
    jsonb_build_object('title', 'Patient Rights', 'category', 'Privacy'),
    jsonb_build_object('title', 'Breach Notification', 'category', 'Privacy')
  ) as policies,
  30 as default_due_days,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM policy_bundles WHERE name = 'HIPAA Privacy Rule - All Staff'
);

INSERT INTO public.policy_bundles (name, description, target_roles, policies, default_due_days, organization_id)
SELECT
  'Technical Safeguards - Engineering' as name,
  'Technical security controls for engineering teams' as description,
  ARRAY['employee', 'manager']::text[] as target_roles,
  jsonb_build_array(
    jsonb_build_object('title', 'Access Control', 'category', 'Technical'),
    jsonb_build_object('title', 'Audit Controls', 'category', 'Technical'),
    jsonb_build_object('title', 'Integrity Controls', 'category', 'Technical'),
    jsonb_build_object('title', 'Transmission Security', 'category', 'Technical'),
    jsonb_build_object('title', 'Encryption Standards', 'category', 'Technical')
  ) as policies,
  45 as default_due_days,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM policy_bundles WHERE name = 'Technical Safeguards - Engineering'
);

INSERT INTO public.policy_bundles (name, description, target_roles, policies, default_due_days, organization_id)
SELECT
  'Privacy Officer Responsibilities' as name,
  'Advanced training for Privacy Officers' as description,
  ARRAY['privacy_officer', 'admin']::text[] as target_roles,
  jsonb_build_array(
    jsonb_build_object('title', 'Privacy Officer Duties', 'category', 'Administrative'),
    jsonb_build_object('title', 'Complaint Process', 'category', 'Administrative'),
    jsonb_build_object('title', 'Sanctions Policy', 'category', 'Administrative'),
    jsonb_build_object('title', 'Workforce Training Requirements', 'category', 'Administrative'),
    jsonb_build_object('title', 'Business Associate Management', 'category', 'Administrative')
  ) as policies,
  60 as default_due_days,
  (SELECT id FROM organizations LIMIT 1) as organization_id
WHERE NOT EXISTS (
  SELECT 1 FROM policy_bundles WHERE name = 'Privacy Officer Responsibilities'
);

-- ============================================================================
-- SEED: DEPARTMENT POLICY REQUIREMENTS
-- ============================================================================
-- Assigns policy bundles to departments

-- Engineering department gets Security + Technical Safeguards
INSERT INTO public.department_policy_requirements (department_id, policy_bundle_id, organization_id, due_date_override)
SELECT
  (SELECT id FROM departments WHERE code = 'ENG') as department_id,
  (SELECT id FROM policy_bundles WHERE name = 'HIPAA Security Rule - All Staff') as policy_bundle_id,
  (SELECT id FROM organizations LIMIT 1) as organization_id,
  NULL as due_date_override
WHERE NOT EXISTS (
  SELECT 1 FROM department_policy_requirements
  WHERE department_id = (SELECT id FROM departments WHERE code = 'ENG')
    AND policy_bundle_id = (SELECT id FROM policy_bundles WHERE name = 'HIPAA Security Rule - All Staff')
);

INSERT INTO public.department_policy_requirements (department_id, policy_bundle_id, organization_id, due_date_override)
SELECT
  (SELECT id FROM departments WHERE code = 'ENG') as department_id,
  (SELECT id FROM policy_bundles WHERE name = 'Technical Safeguards - Engineering') as policy_bundle_id,
  (SELECT id FROM organizations LIMIT 1) as organization_id,
  NULL as due_date_override
WHERE NOT EXISTS (
  SELECT 1 FROM department_policy_requirements
  WHERE department_id = (SELECT id FROM departments WHERE code = 'ENG')
    AND policy_bundle_id = (SELECT id FROM policy_bundles WHERE name = 'Technical Safeguards - Engineering')
);

-- Compliance department gets Privacy + Privacy Officer training
INSERT INTO public.department_policy_requirements (department_id, policy_bundle_id, organization_id, due_date_override)
SELECT
  (SELECT id FROM departments WHERE code = 'COMP') as department_id,
  (SELECT id FROM policy_bundles WHERE name = 'HIPAA Privacy Rule - All Staff') as policy_bundle_id,
  (SELECT id FROM organizations LIMIT 1) as organization_id,
  NULL as due_date_override
WHERE NOT EXISTS (
  SELECT 1 FROM department_policy_requirements
  WHERE department_id = (SELECT id FROM departments WHERE code = 'COMP')
    AND policy_bundle_id = (SELECT id FROM policy_bundles WHERE name = 'HIPAA Privacy Rule - All Staff')
);

INSERT INTO public.department_policy_requirements (department_id, policy_bundle_id, organization_id, due_date_override)
SELECT
  (SELECT id FROM departments WHERE code = 'COMP') as department_id,
  (SELECT id FROM policy_bundles WHERE name = 'Privacy Officer Responsibilities') as policy_bundle_id,
  (SELECT id FROM organizations LIMIT 1) as organization_id,
  NULL as due_date_override
WHERE NOT EXISTS (
  SELECT 1 FROM department_policy_requirements
  WHERE department_id = (SELECT id FROM departments WHERE code = 'COMP')
    AND policy_bundle_id = (SELECT id FROM policy_bundles WHERE name = 'Privacy Officer Responsibilities')
);

-- HR gets Privacy Rule
INSERT INTO public.department_policy_requirements (department_id, policy_bundle_id, organization_id, due_date_override)
SELECT
  (SELECT id FROM departments WHERE code = 'HR') as department_id,
  (SELECT id FROM policy_bundles WHERE name = 'HIPAA Privacy Rule - All Staff') as policy_bundle_id,
  (SELECT id FROM organizations LIMIT 1) as organization_id,
  NULL as due_date_override
WHERE NOT EXISTS (
  SELECT 1 FROM department_policy_requirements
  WHERE department_id = (SELECT id FROM departments WHERE code = 'HR')
    AND policy_bundle_id = (SELECT id FROM policy_bundles WHERE name = 'HIPAA Privacy Rule - All Staff')
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify seed data was inserted correctly

-- Check departments
-- SELECT name, code, path FROM departments ORDER BY path;

-- Check policy bundles
-- SELECT name, array_length(target_roles, 1) as role_count,
--        jsonb_array_length(policies) as policy_count
-- FROM policy_bundles;

-- Check department requirements
-- SELECT d.name as department, pb.name as policy_bundle, dpr.created_at
-- FROM department_policy_requirements dpr
-- JOIN departments d ON d.id = dpr.department_id
-- JOIN policy_bundles pb ON pb.id = dpr.policy_bundle_id
-- ORDER BY d.name, pb.name;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. This seed data is idempotent - safe to run multiple times
-- 2. All inserts check for existing data with WHERE NOT EXISTS
-- 3. Employee seed data is NOT included - use the invitation flow instead
-- 4. This creates a realistic org structure for testing:
--    - 5 departments (1 root eng, 2 child eng depts, compliance, HR)
--    - 4 policy bundles (security, privacy, technical, po training)
--    - 6 department-policy assignments
-- 5. After running this, invite employees via the UI to complete testing
-- ============================================================================
