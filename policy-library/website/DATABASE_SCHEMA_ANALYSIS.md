# Supabase Database Schema Analysis
## Multi-Tenant Employee Management System - Gap Analysis

**Analysis Date:** February 9, 2026
**Project:** Policy Library Website with Employee Management Extensions

---

## EXECUTIVE SUMMARY

The current Supabase database has a **single-tenant, user-centric schema** focused on training and compliance tracking. It lacks:

1. **Organization/Tenant isolation** - No multi-tenant support
2. **Department hierarchy** - No department structure or trees
3. **Employee management** - No employee records beyond basic users
4. **Team/group management** - No team or group concepts
5. **Role-based access control** - No granular permission system
6. **Reporting structure** - No manager-employee relationships

---

## CURRENT DATABASE TABLES

### 1. **profiles** (User Base)
```
id (UUID) - Foreign key to auth.users
email (TEXT, UNIQUE)
full_name (TEXT)
organization (TEXT) - Single text field, not linked
role (TEXT) - Free-text role name
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**RLS Status:** Has basic RLS policies
**Issues:**
- `organization` is just text, not a foreign key
- No department field
- No manager_id relationship
- No employment status

### 2. **course_progress** (Training Tracking)
```
id (UUID)
user_id (UUID) -> auth.users
course_id (TEXT)
completed_lessons (TEXT[])
progress_percentage (INT)
started_at (TIMESTAMP)
completed_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**RLS Status:** Has RLS
**Use:** HIPAA training module tracking

### 3. **certificates** (Training Certificates)
```
id (UUID)
user_id (UUID) -> auth.users
course_id (TEXT)
certificate_url (TEXT)
issued_at (TIMESTAMP)
```
**RLS Status:** Has RLS

### 4. **remediation_plans** (Compliance Tracking)
```
id (UUID)
cfr_citation (TEXT) - CFR regulation citation
title (TEXT)
gap_description (TEXT)
policy_dependencies (TEXT[])
regulatory_requirements (JSONB)
status (ENUM: pending, in_progress, closeable, closed)
priority (ENUM: low, medium, high, critical)
auto_populated_fields (JSONB)
last_auto_update (TIMESTAMP)
estimated_completion_date (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**RLS Status:** All users can view/update (permissive policies)
**Indexes:** CFR citation, policy_dependencies (GIN), status

### 5. **policy_publications** (Policy History)
```
id (UUID)
policy_id (TEXT)
published_by (UUID) -> auth.users
published_at (TIMESTAMP)
policy_metadata (JSONB)
```
**RLS Status:** All users can view/create
**Indexes:** policy_id, published_at DESC

### 6. **audit_log** (Compliance Audit Trail)
```
id (UUID)
event_type (TEXT)
user_id (UUID) -> auth.users (nullable)
details (JSONB)
created_at (TIMESTAMP)
```
**RLS Status:** All users can view/insert
**Indexes:** event_type, user_id, created_at DESC, details (GIN)

---

## MISSING TABLES FOR EMPLOYEE MANAGEMENT

### Critical Tables Needed:

#### 1. **organizations** (Multi-tenancy)
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL UNIQUE
slug TEXT UNIQUE
subscription_tier ENUM (free, pro, enterprise)
status ENUM (active, suspended, cancelled)
logo_url TEXT
website TEXT
address JSONB
contact_email TEXT
phone TEXT
metadata JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```
**Purpose:** Multi-tenant isolation and organization-level data
**RLS:** Users can only access their own org's data

#### 2. **departments** (Hierarchical)
```sql
id UUID PRIMARY KEY
organization_id UUID NOT NULL -> organizations
name TEXT NOT NULL
description TEXT
parent_department_id UUID -> departments (self-reference for hierarchy)
manager_id UUID -> profiles (optional)
budget NUMERIC
status ENUM (active, inactive)
metadata JSONB
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE(organization_id, name)
```
**Purpose:** Unlimited department hierarchy with self-references
**Indexes:**
- organization_id
- parent_department_id
- manager_id
**RLS:** Users can see departments in their organization

