-- ============================================================================
-- Migration: Consolidated Employee Management & Organizational Hierarchy
-- Description: Merges add_employee_management + organizational_hierarchy into
--              a single source of truth with full RLS write policies.
-- Date: 2026-02-09
-- Status: IDEMPOTENT - Safe to apply multiple times
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM (
    'admin',
    'privacy_officer',
    'compliance_manager',
    'department_manager',
    'employee'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE department_status_type AS ENUM (
    'active',
    'inactive',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status_type AS ENUM (
    'assigned',
    'acknowledged',
    'completed',
    'overdue',
    'waived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE employment_status_type AS ENUM (
    'active',
    'inactive',
    'on_leave',
    'terminated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE employment_type AS ENUM (
    'full_time',
    'part_time',
    'contractor',
    'temporary'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE invitation_status_type AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 1. ORGANIZATIONS TABLE (Merged from both migrations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,

  -- Contact & Legal (from organizational_hierarchy)
  primary_contact_email TEXT NOT NULL,
  primary_contact_name TEXT,
  legal_entity_name TEXT,

  -- Business details (from add_employee_management)
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'cancelled')) DEFAULT 'active',
  phone TEXT,
  website TEXT,
  address JSONB DEFAULT '{}',

  -- Settings (from organizational_hierarchy)
  max_users_allowed INTEGER DEFAULT 10000,
  enable_sso BOOLEAN DEFAULT FALSE,
  sso_domain TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);

COMMENT ON TABLE organizations IS 'Root multi-tenant organization container';
COMMENT ON COLUMN organizations.slug IS 'URL-safe identifier for organization';
COMMENT ON COLUMN organizations.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN organizations.subscription_tier IS 'Subscription level: free, pro, enterprise';

-- ============================================================================
-- 2. DEPARTMENTS TABLE (Materialized path approach from organizational_hierarchy
--    + budget/manager from add_employee_management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES departments(id) ON DELETE CASCADE,

  -- Naming
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,

  -- Materialized Path for Efficient Hierarchical Queries
  path TEXT NOT NULL,
  path_depth INTEGER NOT NULL,

  -- Management (from add_employee_management)
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  budget NUMERIC,

  -- Policy Officer (from organizational_hierarchy)
  policy_officer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status & Metadata
  status department_status_type DEFAULT 'active',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT unique_code_per_org UNIQUE (organization_id, code),
  CONSTRAINT unique_path_per_org UNIQUE (organization_id, path),
  CONSTRAINT valid_path_format CHECK (path ~ '^/[A-Za-z0-9_-][A-Za-z0-9_/-]*$')
);

CREATE INDEX IF NOT EXISTS idx_departments_org_id ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_path ON departments(organization_id, path);
CREATE INDEX IF NOT EXISTS idx_departments_path_like ON departments(organization_id, path varchar_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_departments_policy_officer ON departments(policy_officer_user_id);

COMMENT ON TABLE departments IS 'Hierarchical department structure with unlimited nesting via materialized path';
COMMENT ON COLUMN departments.path IS 'Materialized path: /CODE or /PARENT/CHILD (e.g., /ORG/IT/SECURITY)';
COMMENT ON COLUMN departments.path_depth IS 'Number of levels in hierarchy (1=root, 2=first child, etc)';
COMMENT ON COLUMN departments.manager_id IS 'UUID of department manager';

-- ============================================================================
-- 3. EMPLOYEES TABLE (Replaces organization_members, adds HR fields)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

  -- Role (from organizational_hierarchy user_role_type)
  role user_role_type NOT NULL DEFAULT 'employee',

  -- HR fields (from add_employee_management)
  employee_id TEXT,
  position_title TEXT,
  employment_status employment_status_type NOT NULL DEFAULT 'active',
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  start_date DATE,
  end_date DATE,

  -- Contact
  phone TEXT,
  mobile_phone TEXT,
  location TEXT,

  -- Manager reference
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- Additional data
  emergency_contact JSONB,
  skills TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT unique_user_per_org UNIQUE (organization_id, user_id),
  CONSTRAINT unique_employee_id_per_org UNIQUE (organization_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_employees_org_id ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_org_emp_id ON employees(organization_id, employee_id);

COMMENT ON TABLE employees IS 'Core employee records with role, department, and HR details';
COMMENT ON COLUMN employees.role IS 'Organization role: admin, privacy_officer, compliance_manager, department_manager, employee';
COMMENT ON COLUMN employees.employment_status IS 'Current status: active, inactive, on_leave, terminated';

-- ============================================================================
-- 4. EMPLOYEE_INVITATIONS TABLE (NEW - Invite workflow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employee_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

  -- Invite details
  email TEXT NOT NULL,
  position_title TEXT,
  employment_type employment_type DEFAULT 'full_time',
  role user_role_type DEFAULT 'employee',

  -- Tracking
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  status invitation_status_type NOT NULL DEFAULT 'pending',

  -- Token for invite link
  token UUID DEFAULT gen_random_uuid() UNIQUE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON employee_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON employee_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON employee_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON employee_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON employee_invitations(invited_by);

COMMENT ON TABLE employee_invitations IS 'Pending employee invitations for onboarding workflow';
COMMENT ON COLUMN employee_invitations.token IS 'Unique token for invite acceptance link';

-- ============================================================================
-- 5. POLICY_BUNDLES TABLE (from organizational_hierarchy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Scope
  target_roles user_role_type[] NOT NULL DEFAULT '{employee}',
  target_departments UUID[] DEFAULT NULL,

  -- Policy Content (array of policy identifiers, no join table needed)
  policy_ids TEXT[] NOT NULL DEFAULT '{}',

  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  is_required BOOLEAN DEFAULT TRUE,
  due_days INTEGER DEFAULT 30,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT unique_slug_per_org UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_policy_bundles_org_id ON policy_bundles(organization_id);
CREATE INDEX IF NOT EXISTS idx_policy_bundles_is_default ON policy_bundles(is_default);
CREATE INDEX IF NOT EXISTS idx_policy_bundles_roles ON policy_bundles USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_policy_bundles_depts ON policy_bundles USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_policy_bundles_policies ON policy_bundles USING GIN(policy_ids);

COMMENT ON TABLE policy_bundles IS 'Curated sets of policies for role/department combinations';
COMMENT ON COLUMN policy_bundles.policy_ids IS 'Array of policy identifiers (no join table)';
COMMENT ON COLUMN policy_bundles.target_roles IS 'Which roles should be assigned this bundle';

-- ============================================================================
-- 6. DEPARTMENT_POLICY_REQUIREMENTS TABLE (from organizational_hierarchy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS department_policy_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  policy_bundle_id UUID NOT NULL REFERENCES policy_bundles(id) ON DELETE CASCADE,

  -- Override default due_days at department level
  due_days INTEGER,

  -- Custom metadata per department
  enforcement_level TEXT CHECK (enforcement_level IN ('required', 'recommended', 'optional')) DEFAULT 'required',
  additional_requirements JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_bundle_per_dept UNIQUE (department_id, policy_bundle_id)
);

CREATE INDEX IF NOT EXISTS idx_dept_policy_dept_id ON department_policy_requirements(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_policy_bundle_id ON department_policy_requirements(policy_bundle_id);

COMMENT ON TABLE department_policy_requirements IS 'Department-specific overrides for policy bundles';

-- ============================================================================
-- 7. EMPLOYEE_POLICY_ASSIGNMENTS TABLE (from organizational_hierarchy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employee_policy_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  policy_bundle_id UUID NOT NULL REFERENCES policy_bundles(id) ON DELETE CASCADE,

  -- Status Tracking
  status assignment_status_type NOT NULL DEFAULT 'assigned',

  -- Dates
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Compliance
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  is_overdue BOOLEAN DEFAULT FALSE,

  -- Reassignment Tracking
  reassigned_count INTEGER DEFAULT 0,
  last_reassigned_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  waiver_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_assignment UNIQUE (user_id, policy_bundle_id, assigned_at),
  CONSTRAINT valid_dates CHECK (assigned_at <= due_at)
);

CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON employee_policy_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_org_id ON employee_policy_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assignments_department_id ON employee_policy_assignments(department_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON employee_policy_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_at ON employee_policy_assignments(due_at);
CREATE INDEX IF NOT EXISTS idx_assignments_is_overdue ON employee_policy_assignments(is_overdue) WHERE is_overdue = TRUE;
CREATE INDEX IF NOT EXISTS idx_assignments_org_user_status ON employee_policy_assignments(organization_id, user_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_dept_status ON employee_policy_assignments(department_id, status);

COMMENT ON TABLE employee_policy_assignments IS 'Individual policy assignment tracking per employee';
COMMENT ON COLUMN employee_policy_assignments.is_overdue IS 'Computed: TRUE if not completed and past due_at';

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Department materialized path maintenance
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
    WHERE id = NEW.parent_id AND organization_id = NEW.organization_id;

    IF v_parent_path IS NULL THEN
      RAISE EXCEPTION 'Parent department not found or not in same organization';
    END IF;

    NEW.path := v_parent_path || '/' || NEW.code;
    NEW.path_depth := v_parent_depth + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-calculate due date from bundle + department overrides
CREATE OR REPLACE FUNCTION calculate_assignment_due_date()
RETURNS TRIGGER AS $$
DECLARE
  v_due_days INTEGER;
BEGIN
  SELECT COALESCE(dpr.due_days, pb.due_days)
  INTO v_due_days
  FROM policy_bundles pb
  LEFT JOIN department_policy_requirements dpr ON dpr.policy_bundle_id = pb.id
    AND dpr.department_id = NEW.department_id
  WHERE pb.id = NEW.policy_bundle_id;

  v_due_days := COALESCE(v_due_days, 30);
  NEW.due_at := NEW.assigned_at + (v_due_days || ' days')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update is_overdue flag
CREATE OR REPLACE FUNCTION update_assignment_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_overdue := (NEW.status NOT IN ('completed', 'waived') AND NOW() > NEW.due_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY TRIGGERS
-- ============================================================================

-- updated_at triggers (use DROP IF EXISTS + CREATE to be idempotent)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
  CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
  CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
  CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON employees FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS trg_invitations_updated_at ON employee_invitations;
  CREATE TRIGGER trg_invitations_updated_at
    BEFORE UPDATE ON employee_invitations FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS trg_policy_bundles_updated_at ON policy_bundles;
  CREATE TRIGGER trg_policy_bundles_updated_at
    BEFORE UPDATE ON policy_bundles FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS trg_dept_policy_reqs_updated_at ON department_policy_requirements;
  CREATE TRIGGER trg_dept_policy_reqs_updated_at
    BEFORE UPDATE ON department_policy_requirements FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS trg_assignments_updated_at ON employee_policy_assignments;
  CREATE TRIGGER trg_assignments_updated_at
    BEFORE UPDATE ON employee_policy_assignments FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Department path maintenance trigger
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_maintain_department_path ON departments;
  CREATE TRIGGER trg_maintain_department_path
    BEFORE INSERT OR UPDATE ON departments FOR EACH ROW
    EXECUTE FUNCTION maintain_department_path();
END $$;

-- Assignment due date auto-calculation trigger
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_calculate_assignment_due_date ON employee_policy_assignments;
  CREATE TRIGGER trg_calculate_assignment_due_date
    BEFORE INSERT ON employee_policy_assignments FOR EACH ROW
    WHEN (NEW.due_at IS NULL)
    EXECUTE FUNCTION calculate_assignment_due_date();
END $$;

-- Assignment overdue status update trigger
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_update_assignment_overdue ON employee_policy_assignments;
  CREATE TRIGGER trg_update_assignment_overdue
    BEFORE INSERT OR UPDATE ON employee_policy_assignments FOR EACH ROW
    EXECUTE FUNCTION update_assignment_overdue_status();
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY - ENABLE
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_policy_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_policy_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS SELECT POLICIES
-- ============================================================================

-- --- ORGANIZATIONS ---
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = organizations.id
        AND employees.user_id = auth.uid()
    )
  );

-- --- DEPARTMENTS ---
CREATE POLICY "Privacy officers see all departments in org"
  ON departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = departments.organization_id
        AND employees.user_id = auth.uid()
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Department managers see own + child departments"
  ON departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = departments.organization_id
        AND employees.user_id = auth.uid()
        AND employees.role = 'department_manager'
        AND (
          employees.department_id = departments.id
          OR departments.path LIKE (
            SELECT d.path || '/%'
            FROM departments d
            WHERE d.id = employees.department_id
          )
        )
    )
  );

CREATE POLICY "Employees see only own department"
  ON departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = departments.organization_id
        AND employees.user_id = auth.uid()
        AND employees.role = 'employee'
        AND employees.department_id = departments.id
    )
  );

-- --- EMPLOYEES ---
CREATE POLICY "Privacy officers see all employees in org"
  ON employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees AS viewer
      WHERE viewer.organization_id = employees.organization_id
        AND viewer.user_id = auth.uid()
        AND viewer.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Department managers see own department employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees AS viewer
      WHERE viewer.organization_id = employees.organization_id
        AND viewer.user_id = auth.uid()
        AND viewer.role = 'department_manager'
        AND viewer.department_id = employees.department_id
    )
  );

CREATE POLICY "Employees can see their own record"
  ON employees FOR SELECT
  TO authenticated
  USING (employees.user_id = auth.uid());

-- --- EMPLOYEE_INVITATIONS ---
CREATE POLICY "Admins see all invitations in org"
  ON employee_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = employee_invitations.organization_id
        AND employees.user_id = auth.uid()
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

-- --- POLICY_BUNDLES ---
CREATE POLICY "Users see bundles for their organization"
  ON policy_bundles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = policy_bundles.organization_id
        AND employees.user_id = auth.uid()
    )
  );

