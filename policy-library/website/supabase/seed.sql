-- =====================================================
-- SEED DATA FOR EMPLOYEE MANAGEMENT SYSTEM
-- =====================================================
--
-- IMPORTANT: This script assumes auth.users already exist.
-- Replace placeholder UUIDs below with actual Supabase auth user IDs.
--
-- To get real auth user IDs from Supabase:
--   SELECT id, email FROM auth.users;
--
-- Then replace these placeholder UUIDs:
--   '00000000-0000-0000-0000-000000000001' -> actual admin user ID
--   '00000000-0000-0000-0000-000000000002' -> actual user ID
--   ... etc.
--
-- Usage:
--   psql $DATABASE_URL -f supabase/seed.sql
--   OR via Supabase dashboard SQL Editor
--
-- To reset (run these DELETEs first if re-seeding):
--   DELETE FROM employee_policy_assignments;
--   DELETE FROM policy_bundles;
--   DELETE FROM employees;
--   DELETE FROM departments;
--   DELETE FROM organizations;
--
-- =====================================================

BEGIN;

-- =====================================================
-- ORGANIZATIONS
-- =====================================================

INSERT INTO organizations (
  id,
  name,
  slug,
  primary_contact_email,
  subscription_tier,
  status,
  created_at,
  updated_at
) VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Acme Healthcare System',
  'acme-healthcare',
  'admin@acmehealthcare.test',
  'enterprise',
  'active',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  primary_contact_email = EXCLUDED.primary_contact_email,
  subscription_tier = EXCLUDED.subscription_tier,
  status = EXCLUDED.status;

-- =====================================================
-- DEPARTMENTS (3-level hierarchy)
-- =====================================================

-- Root: Clinical Operations
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Clinical Operations',
  'CLINICAL',
  NULL,
  'CLINICAL',
  1,
  'Clinical and patient care operations',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Level 2: Emergency Department
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'Emergency Department',
  'ED',
  'd1000000-0000-0000-0000-000000000001',
  'CLINICAL.ED',
  2,
  'Emergency medical services',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Level 3: Triage Unit
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'Triage Unit',
  'TRIAGE',
  'd1000000-0000-0000-0000-000000000002',
  'CLINICAL.ED.TRIAGE',
  3,
  'Emergency triage and initial assessment',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Level 2: Surgical Services
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000001',
  'Surgical Services',
  'SURGERY',
  'd1000000-0000-0000-0000-000000000001',
  'CLINICAL.SURGERY',
  2,
  'Surgical operations and perioperative care',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Root: Administrative
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000001',
  'Administrative',
  'ADMIN',
  NULL,
  'ADMIN',
  1,
  'Administrative and business operations',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Level 2: Billing Department
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000001',
  'Billing Department',
  'BILLING',
  'd1000000-0000-0000-0000-000000000005',
  'ADMIN.BILLING',
  2,
  'Patient billing and insurance claims',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Level 2: Human Resources
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000001',
  'Human Resources',
  'HR',
  'd1000000-0000-0000-0000-000000000005',
  'ADMIN.HR',
  2,
  'Employee relations and benefits',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Root: IT Department
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000001',
  'IT Department',
  'IT',
  NULL,
  'IT',
  1,
  'Information technology services',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Level 2: IT Security