#### 3. **employees** (Extended User Profile)
```sql
id UUID PRIMARY KEY -> auth.users
organization_id UUID NOT NULL -> organizations
department_id UUID NOT NULL -> departments
manager_id UUID -> profiles (nullable, self-reference)
employee_id TEXT (custom ID number)
position_title TEXT
employment_status ENUM (active, inactive, on_leave, terminated)
employment_type ENUM (full_time, part_time, contractor, temporary)
start_date DATE
end_date DATE (nullable)
salary_grade TEXT
location TEXT
phone TEXT
mobile_phone TEXT
emergency_contact JSONB
skills TEXT[]
custom_fields JSONB (for org-specific data)
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE(organization_id, employee_id)
FOREIGN KEY manager_id REFERENCES employees(id)
```
**Purpose:** Core employee records with hierarchy and details
**Indexes:**
- organization_id
- department_id
- manager_id
- employment_status
- employee_id

#### 4. **roles** (Fine-grained Permissions)
```sql
id UUID PRIMARY KEY
organization_id UUID NOT NULL -> organizations
name TEXT NOT NULL
description TEXT
permissions TEXT[] (JSON permissions)
is_system BOOLEAN (system roles vs custom)
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE(organization_id, name)
```
**Purpose:** Org-level role definitions
**RLS:** Users can only see roles in their org

#### 5. **employee_roles** (Role Assignment)
```sql
id UUID PRIMARY KEY
employee_id UUID NOT NULL -> employees
role_id UUID NOT NULL -> roles
granted_by UUID -> employees
granted_at TIMESTAMP
expires_at TIMESTAMP (nullable)
created_at TIMESTAMP

UNIQUE(employee_id, role_id)
```
**Purpose:** Many-to-many role assignment with audit trail

#### 6. **team_members** (Team Grouping)
```sql
id UUID PRIMARY KEY
organization_id UUID NOT NULL -> organizations
name TEXT NOT NULL
description TEXT
lead_id UUID -> employees
employee_count INT
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE(organization_id, name)
```
**Purpose:** Cross-departmental team grouping

#### 7. **team_assignments** (Team Membership)
```sql
id UUID PRIMARY KEY
team_id UUID NOT NULL -> team_members
employee_id UUID NOT NULL -> employees
role_in_team TEXT
assigned_at TIMESTAMP

UNIQUE(team_id, employee_id)
```
**Purpose:** Employee team memberships

#### 8. **employee_permissions** (Granular Access Control)
```sql
id UUID PRIMARY KEY
employee_id UUID NOT NULL -> employees
resource TEXT (e.g., "policies", "reports", "employee_management")
action TEXT (e.g., "view", "create", "edit", "delete")
granted_by UUID -> employees
granted_at TIMESTAMP
expires_at TIMESTAMP (nullable)
created_at TIMESTAMP

UNIQUE(employee_id, resource, action)
```
**Purpose:** Fine-grained permission overrides per employee

#### 9. **organization_settings** (Org Configuration)
```sql
id UUID PRIMARY KEY
organization_id UUID NOT NULL -> organizations UNIQUE
max_departments INT
max_employees INT
enable_hierarchy BOOLEAN
enable_teams BOOLEAN
enable_permissions BOOLEAN
custom_fields JSONB
audit_retention_days INT
created_at TIMESTAMP
updated_at TIMESTAMP
```
**Purpose:** Organization-level configuration

#### 10. **audit_events** (Enhanced Audit)
```sql
id UUID PRIMARY KEY
organization_id UUID NOT NULL -> organizations
employee_id UUID NULLABLE -> employees
action TEXT (not null)
resource_type TEXT (employees, departments, roles, etc.)
resource_id TEXT
old_values JSONB
new_values JSONB
ip_address TEXT
user_agent TEXT
created_at TIMESTAMP

Indexes: organization_id, employee_id, resource_type, created_at DESC
```
**Purpose:** Enhanced audit trail for employee actions

---

## RLS POLICY ARCHITECTURE

### Current State
- **profiles:** Basic user isolation (users see only their own)
- **remediation_plans, policy_publications, audit_log:** ALL authenticated users can see everything (PERMISSIVE)

### Needed for Multi-Tenant:

1. **Organization Isolation**
   ```sql
   -- All tables must filter by organization_id via the current user's organization
   -- Users can only see data from their org
   ```

2. **Department Access**
   ```sql
   -- Users can see departments in their org
   -- Department leads can manage their departments
   ```

3. **Employee Visibility**
   ```sql
   -- Users can see employees in their org
   -- Managers can see their direct reports
   -- HR users have wider visibility
   ```

4. **Role-Based Access**
   ```sql
   -- Permissions checked via employee_roles table
   -- Resource-level checks via employee_permissions
   ```

---

## MIGRATION STRATEGY