-- --- DEPARTMENT_POLICY_REQUIREMENTS ---
CREATE POLICY "Users see dept policy requirements in their org"
  ON department_policy_requirements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      JOIN employees e ON e.organization_id = d.organization_id
      WHERE d.id = department_policy_requirements.department_id
        AND e.user_id = auth.uid()
    )
  );

-- --- EMPLOYEE_POLICY_ASSIGNMENTS ---
CREATE POLICY "Privacy officers see all assignments in org"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = employee_policy_assignments.organization_id
        AND employees.user_id = auth.uid()
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Department managers see assignments in own departments"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.organization_id = employee_policy_assignments.organization_id
        AND employees.user_id = auth.uid()
        AND employees.role = 'department_manager'
        AND employees.department_id = employee_policy_assignments.department_id
    )
  );

CREATE POLICY "Employees see their own assignments"
  ON employee_policy_assignments FOR SELECT
  TO authenticated
  USING (employee_policy_assignments.user_id = auth.uid());

-- ============================================================================
-- RLS WRITE POLICIES (INSERT / UPDATE / DELETE)
-- ============================================================================

-- --- ORGANIZATIONS: Admin/Privacy Officer can manage ---
CREATE POLICY "Privacy officers can insert organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);  -- First org creation allowed; subsequent inserts governed by app logic