INSERT INTO departments (
  id,
  organization_id,
  name,
  code,
  parent_id,
  path,
  path_depth,
  description,
  created_at,
  updated_at
) VALUES (
  'd1000000-0000-0000-0000-000000000009',
  'a1000000-0000-0000-0000-000000000001',
  'IT Security',
  'ITSEC',
  'd1000000-0000-0000-0000-000000000008',
  'IT.ITSEC',
  2,
  'Cybersecurity and information security',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- =====================================================
-- EMPLOYEES (10 total)
-- =====================================================
--
-- REPLACE THESE PLACEHOLDER user_id UUIDs WITH REAL AUTH USER IDs:
--   SELECT id, email FROM auth.users;
--
-- =====================================================

-- 1. System Administrator (superuser)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000008', -- IT Department
  'Michael',
  'Chen',
  'michael.chen@acmehealthcare.test',
  'Chief Information Officer',
  'admin',
  'active',
  NOW() - INTERVAL '5 years',
  NOW() - INTERVAL '5 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 2. Privacy Officer (Emergency Department)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000002', -- Emergency Department
  'Jane',
  'Smith',
  'jane.smith@acmehealthcare.test',
  'Emergency Department Privacy Officer',
  'privacy_officer',
  'active',
  NOW() - INTERVAL '3 years',
  NOW() - INTERVAL '3 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 3. Privacy Officer (IT Security)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000009', -- IT Security
  'Robert',
  'Williams',
  'robert.williams@acmehealthcare.test',
  'Information Security Officer',
  'privacy_officer',
  'active',
  NOW() - INTERVAL '4 years',
  NOW() - INTERVAL '4 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 4. Department Manager (Emergency Department)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000002', -- Emergency Department
  'Sarah',
  'Johnson',
  'sarah.johnson@acmehealthcare.test',
  'Emergency Department Manager',
  'department_manager',
  'active',
  NOW() - INTERVAL '7 years',
  NOW() - INTERVAL '7 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 5. Employee (Triage Unit - Registered Nurse)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000005', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000003', -- Triage Unit
  'John',
  'Doe',
  'john.doe@acmehealthcare.test',
  'Registered Nurse',
  'employee',
  'active',
  NOW() - INTERVAL '2 years',
  NOW() - INTERVAL '2 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 6. Employee (Surgical Services - Surgeon)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000006', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000004', -- Surgical Services
  'Emily',
  'Davis',
  'emily.davis@acmehealthcare.test',
  'General Surgeon',
  'employee',
  'active',
  NOW() - INTERVAL '6 years',
  NOW() - INTERVAL '6 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 7. Employee (Billing Department - Billing Specialist)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000007', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000006', -- Billing Department
  'David',
  'Martinez',
  'david.martinez@acmehealthcare.test',
  'Medical Billing Specialist',
  'employee',
  'active',
  NOW() - INTERVAL '1 year',
  NOW() - INTERVAL '1 year',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 8. Employee (Human Resources - HR Coordinator)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000008', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000007', -- Human Resources
  'Lisa',
  'Anderson',
  'lisa.anderson@acmehealthcare.test',
  'HR Coordinator',
  'employee',
  'active',
  NOW() - INTERVAL '3 years',
  NOW() - INTERVAL '3 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 9. Employee (IT Security - Security Analyst)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000009', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000009', -- IT Security
  'James',
  'Taylor',
  'james.taylor@acmehealthcare.test',
  'Security Analyst',
  'employee',
  'active',
  NOW() - INTERVAL '2 years',
  NOW() - INTERVAL '2 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- 10. Employee (Emergency Department - Paramedic)
INSERT INTO employees (
  id,
  user_id,
  organization_id,
  department_id,
  first_name,
  last_name,
  email,
  job_title,
  role,
  status,
  hire_date,
  created_at,
  updated_at
) VALUES (
  'e1000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010', -- REPLACE WITH REAL AUTH USER ID
  'a1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000002', -- Emergency Department
  'Jennifer',
  'Brown',
  'jennifer.brown@acmehealthcare.test',
  'Paramedic',
  'employee',
  'active',
  NOW() - INTERVAL '4 years',
  NOW() - INTERVAL '4 years',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  role = EXCLUDED.role;

-- =====================================================
-- POLICY BUNDLES
-- =====================================================

-- Bundle 1: HIPAA Basics
INSERT INTO policy_bundles (
  id,
  organization_id,
  name,
  description,
  policy_ids,
  due_days,
  created_at,
  updated_at
) VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'HIPAA Basics',
  'Core HIPAA training for all employees',
  ARRAY['hipaa-privacy', 'hipaa-security', 'breach-notification'],
  30,
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  policy_ids = EXCLUDED.policy_ids,
  due_days = EXCLUDED.due_days;

-- Bundle 2: Clinical Staff Required
INSERT INTO policy_bundles (
  id,
  organization_id,
  name,
  description,
  policy_ids,
  due_days,
  created_at,
  updated_at
) VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'Clinical Staff Required',
  'Required for all clinical staff',
  ARRAY['hipaa-privacy', 'hipaa-security', 'patient-safety', 'infection-control'],
  14,
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  policy_ids = EXCLUDED.policy_ids,
  due_days = EXCLUDED.due_days;

-- Bundle 3: IT Security Training
INSERT INTO policy_bundles (
  id,
  organization_id,
  name,
  description,
  policy_ids,
  due_days,
  created_at,
  updated_at
) VALUES (
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'IT Security Training',
  'Required for IT department',
  ARRAY['hipaa-security', 'cybersecurity', 'data-breach-response'],
  30,
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  policy_ids = EXCLUDED.policy_ids,
  due_days = EXCLUDED.due_days;

-- =====================================================
-- POLICY ASSIGNMENTS
-- =====================================================

-- ===== COMPLETED ASSIGNMENTS =====

-- Jane Smith (Privacy Officer, ED) - completed all HIPAA Basics
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  completed_at,
  created_at,
  updated_at
) VALUES
(
  'pa000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000002', -- Jane Smith
  'hipaa-privacy',
  'e1000000-0000-0000-0000-000000000001', -- Michael Chen (admin)
  NOW() - INTERVAL '16 days',
  NOW() + INTERVAL '14 days',
  'completed',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '2 days'
),
(
  'pa000000-0000-0000-0000-000000000002',
  'e1000000-0000-0000-0000-000000000002', -- Jane Smith
  'hipaa-security',
  'e1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '16 days',
  NOW() + INTERVAL '14 days',
  'completed',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '3 days'
),
(
  'pa000000-0000-0000-0000-000000000003',
  'e1000000-0000-0000-0000-000000000002', -- Jane Smith
  'breach-notification',
  'e1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '16 days',
  NOW() + INTERVAL '14 days',
  'completed',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  completed_at = EXCLUDED.completed_at;

-- John Doe (Triage Nurse) - completed HIPAA Privacy only
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  completed_at,
  created_at,
  updated_at
) VALUES (
  'pa000000-0000-0000-0000-000000000004',
  'e1000000-0000-0000-0000-000000000005', -- John Doe
  'hipaa-privacy',
  'e1000000-0000-0000-0000-000000000002', -- Jane Smith (privacy officer)
  NOW() - INTERVAL '9 days',
  NOW() + INTERVAL '5 days',
  'completed',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  completed_at = EXCLUDED.completed_at;

-- ===== PENDING ASSIGNMENTS =====

-- Sarah Johnson (ED Manager) - pending HIPAA Security
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  created_at,
  updated_at
) VALUES (
  'pa000000-0000-0000-0000-000000000005',
  'e1000000-0000-0000-0000-000000000004', -- Sarah Johnson
  'hipaa-security',
  'e1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '11 days',
  'assigned',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- Emily Davis (Surgeon) - pending multiple policies
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  created_at,
  updated_at
) VALUES
(
  'pa000000-0000-0000-0000-000000000006',
  'e1000000-0000-0000-0000-000000000006', -- Emily Davis
  'hipaa-privacy',
  'e1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '9 days',
  'assigned',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  'pa000000-0000-0000-0000-000000000007',
  'e1000000-0000-0000-0000-000000000006', -- Emily Davis
  'patient-safety',
  'e1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '9 days',
  'assigned',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- Lisa Anderson (HR) - pending HIPAA Basics
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  created_at,
  updated_at
) VALUES (
  'pa000000-0000-0000-0000-000000000008',
  'e1000000-0000-0000-0000-000000000008', -- Lisa Anderson
  'hipaa-privacy',
  'e1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '23 days',
  'assigned',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- ===== OVERDUE ASSIGNMENTS =====

-- David Martinez (Billing) - overdue HIPAA Security
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  created_at,
  updated_at
) VALUES (
  'pa000000-0000-0000-0000-000000000009',
  'e1000000-0000-0000-0000-000000000007', -- David Martinez
  'hipaa-security',
  'e1000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '5 days', -- Due 5 days ago
  'assigned',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '35 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- James Taylor (IT Security) - overdue cybersecurity training
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  created_at,
  updated_at
) VALUES (
  'pa000000-0000-0000-0000-000000000010',
  'e1000000-0000-0000-0000-000000000009', -- James Taylor
  'cybersecurity',
  'e1000000-0000-0000-0000-000000000003', -- Robert Williams (privacy officer)
  NOW() - INTERVAL '42 days',
  NOW() - INTERVAL '12 days', -- Due 12 days ago
  'assigned',
  NOW() - INTERVAL '42 days',
  NOW() - INTERVAL '42 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- Jennifer Brown (Paramedic) - overdue patient-safety
INSERT INTO employee_policy_assignments (
  id,
  employee_id,
  policy_id,
  assigned_by,
  assigned_at,
  due_at,
  status,
  created_at,
  updated_at
) VALUES (
  'pa000000-0000-0000-0000-000000000011',
  'e1000000-0000-0000-0000-000000000010', -- Jennifer Brown
  'patient-safety',
  'e1000000-0000-0000-0000-000000000004', -- Sarah Johnson (dept manager)
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '4 days', -- Due 4 days ago
  'assigned',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify seed data:
--
-- SELECT COUNT(*) FROM organizations;
-- SELECT COUNT(*) FROM departments;
-- SELECT COUNT(*) FROM employees;
-- SELECT COUNT(*) FROM policy_bundles;
-- SELECT COUNT(*) FROM employee_policy_assignments;
--
-- -- Check compliance rates:
-- SELECT
--   status,
--   COUNT(*) as count,
--   ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employee_policy_assignments), 2) as percentage
-- FROM employee_policy_assignments
-- GROUP BY status;
--
-- -- Check overdue assignments:
-- SELECT
--   e.first_name || ' ' || e.last_name as employee,
--   epa.policy_id,
--   epa.due_at,
--   NOW() - epa.due_at as days_overdue
-- FROM employee_policy_assignments epa
-- JOIN employees e ON e.id = epa.employee_id
-- WHERE epa.status = 'assigned' AND epa.due_at < NOW()
-- ORDER BY epa.due_at;