### Phase 1: Core Infrastructure (NEW)
1. Create `organizations` table
2. Create `departments` table with hierarchy support
3. Create `employees` table (extends profiles)
4. Create `organization_settings`
5. Migrate existing `profiles` data to `employees`

### Phase 2: Access Control (NEW)
1. Create `roles` table
2. Create `employee_roles` linking table
3. Create `employee_permissions` for granular access
4. Implement comprehensive RLS policies

### Phase 3: Team Management (NEW)
1. Create `team_members` table
2. Create `team_assignments` linking table
3. Update RLS for team visibility

### Phase 4: Enhanced Audit (MODIFY)
1. Create `audit_events` table (enhanced version)
2. Add audit triggers to all employee management tables
3. Keep existing `audit_log` for backward compatibility

### Phase 5: RLS Hardening (MODIFY)
1. Update existing table RLS policies (remediation_plans, policy_publications)
2. Change from permissive to restrictive policies
3. Add organization_id filtering to all queries

---

## INDEXES STRATEGY

### Recommended Indexes for New Tables:
```sql
-- departments
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);

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

-- team_members
CREATE INDEX idx_team_members_organization_id ON team_members(organization_id);
CREATE INDEX idx_team_members_lead_id ON team_members(lead_id);

-- team_assignments
CREATE INDEX idx_team_assignments_team_id ON team_assignments(team_id);
CREATE INDEX idx_team_assignments_employee_id ON team_assignments(employee_id);

-- employee_permissions
CREATE INDEX idx_employee_permissions_employee_id ON employee_permissions(employee_id);
CREATE INDEX idx_employee_permissions_resource ON employee_permissions(resource);

-- audit_events
CREATE INDEX idx_audit_events_organization_id ON audit_events(organization_id);
CREATE INDEX idx_audit_events_employee_id ON audit_events(employee_id);
CREATE INDEX idx_audit_events_resource_type ON audit_events(resource_type);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);
```

---

## TYPE DEFINITIONS NEEDED

```typescript
// types/employee-management.ts

export interface Organization {
  id: string
  name: string
  slug: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  logo_url?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  organization_id: string
  name: string
  description?: string
  parent_department_id?: string
  manager_id?: string
  budget?: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  organization_id: string
  department_id: string
  manager_id?: string
  employee_id: string
  position_title: string
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'temporary'
  start_date: string
  end_date?: string
  salary_grade?: string
  location?: string
  phone?: string
  mobile_phone?: string
  skills?: string[]
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  organization_id: string
  name: string
  description?: string
  permissions: string[]
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeRole {
  id: string
  employee_id: string
  role_id: string
  granted_by?: string
  granted_at: string
  expires_at?: string
}
```

---

## SUMMARY TABLE: What Exists vs. What's Needed

| Feature | Current | Status | Notes |
|---------|---------|--------|-------|
| User Authentication | ✅ auth.users | Existing | Supabase built-in |
| User Profiles | ✅ profiles | Existing | Basic only |
| Organizations | ❌ | NEEDED | Multi-tenancy |
| Departments | ❌ | NEEDED | Hierarchy support |
| Employees | ❌ | NEEDED | Extends profiles |
| Teams | ❌ | NEEDED | Cross-dept grouping |
| Roles | ❌ | NEEDED | Permission framework |
| RBAC | ❌ | NEEDED | Fine-grained access |
| Reporting Structure | ❌ | NEEDED | Manager relationships |
| Training Tracking | ✅ course_progress | Existing | HIPAA modules |
| Compliance Plans | ✅ remediation_plans | Existing | CFR tracking |
| Audit Trail | ✅ audit_log | Existing | Basic events |
| RLS Policies | ⚠️ Partial | NEEDS WORK | Too permissive currently |

---

## NEXT STEPS

1. **Create migration file:** `20260209_add_employee_management.sql`
2. **Generate type definitions:** Update `types/database.ts` and create `types/employee-management.ts`
3. **Implement RLS policies:** Hard-code org isolation across all tables
4. **Create database helper functions:** For hierarchy queries, permission checks
5. **Build API routes:** CRUD for all new entities with proper auth
6. **Implement UI components:** Employee management dashboard, department tree, role management

---

## ESTIMATED EFFORT

- **Database Design & Migration:** 4-6 hours
- **RLS Policies & Security:** 3-4 hours
- **Type Definitions & API Routes:** 6-8 hours
- **UI Components & Dashboards:** 12-16 hours
- **Testing & Validation:** 4-6 hours

**Total: 30-40 hours** for production-ready system

