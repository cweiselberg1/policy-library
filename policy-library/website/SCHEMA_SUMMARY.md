# Database Schema Summary
## Policy Library Employee Management System

**Created:** February 9, 2026
**Status:** Ready for Implementation
**Version:** 1.0

---

## WHAT EXISTS (Current State)

### 1. **profiles** Table
- Basic user profile extending `auth.users`
- Fields: id, email, full_name, organization (text), role (text)
- RLS: Users see only their own profile
- **Issue:** Organization is just text, not a real foreign key

### 2. **course_progress** Table
- Tracks HIPAA training module completion
- Fields: id, user_id, course_id, completed_lessons, progress_percentage, dates
- RLS: Users see only their own progress

### 3. **certificates** Table
- Training certificates issued to users
- Fields: id, user_id, course_id, certificate_url, issued_at

### 4. **remediation_plans** Table
- HIPAA compliance plans with dependencies
- Fields: id, cfr_citation, title, policy_dependencies (array), status, priority
- RLS: ALL authenticated users can view/modify (⚠️ too permissive)

### 5. **policy_publications** Table
- Policy publication history
- Fields: id, policy_id, published_by, published_at, policy_metadata
- RLS: ALL authenticated users can view/create (⚠️ too permissive)

### 6. **audit_log** Table
- System audit trail
- Fields: id, event_type, user_id, details (JSONB), created_at
- RLS: ALL authenticated users can view/insert (⚠️ too permissive)

---

## WHAT'S MISSING (What We Need to Add)

### Core Multi-Tenant Tables

#### **organizations** ✅ NEW
```
├─ id (UUID)
├─ name (TEXT UNIQUE)
├─ slug (TEXT UNIQUE)
├─ subscription_tier (free|pro|enterprise)
├─ status (active|suspended|cancelled)
├─ logo_url, website, contact_email, phone
├─ metadata (JSONB)
└─ timestamps
```
**Purpose:** Tenant isolation and org-level data

#### **departments** ✅ NEW
```
├─ id (UUID)
├─ organization_id → organizations
├─ name (TEXT)
├─ parent_department_id → departments (SELF-REFERENCE for hierarchy)
├─ manager_id → employees
├─ budget (NUMERIC)
├─ status (active|inactive)
└─ timestamps
```
**Purpose:** Unlimited hierarchical departments
**Key Feature:** Self-referencing for infinite nesting

#### **employees** ✅ NEW
```
├─ id (UUID) → auth.users
├─ organization_id → organizations
├─ department_id → departments
├─ manager_id → employees (SELF-REFERENCE for reporting chain)
├─ employee_id (TEXT)
├─ position_title (TEXT)
├─ employment_status (active|inactive|on_leave|terminated)
├─ employment_type (full_time|part_time|contractor|temporary)
├─ start_date, end_date (DATE)
├─ salary_grade, location, phone, mobile_phone
├─ emergency_contact (JSONB)
├─ skills (TEXT[])
├─ custom_fields (JSONB)
└─ timestamps
```
**Purpose:** Core employee records with hierarchy
**Key Feature:** Manager relationship (reporting structure)

#### **roles** ✅ NEW
```
├─ id (UUID)
├─ organization_id → organizations
├─ name (TEXT)
├─ description (TEXT)
├─ permissions (TEXT[] array)
├─ is_system (BOOLEAN)
└─ timestamps
```
**Purpose:** RBAC framework

#### **employee_roles** ✅ NEW
```
├─ id (UUID)
├─ employee_id → employees
├─ role_id → roles
├─ granted_by → employees
├─ granted_at (TIMESTAMP)
├─ expires_at (TIMESTAMP nullable)
└─ created_at
```
**Purpose:** Many-to-many role assignment

#### **employee_permissions** ✅ NEW
```
├─ id (UUID)
├─ employee_id → employees
├─ resource (TEXT)
├─ action (TEXT)
├─ granted_by → employees
├─ granted_at (TIMESTAMP)
├─ expires_at (TIMESTAMP nullable)
└─ created_at
```
**Purpose:** Fine-grained permission overrides

#### **team_members** ✅ NEW
```
├─ id (UUID)
├─ organization_id → organizations
├─ name (TEXT)
├─ description (TEXT)
├─ lead_id → employees
├─ employee_count (INT)
└─ timestamps
```
**Purpose:** Cross-departmental teams

#### **team_assignments** ✅ NEW
```
├─ id (UUID)
├─ team_id → team_members
├─ employee_id → employees
├─ role_in_team (TEXT)
└─ assigned_at
```
**Purpose:** Team membership

#### **organization_settings** ✅ NEW
```
├─ id (UUID)
├─ organization_id → organizations (UNIQUE)
├─ max_departments (INT)
├─ max_employees (INT)
├─ enable_hierarchy (BOOLEAN)
├─ enable_teams (BOOLEAN)
├─ enable_permissions (BOOLEAN)
├─ enable_audit (BOOLEAN)
├─ custom_fields (JSONB)
├─ audit_retention_days (INT)
└─ timestamps
```
**Purpose:** Organization configuration

#### **audit_events** ✅ NEW (Enhanced)
```
├─ id (UUID)
├─ organization_id → organizations
├─ employee_id → employees
├─ action (TEXT)
├─ resource_type (TEXT)
├─ resource_id (TEXT)
├─ old_values (JSONB)
├─ new_values (JSONB)
├─ ip_address (TEXT)
├─ user_agent (TEXT)
└─ created_at
```
**Purpose:** Comprehensive audit trail for employees

---

## RLS POLICIES