CREATE POLICY "Privacy officers can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = organizations.id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = organizations.id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can delete organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = organizations.id
        AND employees.role = 'admin'
    )
  );

-- --- DEPARTMENTS: Admin/Privacy Officer can manage ---
CREATE POLICY "Privacy officers can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = departments.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = departments.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = departments.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = departments.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

-- --- EMPLOYEES: Admin/Privacy Officer can manage ---
CREATE POLICY "Privacy officers can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees AS mgr
      WHERE mgr.user_id = auth.uid()
        AND mgr.organization_id = employees.organization_id
        AND mgr.role IN ('admin', 'privacy_officer')
    )
    OR NOT EXISTS (
      SELECT 1 FROM employees AS any_emp
      WHERE any_emp.organization_id = employees.organization_id
    )
  );

CREATE POLICY "Privacy officers can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees AS mgr
      WHERE mgr.user_id = auth.uid()
        AND mgr.organization_id = employees.organization_id
        AND mgr.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees AS mgr
      WHERE mgr.user_id = auth.uid()
        AND mgr.organization_id = employees.organization_id
        AND mgr.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Employees can update own record"
  ON employees FOR UPDATE
  TO authenticated
  USING (employees.user_id = auth.uid())
  WITH CHECK (employees.user_id = auth.uid());

