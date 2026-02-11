# Database Visual Reference Guide
## Quick Visual Reference for Employee Management System

**Created:** February 9, 2026
**Purpose:** Visual diagrams and quick-reference tables

---

## TABLE OF CONTENTS
1. [Data Model Diagram](#data-model-diagram)
2. [RLS Policy Diagram](#rls-policy-diagram)
3. [Data Flow Diagram](#data-flow-diagram)
4. [Hierarchy Examples](#hierarchy-examples)
5. [Permission Model](#permission-model)
6. [Audit Trail Flow](#audit-trail-flow)
7. [API Endpoint Map](#api-endpoint-map)
8. [Quick Field Reference](#quick-field-reference)

---

## DATA MODEL DIAGRAM

### Complete Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ORGANIZATIONS                                   │
│                    (Multi-Tenant Root)                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id | name | slug | subscription_tier | status | metadata | ...  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│          │                                                               │
└──────────┼───────────────────────────────────────────────────────────────┘
           │
    ┌──────┴──────────────────────────────────────────────┐
    │                                                      │
    ▼                                                      ▼
┌─────────────────────────┐                  ┌──────────────────────────┐
│    DEPARTMENTS          │                  │  ORGANIZATION_SETTINGS   │
│  ┌──────────────────┐   │                  │  ┌────────────────────┐  │
│  │ id               │   │                  │  │ org_id (FK)        │  │
│  │ organization_id  │◄──┼──┐               │  │ max_departments    │  │
│  │ name             │   │  │               │  │ max_employees      │  │
│  │ parent_dept_id◄──┼───┘  │               │  │ enable_hierarchy   │  │
│  │ (SELF-REFERENCE) │      │ 1:N          │  │ enable_teams       │  │
│  │ manager_id────►  │      │               │  │ enable_permissions │  │
│  │ budget           │      │               │  │ enable_audit       │  │
│  │ status           │      │               │  │ custom_fields      │  │
│  └──────────────────┘      │               │  │ retention_days     │  │
│        │                   │               │  └────────────────────┘  │
│        │ (children)        │               └──────────────────────────┘
│        └───────────────────┘
│
│ RECURSIVE HIERARCHY:
│ Company
│ ├─ Executive (parent: Company)
│ │  ├─ CEO Office (parent: Executive)
│ │  └─ Board (parent: Executive)
│ ├─ Engineering (parent: Company)
│ │  ├─ Backend (parent: Engineering)
│ │  │  ├─ Database (parent: Backend)
│ │  │  └─ API (parent: Backend)
│ │  └─ Frontend (parent: Engineering)
│ └─ Operations (parent: Company)
│
└────────────────────────────────────────────────────┐
                                                     │
                                    ┌─ UNLIMITED DEPTH (no limit)
                                    │ Support any org structure
                                    └─ Queried via get_department_tree()
```

### Employees & Roles

```
┌──────────────────────────────────┐
│        EMPLOYEES                 │      Extends
│  ┌──────────────────────────┐    │      auth.users
│  │ id (UUID)────────────────┼────┼──────────────┐
│  │ organization_id (FK)──┐  │    │              │
│  │ department_id (FK)────┼──┼──┐ │         ┌────▼──────┐
│  │ manager_id (FK) ◄─────┼──┤  │ │         │ auth.users │
│  │ (SELF-REFERENCE)      │  │  │ │         └────┬───────┘
│  │ employee_id           │  │  │ │              │
│  │ position_title        │  │  │ │    (FK: id)─┘
│  │ employment_status     │  │  │ │
│  │ employment_type       │  │  │ │
│  │ start_date            │  │  │ │
│  │ end_date              │  │  │ │
│  │ salary_grade          │  │  │ │
│  │ location              │  │  │ │
│  │ phone, mobile_phone   │  │  │ │
│  │ emergency_contact     │  │  │ │
│  │ skills (array)        │  │  │ │
│  │ custom_fields (JSONB) │  │  │ │
│  └──────────────────────────┘  │ │
│        │                        │ │
│        │ REPORTING HIERARCHY:   │ │
│        │                        │ │
│        └─► CEO                  │ │
│            ├─► CTO (mgr: CEO)   │ │
│            │   ├─► Backend Lead │ │
│            │   │   ├─► Eng 1    │ │
│            │   │   └─► Eng 2    │ │
│            │   └─► Frontend Lead│ │
│            └─► CFO (mgr: CEO)   │ │
│                └─► Finance Mgr  │ │
│                                 │ │
│ RECURSIVE: walk up manager_id   │ │
│           to find reporting chain
│                                 │ │
└─────────────────┬──────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
     ┌─────────┐ ┌──────────────┐ ┌──────────────────┐
     │ ROLES   │ │ EMPLOYEE_    │ │ EMPLOYEE_        │
     │         │ │ ROLES        │ │ PERMISSIONS      │
     │ id      │ │              │ │                  │
     │ org_id  │ │ id           │ │ id               │
     │ name    │ │ employee_id  │ │ employee_id      │
     │ perms   │ │ role_id──────┼─┤ resource         │
     │ system? │ │ expires_at   │ │ action           │
     │         │ │ granted_by   │ │ expires_at       │
     │         │ │              │ │ granted_by       │
     │ Example:│ │              │ │                  │
     │ - Admin │ │ Example:     │ │ Example:         │
     │ - Mgr   │ │ emp_id: E1   │ │ emp_id: E1       │
     │ - Empl  │ │ role_id: ADM │ │ resource: emps   │
     │         │ │              │ │ action: create   │
     └─────────┘ │ role_id: MGR │ │                  │
                 │              │ │ (Override role   │
                 └──────────────┘ │ permissions)     │
                                  │                  │
                                  └──────────────────┘
```

### Teams

```
┌──────────────────────────┐
│   TEAM_MEMBERS           │
│  ┌────────────────────┐  │
│  │ id                 │  │
│  │ organization_id    │  │
│  │ name               │  │
│  │ lead_id (FK) ───┐  │  │
│  │ employee_count │  │  │
│  └────────────────┼──┘  │
│        │          │      │
│        │ N:M      │      │
│        │          │      │
│        ▼          │      │
│  ┌──────────────────┐   │
│  │ TEAM_ASSIGNMENTS │   │
│  │ ┌──────────────┐ │   │
│  │ │ id           │ │   │
│  │ │ team_id (FK) │ │   │
│  │ │ employee_id  │ │   │
│  │ │ role_in_team │ │   │
│  │ │ assigned_at  │ │   │
│  │ └──────────────┘ │   │
│  └──────────────────┘   │
│                          │
│  Cross-Department Grouping:
│  Team: "Product Squad"
│  ├─ Backend Engineer (from Eng Dept)
│  ├─ Frontend Engineer (from Eng Dept)
│  ├─ Product Manager (from Product)
│  ├─ Designer (from Design)
│  └─ QA (from QA Dept)
│                          │
└──────────────────────────┘
```

### Audit Trail

```
┌─────────────────────────────────────┐
│     AUDIT_EVENTS                    │
│  ┌─────────────────────────────┐    │
│  │ id                          │    │
│  │ organization_id (FK)        │    │
│  │ employee_id (FK) optional   │    │
│  │ action                      │    │ Examples:
│  │ resource_type               │    │ - action: "create"
│  │ resource_id                 │    │ - resource_type: "employees"
│  │ old_values (JSONB snapshot) │    │ - old_values: null (new record)
│  │ new_values (JSONB snapshot) │    │ - new_values: { ...employee data }
│  │ ip_address                  │    │
│  │ user_agent                  │    │ Or:
│  │ created_at                  │    │ - action: "update"
│  │ ...                         │    │ - resource_type: "employees"
│  └─────────────────────────────┘    │ - old_values: { status: "active" }
│                                     │ - new_values: { status: "inactive" }
│  Complete change history with
│  before/after snapshots for
│  compliance & troubleshooting
│
└─────────────────────────────────────┘
```

---

## RLS POLICY DIAGRAM

### How Organization Isolation Works

```
┌─────────────────────────────────────────────────────────────┐
│                   ROW LEVEL SECURITY (RLS)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User A (auth.uid = user-a-uuid)                           │
│  belongs to Organization A (org-a-uuid)                     │
│  Employee record: emp-a-uuid                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Query: SELECT * FROM employees WHERE org_id = ?      │   │
│  │                                                       │   │
│  │ RLS Filter Applied:                                  │   │
│  │ USING (                                              │   │
│  │   EXISTS (                                           │   │
│  │     SELECT 1 FROM employees                          │   │
│  │     WHERE employees.organization_id = org-a-uuid    │   │
│  │     AND employees.id = auth.uid()                   │   │
│  │   )                                                  │   │
│  │ )                                                    │   │
│  │                                                       │   │
│  │ ✅ Can see: employees.organization_id = org-a-uuid   │   │
│  │ ❌ Cannot see: employees.organization_id = org-b-uuid│   │
│  │ ❌ Cannot see: employees.organization_id = org-c-uuid│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  User B (auth.uid = user-b-uuid)                           │
│  belongs to Organization B (org-b-uuid)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Query: SELECT * FROM employees                        │   │
│  │                                                       │   │
│  │ RLS Filter Applied (same policy!)                    │   │
│  │                                                       │   │
│  │ ❌ Cannot see: employees.organization_id = org-a-uuid│   │
│  │ ✅ Can see: employees.organization_id = org-b-uuid   │   │
│  │ ❌ Cannot see: employees.organization_id = org-c-uuid│   │
│  │                                                       │   │
│  │ Complete isolation at database level!                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Policy Application Points

```
All Tables with RLS:
├─ organizations           (user sees only their org)
├─ departments             (filtered by organization_id)
├─ employees               (filtered by organization_id)
├─ roles                   (filtered by organization_id)
├─ employee_roles          (via employee.organization_id)
├─ team_members            (filtered by organization_id)
├─ team_assignments        (via team.organization_id)
├─ employee_permissions    (via employee.organization_id)
├─ organization_settings   (filtered by organization_id)
└─ audit_events            (filtered by organization_id)

✅ Enforced at DATABASE level, not app level
✅ Zero possibility of cross-org data leakage
✅ Impossible to bypass with SQL
```

---

## DATA FLOW DIAGRAM

### Employee Creation Flow

```
User clicks "Create Employee"
     │
     ▼
Frontend Form
(CreateEmployeeForm.tsx)
     │
     ├─ Validates form data
     ├─ Collects:
     │  - employee_id: "EMP-001"
     │  - position_title: "Engineer"
     │  - department_id: "dept-uuid"
     │  - manager_id: "mgr-uuid" (optional)
     │  - employment_type: "full_time"
     │  - start_date: "2026-02-09"
     │
     ▼
POST /api/employees
     │
     ├─ Get auth.uid()
     ├─ Verify user exists in employees
     │  (Get user's organization_id from emp record)
     │
     ├─ Check Permission:
     │  await checkPermission(user.id, 'employees', 'create')
     │
     ├─ IF denied → Return 403 Forbidden
     │
     ├─ IF allowed → Continue
     │
     ▼
Database: INSERT employees
     │
     ├─ RLS: Verify auth.uid() is in org
     ├─ Constraints checked:
     │  - department_id exists in same org
     │  - manager_id valid (if provided)
     │  - employee_id unique per org
     │
     ▼
Database: INSERT audit_events
     │
     ├─ Log: action: "create"
     ├─ Log: resource_type: "employees"
     ├─ Log: new_values: {...employee data}
     ├─ Log: ip_address, user_agent
     │
     ▼
Response: 200 OK
{
  "id": "emp-uuid",
  "employee_id": "EMP-001",
  "organization_id": "org-uuid",
  ...
}
     │
     ▼
Frontend: Show success
Update local cache
```

---

## HIERARCHY EXAMPLES

### Department Hierarchy (Unlimited Depth)

```
INSERT INTO departments (organization_id, name, parent_id)
VALUES
('org-1', 'Company', NULL);                          -- Level 0

INSERT INTO departments (organization_id, name, parent_id)
VALUES
('org-1', 'Executive', (SELECT id FROM departments WHERE name='Company')),
('org-1', 'Engineering', (SELECT id FROM departments WHERE name='Company')),
('org-1', 'Operations', (SELECT id FROM departments WHERE name='Company'));  -- Level 1

INSERT INTO departments (organization_id, name, parent_id)
VALUES
('org-1', 'Backend', (SELECT id FROM departments WHERE name='Engineering')),
('org-1', 'Frontend', (SELECT id FROM departments WHERE name='Engineering'));  -- Level 2

INSERT INTO departments (organization_id, name, parent_id)
VALUES
('org-1', 'Database', (SELECT id FROM departments WHERE name='Backend')),
('org-1', 'API', (SELECT id FROM departments WHERE name='Backend'));  -- Level 3

INSERT INTO departments (organization_id, name, parent_id)
VALUES
('org-1', 'PostgreSQL Team', (SELECT id FROM departments WHERE name='Database'));  -- Level 4

-- Can go infinitely deep: Company > Executive > VP Engineering > Senior Manager > Team Lead > Sr Engineer > ...
-- Query via: SELECT * FROM get_department_tree('org-1');
```

### Reporting Hierarchy (Unlimited Depth)

```
INSERT INTO employees (id, org_id, dept_id, manager_id, employee_id, ...)
VALUES
('ceo-uuid', 'org-1', 'exec-uuid', NULL, 'EMP-001', ...);                    -- CEO (no manager)

('cto-uuid', 'org-1', 'eng-uuid', 'ceo-uuid', 'EMP-002', ...);               -- CTO (reports to CEO)

('backend-lead-uuid', 'org-1', 'backend-uuid', 'cto-uuid', 'EMP-003', ...);  -- Backend Lead (reports to CTO)

('engineer1-uuid', 'org-1', 'backend-uuid', 'backend-lead-uuid', 'EMP-004', ...);  -- Engineer (reports to Backend Lead)

('engineer2-uuid', 'org-1', 'backend-uuid', 'backend-lead-uuid', 'EMP-005', ...);  -- Engineer (reports to Backend Lead)

-- Reporting chain:
-- Engineer1 -> Backend Lead -> CTO -> CEO
--
-- Query via: SELECT * FROM get_reporting_chain('engineer1-uuid');
-- Result:
-- ├─ engineer1-uuid (depth 0)
-- ├─ backend-lead-uuid (depth 1)
-- ├─ cto-uuid (depth 2)
-- └─ ceo-uuid (depth 3)
```

---

## PERMISSION MODEL

### Role-Based Access Control (RBAC)

```
Organization: Acme Corp

ROLES (Organization-level):
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Administrator │     │   Manager    │      │   Employee   │
├──────────────┤      ├──────────────┤      ├──────────────┤
│ Permissions: │      │ Permissions: │      │ Permissions: │
│              │      │              │      │              │
│ - *          │      │ - view_emps  │      │ - view_own   │
│ (all)        │      │ - manage_own │      │ (read self)  │
│              │      │ - view_team  │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
       ▲                    ▲                     ▲
       │                    │                     │
       │ assigned           │ assigned            │ assigned
       │ to                 │ to                  │ to
       │                    │                     │
   ┌───┴──────────────┬────┴──────────┬──────────┴────┐
   │                  │               │               │
┌──┴──┐          ┌────┴──┐      ┌─────┴─┐        ┌───┴──┐
│ CEO │          │ Eng   │      │ HR    │        │  Eng │
│ 001 │          │ Lead  │      │ Mgr   │        │ 002  │
└──────          └───────┘      └───────┘        └──────┘
   │                │                  │
   │                │                  │
   └────┬───────────┴──────────┬───────┘
        │ PLUS                  │
        │ direct overrides      │
        │                       │
   ┌────▼────────────────┐   ┌─┴──────────────┐
   │ Direct Permissions: │   │ Direct Perms:  │
   │ employee_id: CEO    │   │ emp_id: HR Mgr │
   │ resource: reports   │   │ resource: audit │
   │ action: view_all    │   │ action: view   │
   │ expires: null       │   │ expires: null  │
   └─────────────────────┘   └────────────────┘
```

### Permission Check Logic

```
┌─ User tries to access resource
│
├─ Check 1: Direct Permissions
│  SELECT * FROM employee_permissions
│  WHERE employee_id = ? AND resource = ? AND action = ?
│  AND (expires_at IS NULL OR expires_at > NOW())
│  → Found? ✅ ALLOW
│
├─ Check 2: Role Permissions
│  SELECT r.permissions FROM employee_roles er
│  JOIN roles r ON er.role_id = r.id
│  WHERE er.employee_id = ?
│  AND (er.expires_at IS NULL OR er.expires_at > NOW())
│  → Permissions array contains action? ✅ ALLOW
│
└─ No match? ❌ DENY

Result: has_employee_permission(emp_id, resource, action) → BOOLEAN
```

---

## AUDIT TRAIL FLOW

### What Gets Logged

```
Every change to employee management tables:

EVENT: Employee Created
├─ Organization ID: org-1
├─ Employee ID: emp-1
├─ Action: CREATE
├─ Resource Type: employees
├─ Resource ID: emp-1
├─ Old Values: NULL (new record)
├─ New Values: {
│  ├─ id: "emp-1"
│  ├─ org_id: "org-1"
│  ├─ dept_id: "dept-1"
│  ├─ employee_id: "EMP-001"
│  ├─ position_title: "Engineer"
│  ├─ ...all fields
│  └─ created_at: "2026-02-09T..."
│  }
├─ IP Address: 192.168.1.1
├─ User Agent: Mozilla/5.0...
└─ Created At: 2026-02-09T12:34:56Z

EVENT: Employee Department Changed
├─ Organization ID: org-1
├─ Employee ID: emp-1
├─ Action: UPDATE
├─ Resource Type: employees
├─ Resource ID: emp-1
├─ Old Values: {
│  └─ department_id: "dept-1"
│  }
├─ New Values: {
│  └─ department_id: "dept-2"
│  }
├─ IP Address: 192.168.1.1
├─ User Agent: Mozilla/5.0...
└─ Created At: 2026-02-09T14:22:10Z

EVENT: Role Assigned
├─ Organization ID: org-1
├─ Employee ID: emp-1
├─ Action: CREATE
├─ Resource Type: employee_roles
├─ Resource ID: role-assign-1
├─ Old Values: NULL
├─ New Values: {
│  ├─ employee_id: "emp-1"
│  ├─ role_id: "role-manager"
│  ├─ expires_at: "2027-02-09"
│  └─ granted_by: "emp-admin"
│  }
├─ IP Address: 192.168.1.1
├─ User Agent: Mozilla/5.0...
└─ Created At: 2026-02-09T15:45:20Z
```

### Audit Query Examples

```sql
-- Find all changes to one employee
SELECT * FROM audit_events
WHERE organization_id = 'org-1' AND resource_id = 'emp-uuid'
ORDER BY created_at DESC;

-- Find who changed what
SELECT employee_id, action, resource_type, new_values, created_at
FROM audit_events
WHERE organization_id = 'org-1'
AND resource_type = 'employees'
ORDER BY created_at DESC
LIMIT 20;

-- Compliance: Show who has access
SELECT * FROM audit_events
WHERE organization_id = 'org-1'
AND resource_type = 'employee_roles'
AND action = 'CREATE'
AND created_at > NOW() - INTERVAL '90 days'
ORDER BY created_at;

-- Timeline of changes to department
SELECT created_at, action, old_values, new_values
FROM audit_events
WHERE organization_id = 'org-1'
AND resource_type = 'departments'
AND resource_id = 'dept-uuid'
ORDER BY created_at;
```

---

## API ENDPOINT MAP

### Endpoints to Implement

```
ORGANIZATIONS
├─ GET    /api/organizations/me          → Get current user's org
├─ GET    /api/organizations/:id         → Get org details
├─ POST   /api/organizations             → Create org (admin)
└─ PATCH  /api/organizations/:id         → Update org settings

DEPARTMENTS
├─ GET    /api/departments               → List all (flat)
├─ GET    /api/departments/tree          → Get hierarchy tree
├─ GET    /api/departments/:id           → Get one department
├─ POST   /api/departments               → Create department
├─ PATCH  /api/departments/:id           → Update department
└─ DELETE /api/departments/:id           → Delete department

EMPLOYEES
├─ GET    /api/employees                 → List employees
├─ GET    /api/employees/:id             → Get one employee
├─ GET    /api/employees/:id/hierarchy   → Get reporting chain
├─ POST   /api/employees                 → Create employee
├─ PATCH  /api/employees/:id             → Update employee
├─ DELETE /api/employees/:id             → Soft delete (mark terminated)
└─ POST   /api/employees/:id/transfer    → Transfer to dept/manager

ROLES & PERMISSIONS
├─ GET    /api/roles                     → List roles
├─ GET    /api/roles/:id                 → Get role details
├─ POST   /api/roles                     → Create role
├─ PATCH  /api/roles/:id                 → Update role
├─ DELETE /api/roles/:id                 → Delete role
│
├─ POST   /api/employees/:id/roles       → Assign role to employee
├─ DELETE /api/employees/:id/roles/:rid  → Remove role
│
├─ POST   /api/employees/:id/permissions → Grant permission
├─ DELETE /api/employees/:id/permissions → Revoke permission
└─ GET    /api/employees/:id/permissions → Get employee permissions

TEAMS
├─ GET    /api/teams                     → List teams
├─ POST   /api/teams                     → Create team
├─ PATCH  /api/teams/:id                 → Update team
├─ DELETE /api/teams/:id                 → Delete team
│
├─ POST   /api/teams/:id/members         → Add member to team
└─ DELETE /api/teams/:id/members/:eid    → Remove member from team

AUDIT
├─ GET    /api/audit/events              → List audit events
├─ GET    /api/audit/employee/:id        → Activity for employee
└─ GET    /api/audit/resource/:type/:id  → Changes to resource

PERMISSIONS (Helper)
├─ GET    /api/permissions/check         → Check if user has permission
└─ GET    /api/permissions/my            → Get all my permissions
```

---

## QUICK FIELD REFERENCE

### employees table fields

```
id                  UUID        FK to auth.users (PK)
organization_id     UUID        FK to organizations
department_id       UUID        FK to departments
manager_id          UUID        FK to employees (can be NULL)
employee_id         TEXT        Unique per org (e.g., "EMP-001")
position_title      TEXT        Job title (required)
employment_status   ENUM        active|inactive|on_leave|terminated
employment_type     ENUM        full_time|part_time|contractor|temporary
start_date          DATE        First day of employment
end_date            DATE        Last day (NULL if still employed)
salary_grade        TEXT        E.g., "Grade 5"
location            TEXT        Office location
phone               TEXT        Office phone
mobile_phone        TEXT        Mobile phone
emergency_contact   JSONB       {name, phone, relationship}
skills              TEXT[]      ["Python", "JavaScript", "SQL"]
custom_fields       JSONB       Org-specific data
created_at          TIMESTAMP   Auto-set
updated_at          TIMESTAMP   Auto-updated
```

### departments table fields

```
id                  UUID        PK
organization_id     UUID        FK to organizations
name                TEXT        Department name
description         TEXT        Department description
parent_department_id UUID       FK to departments (NULL if root, else self-ref)
manager_id          UUID        FK to employees
budget              NUMERIC     Annual budget
status              ENUM        active|inactive
metadata            JSONB       Additional data
created_at          TIMESTAMP   Auto-set
updated_at          TIMESTAMP   Auto-updated
```

### roles table fields

```
id                  UUID        PK
organization_id     UUID        FK to organizations
name                TEXT        Role name (unique per org)
description         TEXT        Role description
permissions         TEXT[]      Permission array (e.g., ["view_employees"])
is_system           BOOLEAN     Cannot delete system roles
created_at          TIMESTAMP   Auto-set
updated_at          TIMESTAMP   Auto-updated
```

---

## PERFORMANCE INDEXES

### All Indexes Created

```sql
-- organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);

-- departments
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);
CREATE INDEX idx_departments_status ON departments(status);

-- employees
CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);
CREATE INDEX idx_employees_org_emp_id ON employees(organization_id, employee_id);

-- roles
CREATE INDEX idx_roles_organization_id ON roles(organization_id);

-- employee_roles
CREATE INDEX idx_employee_roles_employee_id ON employee_roles(employee_id);
CREATE INDEX idx_employee_roles_role_id ON employee_roles(role_id);
CREATE INDEX idx_employee_roles_expires_at ON employee_roles(expires_at);

-- team_members
CREATE INDEX idx_team_members_organization_id ON team_members(organization_id);
CREATE INDEX idx_team_members_lead_id ON team_members(lead_id);

-- team_assignments
CREATE INDEX idx_team_assignments_team_id ON team_assignments(team_id);
CREATE INDEX idx_team_assignments_employee_id ON team_assignments(employee_id);

-- employee_permissions
CREATE INDEX idx_employee_permissions_employee_id ON employee_permissions(employee_id);
CREATE INDEX idx_employee_permissions_resource ON employee_permissions(resource);
CREATE INDEX idx_employee_permissions_action ON employee_permissions(action);
CREATE INDEX idx_employee_permissions_expires ON employee_permissions(expires_at);

-- audit_events
CREATE INDEX idx_audit_events_organization_id ON audit_events(organization_id);
CREATE INDEX idx_audit_events_employee_id ON audit_events(employee_id);
CREATE INDEX idx_audit_events_resource_type ON audit_events(resource_type);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX idx_audit_events_action ON audit_events(action);
```

**Result:** Queries typically complete in <100ms even with large datasets

---

## QUICK DECISION TREE

### "I need to..."

**Get all employees in my organization**
```sql
SELECT * FROM employees
WHERE organization_id = (
  SELECT organization_id FROM employees WHERE id = auth.uid()
)
ORDER BY employee_id;
```

**Get the organizational hierarchy**
```sql
SELECT * FROM get_department_tree(org_id);
-- Returns hierarchical tree of all departments
```

**Find out who reports to me**
```sql
SELECT * FROM employees
WHERE manager_id = auth.uid()
ORDER BY employee_id;
```

**Find my boss and their boss**
```sql
SELECT * FROM get_reporting_chain(my_employee_id);
-- Returns everyone above me in hierarchy
```

**Check if user can create employees**
```sql
SELECT has_employee_permission(user_id, 'employees', 'create');
-- Returns: true or false
```

**Get all employees with their managers**
```sql
SELECT
  e.*,
  m.employee_id as manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
WHERE e.organization_id = org_id;
```

**List all changes to an employee**
```sql
SELECT action, old_values, new_values, created_at
FROM audit_events
WHERE resource_type = 'employees' AND resource_id = emp_id
ORDER BY created_at DESC;
```

---

## COMMON PATTERNS

### Pattern 1: Create Employee in Department

```typescript
// Frontend form collects:
const data = {
  organization_id: 'org-123',
  department_id: 'dept-456',
  employee_id: 'EMP-001',
  position_title: 'Engineer',
  employment_type: 'full_time',
  start_date: '2026-02-09'
}

// Post to API
fetch('/api/employees', {
  method: 'POST',
  body: JSON.stringify(data)
})

// API layer:
// 1. Verify auth.uid() exists
// 2. Check permission: checkPermission(uid, 'employees', 'create')
// 3. Insert to employees
// 4. Insert to audit_events (via trigger)
// 5. Return 200
```

### Pattern 2: Transfer Employee to Different Department

```typescript
const data = {
  department_id: 'new-dept-456'
}

fetch('/api/employees/emp-123', {
  method: 'PATCH',
  body: JSON.stringify(data)
})

// Audit shows: old_values: {dept_id: old}, new_values: {dept_id: new}
```

### Pattern 3: Assign Role to Employee

```typescript
const data = {
  role_id: 'role-manager-123',
  expires_at: '2027-02-09' // optional
}

fetch('/api/employees/emp-123/roles', {
  method: 'POST',
  body: JSON.stringify(data)
})

// Creates employee_roles record
// Audit logged
// User now inherits permissions from that role
```

### Pattern 4: Grant Specific Permission

```typescript
const data = {
  resource: 'reports',
  action: 'view_all',
  expires_at: null // permanent
}

fetch('/api/employees/emp-123/permissions', {
  method: 'POST',
  body: JSON.stringify(data)
})

// Creates employee_permissions record
// Can override role permissions
```

---

**End of Visual Reference**

For more details, see the full documentation:
- DATABASE_SCHEMA_ANALYSIS.md (detailed specs)
- EMPLOYEE_MANAGEMENT_IMPLEMENTATION_GUIDE.md (how to build)
- supabase/migrations/20260209_add_employee_management.sql (SQL)