### Current Issues
- ⚠️ `remediation_plans`: ALL authenticated users can view/modify
- ⚠️ `policy_publications`: ALL authenticated users can view/create
- ⚠️ `audit_log`: ALL authenticated users can view/insert

### What We're Adding
✅ All new tables have organization isolation RLS:
```sql
-- Users can only see data from their organization
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.organization_id = table.organization_id
    AND employees.id = auth.uid()
  )
)
```

---

## KEY FEATURES

### 1. Multi-Tenancy
- Every table tied to `organizations`
- RLS enforces org isolation at DB level
- Complete data separation

### 2. Unlimited Department Hierarchy
- `parent_department_id` self-reference
- No depth limits
- Recursive queries via `get_department_tree()` function

### 3. Reporting Structure
- `employees.manager_id` self-reference
- Walk reporting chain via `get_reporting_chain()` function
- Supports any org structure

### 4. RBAC (Role-Based Access Control)
- Roles defined per organization
- Employees can have multiple roles
- Roles can expire
- Permissions defined as text arrays

### 5. Fine-Grained Permissions
- Direct permission grants (resource + action)
- Can expire
- Override role permissions
- Per-employee exceptions

### 6. Team Management
- Cross-departmental teams
- Employees in multiple teams
- Team roles/titles

### 7. Comprehensive Audit
- All changes logged to `audit_events`
- Old/new values captured
- User and IP tracking
- Retention policies

---

## FILES CREATED

| File | Purpose | Status |
|------|---------|--------|
| `supabase/migrations/20260209_add_employee_management.sql` | Complete database migration | ✅ Ready |
| `types/employee-management.ts` | TypeScript type definitions | ✅ Ready |
| `DATABASE_SCHEMA_ANALYSIS.md` | Detailed schema documentation | ✅ Ready |
| `EMPLOYEE_MANAGEMENT_IMPLEMENTATION_GUIDE.md` | Full implementation guide | ✅ Ready |
| `SCHEMA_SUMMARY.md` | This file | ✅ Ready |

---

## QUICK REFERENCE: TABLE RELATIONSHIPS

```
organizations
  ├→ departments (org_id) → (parent_id) [SELF-HIERARCHY]
  ├→ employees (org_id)
  │   ├→ department_id → departments
  │   ├→ manager_id → employees [SELF-REPORTING]
  │   ├→ employee_roles → roles
  │   ├→ employee_permissions
  │   ├→ team_assignments
  │   └→ audit_events
  ├→ roles (org_id)
  │   └→ employee_roles ← employees
  ├→ team_members (org_id)
  │   └→ team_assignments ← employees
  ├→ organization_settings (org_id)
  ├→ audit_events (org_id)
  └→ employee_permissions ← employees
```

---

## IMPLEMENTATION ORDER

### Phase 1: Database (2-3 hours)
1. Run migration: `supabase db push`
2. Verify tables created
3. Test RLS policies
4. Seed test data

### Phase 2: API Layer (6-8 hours)
1. Create `/api/organizations` routes
2. Create `/api/employees` routes (CRUD + list)
3. Create `/api/departments` routes (with tree)
4. Create `/api/roles` routes
5. Create `/api/permissions` routes
6. Add permission checking middleware

### Phase 3: Frontend (12-16 hours)
1. Employee Directory view
2. Department Tree component
3. Create/Edit Employee forms
4. Role management UI
5. Permission management UI
6. Team management UI

### Phase 4: Testing & Security (4-6 hours)
1. Test RLS isolation
2. Test permission enforcement
3. Test hierarchy depth
4. Load testing
5. Security review

### Phase 5: Deployment (2-4 hours)
1. Staging validation
2. Production migration
3. Data verification
4. Monitoring setup

**Total Estimated Time:** 30-40 hours

---

## CRITICAL SUCCESS FACTORS

✅ **RLS Enforcement:** Database-level isolation, not just app logic
✅ **Permission Checks:** Always validate in API before writes
✅ **Audit Trail:** Every change logged with old/new values
✅ **Hierarchy Support:** Unlimited dept nesting via parent_id
✅ **Reporting Chain:** Manager relationships for org structure
✅ **Extensibility:** custom_fields for org-specific data
✅ **Performance:** Indexes on all foreign keys and frequently queried fields

---

## MIGRATION COMMANDS

### Apply Migration
```bash
cd policy-library/website
supabase db push
```

### Verify Tables
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'organizations', 'departments', 'employees', 'roles',
  'employee_roles', 'team_members', 'team_assignments',
  'employee_permissions', 'organization_settings', 'audit_events'
);
```

### Create Test Organization
```sql
INSERT INTO organizations (name, slug, status)
VALUES ('Test Org', 'test-org', 'active')
RETURNING id;
```

### Create Root Department
```sql
INSERT INTO departments (organization_id, name, status)
VALUES ('org-uuid', 'Executive', 'active')
RETURNING id;
```

---

## SUPPORT RESOURCES

- **Schema Details:** See `DATABASE_SCHEMA_ANALYSIS.md`
- **Implementation:** See `EMPLOYEE_MANAGEMENT_IMPLEMENTATION_GUIDE.md`
- **Types:** See `types/employee-management.ts`
- **Migration SQL:** See `supabase/migrations/20260209_add_employee_management.sql`

---

## NEXT STEPS FOR YOU

1. **Review** all 4 files to understand the complete system
2. **Test** the migration in staging environment
3. **Adjust** RLS policies for your specific business rules
4. **Implement** API endpoints following the guide
5. **Build** UI components
6. **Deploy** with careful monitoring

---

**Status: COMPLETE AND READY FOR IMPLEMENTATION** ✅

All analysis, design, SQL, types, and implementation guides are ready.
Ready to start building? Contact your development team with these files!