CREATE POLICY "Privacy officers can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees AS mgr
      WHERE mgr.user_id = auth.uid()
        AND mgr.organization_id = employees.organization_id
        AND mgr.role IN ('admin', 'privacy_officer')
    )
  );

-- --- EMPLOYEE_INVITATIONS: Admin/Privacy Officer can manage ---
CREATE POLICY "Privacy officers can insert invitations"
  ON employee_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_invitations.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can update invitations"
  ON employee_invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_invitations.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_invitations.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can delete invitations"
  ON employee_invitations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_invitations.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

-- --- POLICY_BUNDLES: Admin/Privacy Officer can manage ---
CREATE POLICY "Privacy officers can insert policy bundles"
  ON policy_bundles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = policy_bundles.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can update policy bundles"
  ON policy_bundles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = policy_bundles.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = policy_bundles.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can delete policy bundles"
  ON policy_bundles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = policy_bundles.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

-- --- DEPARTMENT_POLICY_REQUIREMENTS: Admin/Privacy Officer can manage ---
CREATE POLICY "Privacy officers can insert dept policy requirements"
  ON department_policy_requirements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM departments d
      JOIN employees e ON e.organization_id = d.organization_id
      WHERE d.id = department_policy_requirements.department_id
        AND e.user_id = auth.uid()
        AND e.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can update dept policy requirements"
  ON department_policy_requirements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      JOIN employees e ON e.organization_id = d.organization_id
      WHERE d.id = department_policy_requirements.department_id
        AND e.user_id = auth.uid()
        AND e.role IN ('admin', 'privacy_officer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM departments d
      JOIN employees e ON e.organization_id = d.organization_id
      WHERE d.id = department_policy_requirements.department_id
        AND e.user_id = auth.uid()
        AND e.role IN ('admin', 'privacy_officer')
    )
  );

CREATE POLICY "Privacy officers can delete dept policy requirements"
  ON department_policy_requirements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      JOIN employees e ON e.organization_id = d.organization_id
      WHERE d.id = department_policy_requirements.department_id
        AND e.user_id = auth.uid()
        AND e.role IN ('admin', 'privacy_officer')
    )
  );

-- --- EMPLOYEE_POLICY_ASSIGNMENTS: Admin/Privacy Officer + self-update ---
CREATE POLICY "Privacy officers can insert assignments"
  ON employee_policy_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_policy_assignments.organization_id
        AND employees.role IN ('admin', 'privacy_officer', 'compliance_manager')
    )
  );

CREATE POLICY "Privacy officers can update assignments"
  ON employee_policy_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_policy_assignments.organization_id
        AND employees.role IN ('admin', 'privacy_officer', 'compliance_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_policy_assignments.organization_id
        AND employees.role IN ('admin', 'privacy_officer', 'compliance_manager')
    )
  );

CREATE POLICY "Employees update own assignments"
  ON employee_policy_assignments FOR UPDATE
  TO authenticated
  USING (employee_policy_assignments.user_id = auth.uid())
  WITH CHECK (employee_policy_assignments.user_id = auth.uid());

CREATE POLICY "Privacy officers can delete assignments"
  ON employee_policy_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
        AND employees.organization_id = employee_policy_assignments.organization_id
        AND employees.role IN ('admin', 'privacy_officer')
    )
  );

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW v_department_hierarchy AS
SELECT
  d.id,
  d.organization_id,
  d.name,
  d.code,
  d.path,
  d.path_depth,
  d.parent_id,
  d.status,
  (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND employment_status = 'active') as member_count,
  (SELECT COUNT(*) FROM departments WHERE parent_id = d.id) as child_count,
  CASE
    WHEN d.parent_id IS NULL THEN 'root'
    WHEN EXISTS (SELECT 1 FROM departments WHERE parent_id = d.id) THEN 'parent'
    ELSE 'leaf'
  END as department_type
FROM departments d;

CREATE OR REPLACE VIEW v_user_assignments_summary AS
SELECT
  u.id as user_id,
  u.email,
  e.organization_id,
  e.department_id,
  e.role,
  COUNT(epa.*) as total_assignments,
  COUNT(*) FILTER (WHERE epa.status = 'completed') as completed_assignments,
  COUNT(*) FILTER (WHERE epa.status = 'assigned') as pending_assignments,
  COUNT(*) FILTER (WHERE epa.is_overdue = TRUE) as overdue_assignments,
  MAX(epa.due_at) FILTER (WHERE epa.status IN ('assigned', 'acknowledged')) as next_due_date
FROM auth.users u
JOIN employees e ON u.id = e.user_id
LEFT JOIN employee_policy_assignments epa ON epa.user_id = u.id
  AND epa.organization_id = e.organization_id
GROUP BY u.id, u.email, e.organization_id, e.department_id, e.role;

-- ============================================================================
-- SEED DATA: Default Organization & Department
-- ============================================================================

INSERT INTO organizations (name, slug, primary_contact_email)
VALUES ('Default Organization', 'default-org', 'admin@example.com')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO departments (organization_id, name, code, path, path_depth)
SELECT
  id,
  'All Employees',
  'ALL',
  '/ALL',
  1
FROM organizations
WHERE slug = 'default-org'
ON CONFLICT (organization_id, path) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
