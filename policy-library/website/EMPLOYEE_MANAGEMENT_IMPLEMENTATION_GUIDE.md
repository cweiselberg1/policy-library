# Employee Management System Implementation Guide
## Multi-Tenant Architecture with Unlimited Department Hierarchy

**Last Updated:** February 9, 2026
**Status:** Ready for Implementation
**Estimated Timeline:** 4-6 weeks

---

## TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Database Setup](#database-setup)
4. [API Implementation](#api-implementation)
5. [Frontend Components](#frontend-components)
6. [Security & RLS](#security--rls)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

---

## QUICK START

### Step 1: Apply Database Migration
```bash
cd /Users/chuckw./policy-library/website
supabase login
supabase link --project-ref your-project-ref
supabase db push  # Applies 20260209_add_employee_management.sql
```

### Step 2: Verify Migration
```sql
-- In Supabase SQL Editor, verify all tables were created:
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'organizations', 'departments', 'employees', 'roles',
  'employee_roles', 'team_members', 'team_assignments',
  'employee_permissions', 'organization_settings', 'audit_events'
);
```

### Step 3: Create Initial Organization
```sql
-- Insert your test organization
INSERT INTO organizations (name, slug, subscription_tier, status)
VALUES ('Test Organization', 'test-org', 'pro', 'active')
RETURNING id, name, slug;

-- Save the returned ID for later steps
```

### Step 4: Create Root Department
```sql
-- Using the organization ID from above
INSERT INTO departments (organization_id, name, status)
VALUES ('org-uuid-here', 'Executive', 'active')
RETURNING id;
```

### Step 5: Create First Employee
```sql
-- Link your auth user to an employee record
INSERT INTO employees (
  id,  -- Use your auth.users id
  organization_id,
  department_id,
  employee_id,
  position_title,
  employment_type,
  start_date
) VALUES (
  'your-auth-uuid',
  'org-uuid-here',
  'dept-uuid-here',
  'EMP-001',
  'System Administrator',
  'full_time',
  CURRENT_DATE
)
RETURNING id, employee_id;
```

---

## ARCHITECTURE OVERVIEW

### Multi-Tenant Design

```
┌─────────────────────────────────────────────────────────────┐
│                     ORGANIZATIONS                            │
│  (Tenants: Free, Pro, Enterprise)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────────┐
        │            │            │                  │
   ┌────▼──┐    ┌────▼──┐   ┌────▼──┐         ┌────▼──┐
   │ Depts │    │ Emps  │   │ Teams │         │ Roles │
   └───┬──┘    └────┬──┘   └────┬──┘         └───┬───┘
       │            │           │                 │
       │ Hierarchy  │ Manager   │ Cross-Dept     │ Permissions
       │ (self-ref) │ Relations │ Grouping       │ Framework
       │            │           │                │
   ┌───▼────────────▼───────────▼────────────────▼──┐
   │   ROW LEVEL SECURITY (RLS)                     │
   │   All queries filtered by organization_id      │
   └──────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication** → auth.users (Supabase built-in)
2. **Organization Assignment** → employees.organization_id
3. **Department Structure** → departments (hierarchical via parent_id)
4. **Role Assignment** → employee_roles (many-to-many)
5. **Permission Check** → combine roles + direct permissions
6. **Audit Trail** → audit_events (all changes logged)

---

## DATABASE SETUP

### Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20260209_add_employee_management.sql` | Complete database schema |
| `types/employee-management.ts` | TypeScript type definitions |
| `DATABASE_SCHEMA_ANALYSIS.md` | Detailed schema documentation |

### Key Tables & Relationships

#### organizations (Tenants)
- Base table for multi-tenancy
- Linked via `employees.organization_id`
- All queries filtered by this field

#### departments (Hierarchical)
- Self-referencing via `parent_department_id`
- Unlimited nesting depth
- Support for department managers
- Budget tracking

#### employees (Core Data)
- Extends auth.users via foreign key
- Links to organization and department
- Self-reference for manager relationships (reporting hierarchy)
- Employment details (type, status, dates)

#### roles + employee_roles (RBAC)
- Roles defined per organization
- Employees can have multiple roles
- Roles can expire
- Roles contain permission arrays

#### employee_permissions (Fine-grained)
- Direct permission overrides
- Per-resource, per-action grants
- Optional expiration

#### team_members + team_assignments (Teams)
- Cross-departmental grouping
- Employees can be in multiple teams
- Team leads tracked

#### audit_events (Compliance)
- All changes logged
- Retention policies
- Old/new values tracked as JSONB

### RLS Policies

All tables have RLS enabled with policies ensuring:
1. **Users only see data from their organization**
2. **Authenticated users only**
3. **Can view employees, departments, roles in their org**
4. **Writing requires additional role/permission checks** (implement in API)

---

## API IMPLEMENTATION

### Setup Express Routes

#### 1. Organizations API

**File:** `app/api/organizations/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/organizations/me - Get current user's organization
export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('employees')
    .select(`
      organization_id,
      organizations:organization_id (
        id, name, slug, subscription_tier, status, created_at
      )
    `)
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data?.organizations)
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name: body.name,
      slug: body.slug,
      subscription_tier: body.subscription_tier || 'free',
      status: 'active'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Create organization settings
  await supabase
    .from('organization_settings')
    .insert({
      organization_id: data.id,
      enable_hierarchy: true,
      enable_teams: true,
      enable_permissions: true
    })

  return NextResponse.json(data)
}
```

#### 2. Employees API

**File:** `app/api/employees/route.ts`

```typescript
// GET /api/employees - List employees in user's org
export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get user's organization
  const { data: userEmp } = await supabase
    .from('employees')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userEmp) return NextResponse.json({ error: 'Not an employee' }, { status: 403 })

  // Get all employees in org
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      department:department_id (id, name),
      manager:manager_id (id, employee_id, position_title)
    `)
    .eq('organization_id', userEmp.organization_id)
    .order('employee_id')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Verify user has permission to create employees
  const hasPermission = await checkPermission(user.id, 'employees', 'create')
  if (!hasPermission) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('employees')
    .insert({
      id: body.id,
      organization_id: body.organization_id,
      department_id: body.department_id,
      manager_id: body.manager_id || null,
      employee_id: body.employee_id,
      position_title: body.position_title,
      employment_type: body.employment_type || 'full_time',
      employment_status: 'active',
      start_date: body.start_date
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Log audit event
  await supabase
    .from('audit_events')
    .insert({
      organization_id: body.organization_id,
      employee_id: user.id,
      action: 'create',
      resource_type: 'employees',
      resource_id: data.id,
      new_values: data
    })

  return NextResponse.json(data)
}
```

#### 3. Departments API

**File:** `app/api/departments/route.ts`

```typescript
// GET /api/departments/tree - Get department hierarchy
export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userEmp } = await supabase
    .from('employees')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Get root departments
  const { data: roots, error } = await supabase
    .from('departments')
    .select('*')
    .eq('organization_id', userEmp.organization_id)
    .is('parent_department_id', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Recursively fetch children
  const tree = await Promise.all(
    roots.map(async (root) => ({
      ...root,
      children: await getChildDepartments(root.id)
    }))
  )

  return NextResponse.json(tree)
}

async function getChildDepartments(parentId: string) {
  const { data } = await supabase
    .from('departments')
    .select('*')
    .eq('parent_department_id', parentId)

  return Promise.all(
    (data || []).map(async (dept) => ({
      ...dept,
      children: await getChildDepartments(dept.id)
    }))
  )
}

// POST /api/departments - Create department
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('departments')
    .insert({
      organization_id: body.organization_id,
      name: body.name,
      parent_department_id: body.parent_department_id || null,
      manager_id: body.manager_id || null
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
```

#### 4. Roles & Permissions API

**File:** `app/api/roles/route.ts`

```typescript
// GET /api/roles - List roles in org
export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userEmp } = await supabase
    .from('employees')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('organization_id', userEmp.organization_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}

// POST /api/employees/:id/roles - Assign role to employee
export async function POST(request: NextRequest, context: any) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('employee_roles')
    .insert({
      employee_id: context.params.id,
      role_id: body.role_id,
      expires_at: body.expires_at || null
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}
```

#### 5. Permission Checking Utility

**File:** `lib/permissions.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  // Check direct permissions
  const { data: directPerm } = await supabase
    .from('employee_permissions')
    .select('id')
    .eq('employee_id', userId)
    .eq('resource', resource)
    .eq('action', action)
    .is('expires_at', null)
    .or('expires_at.gt.now()')
    .limit(1)

  if (directPerm && directPerm.length > 0) return true

  // Check roles
  const { data: roles } = await supabase
    .from('employee_roles')
    .select(`
      role_id,
      roles:role_id (permissions)
    `)
    .eq('employee_id', userId)
    .is('expires_at', null)
    .or('expires_at.gt.now()')

  if (roles && roles.length > 0) {
    for (const role of roles) {
      const permissions = (role.roles as any)?.permissions || []
      if (permissions.includes(action)) return true
    }
  }

  return false
}

export async function getEmployeePermissions(
  userId: string
): Promise<Set<string>> {
  const permissions = new Set<string>()

  // Get direct permissions
  const { data: directPerms } = await supabase
    .from('employee_permissions')
    .select('action, resource')
    .eq('employee_id', userId)

  if (directPerms) {
    directPerms.forEach((p: any) => {
      permissions.add(`${p.resource}:${p.action}`)
    })
  }

  // Get permissions from roles
  const { data: roles } = await supabase
    .from('employee_roles')
    .select('roles(permissions)')
    .eq('employee_id', userId)

  if (roles) {
    roles.forEach((role: any) => {
      const rolePerms = (role.roles as any)?.permissions || []
      rolePerms.forEach((p: string) => {
        permissions.add(p)
      })
    })
  }

  return permissions
}

export async function getEmployeeHierarchy(
  userId: string
): Promise<string[]> {
  const managers: string[] = []

  let currentId: string | null = userId

  // Walk up the reporting chain
  while (currentId) {
    const { data: emp } = await supabase
      .from('employees')
      .select('manager_id')
      .eq('id', currentId)
      .single()

    if (!emp || !emp.manager_id) break

    managers.push(emp.manager_id)
    currentId = emp.manager_id
  }

  return managers
}
```

---

## FRONTEND COMPONENTS

### 1. Employee Directory Component

**File:** `components/employee-management/EmployeeDirectory.tsx`

```typescript
'use client'

import React, { useEffect, useState } from 'react'
import { Employee, Department } from '@/types/employee-management'

export function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empsRes, deptsRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/departments/tree')
        ])

        if (!empsRes.ok || !deptsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        setEmployees(await empsRes.json())
        setDepartments(await deptsRes.json())
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Directory</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Tree */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Departments</h2>
          <DepartmentTree departments={departments} />
        </div>

        {/* Employee List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Employees</h2>
          <EmployeeTable employees={employees} />
        </div>
      </div>
    </div>
  )
}

function DepartmentTree({ departments }: { departments: any[] }) {
  return (
    <ul className="space-y-2">
      {departments.map((dept) => (
        <DepartmentNode key={dept.id} department={dept} level={0} />
      ))}
    </ul>
  )
}

function DepartmentNode({ department, level }: any) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li>
      <div
        className={`flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer`}
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        {department.children && department.children.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mr-2 text-sm"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
        <span className="font-medium">{department.name}</span>
      </div>
      {expanded && department.children && (
        <ul>
          {department.children.map((child: any) => (
            <DepartmentNode key={child.id} department={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

function EmployeeTable({ employees }: { employees: Employee[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Employee ID</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Position</th>
            <th className="border p-2 text-left">Department</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="border p-2">{emp.employee_id}</td>
              <td className="border p-2">{emp.id}</td>
              <td className="border p-2">{emp.position_title}</td>
              <td className="border p-2">{emp.department_id}</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  emp.employment_status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {emp.employment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 2. Department Tree Component

**File:** `components/employee-management/DepartmentTree.tsx`

```typescript
'use client'

import React, { useState } from 'react'
import { Department } from '@/types/employee-management'

interface DepartmentNodeProps {
  department: Department & { children?: DepartmentNodeProps['department'][] }
  level: number
  onSelect?: (dept: Department) => void
}

export function DepartmentTreeNode({
  department,
  level,
  onSelect
}: DepartmentNodeProps) {
  const [expanded, setExpanded] = useState(level === 0)

  return (
    <div>
      <div
        className="flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded"
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={() => {
          if (department.children?.length) {
            setExpanded(!expanded)
          }
          onSelect?.(department)
        }}
      >
        {department.children && department.children.length > 0 && (
          <span className="mr-2 w-5 text-center">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        <span className="flex-1 font-medium">{department.name}</span>
        {department.manager_id && (
          <span className="text-xs text-gray-500 ml-2">Managed</span>
        )}
      </div>

      {expanded && department.children && (
        <div>
          {department.children.map((child) => (
            <DepartmentTreeNode
              key={child.id}
              department={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 3. Create Employee Form

**File:** `components/employee-management/CreateEmployeeForm.tsx`

```typescript
'use client'

import React, { useState } from 'react'
import { CreateEmployeeRequest } from '@/types/employee-management'

export function CreateEmployeeForm({
  organizationId,
  departments,
  onSuccess
}: {
  organizationId: string
  departments: any[]
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    organization_id: organizationId,
    department_id: '',
    employee_id: '',
    position_title: '',
    employment_type: 'full_time',
    start_date: new Date().toISOString().split('T')[0]
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      onSuccess?.()
      setFormData({
        ...formData,
        employee_id: '',
        position_title: ''
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded border">
      <h2 className="text-xl font-semibold">Create Employee</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Employee ID</label>
        <input
          type="text"
          required
          placeholder="EMP-001"
          value={formData.employee_id}
          onChange={(e) =>
            setFormData({ ...formData, employee_id: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Position Title</label>
        <input
          type="text"
          required
          placeholder="Software Engineer"
          value={formData.position_title}
          onChange={(e) =>
            setFormData({ ...formData, position_title: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <select
          required
          value={formData.department_id}
          onChange={(e) =>
            setFormData({ ...formData, department_id: e.target.value })
          }
          className="w-full p-2 border rounded"
        >
          <option value="">Select department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Employment Type</label>
        <select
          value={formData.employment_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              employment_type: e.target.value as any
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contractor">Contractor</option>
          <option value="temporary">Temporary</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          required
          value={formData.start_date}
          onChange={(e) =>
            setFormData({ ...formData, start_date: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Employee'}
      </button>
    </form>
  )
}
```

---

## SECURITY & RLS

### RLS Policy Enforcement

All tables have RLS enabled. Key policies:

1. **Organization Isolation**
   - Users only see data from their organization
   - Enforced at database level via RLS

2. **Authentication Required**
   - All SELECT, INSERT, UPDATE policies require `authenticated` role
   - No public access to employee data

3. **Write Restrictions**
   - INSERT/UPDATE handled via API with permission checks
   - API validates `checkPermission()` before write operations

### API Permission Checks

```typescript
// Middleware to check permissions before API operations
async function requirePermission(
  userId: string,
  resource: string,
  action: string
) {
  const hasPermission = await checkPermission(userId, resource, action)
  if (!hasPermission) {
    throw new Error(`Permission denied: ${resource}:${action}`)
  }
}
```

### Default Roles

Create these system roles for new organizations:

```sql
-- Administrator: All permissions
INSERT INTO roles (organization_id, name, is_system, permissions)
SELECT
  id,
  'Administrator',
  true,
  ARRAY['view_employees', 'create_employees', 'edit_employees', 'delete_employees',
        'view_departments', 'create_departments', 'edit_departments',
        'view_roles', 'create_roles', 'edit_roles',
        'view_permissions', 'grant_permissions',
        'view_audit', 'manage_organization']
FROM organizations
WHERE name = 'Your Org';

-- Manager: Manage own department
INSERT INTO roles (organization_id, name, is_system, permissions)
SELECT
  id,
  'Manager',
  true,
  ARRAY['view_employees', 'view_departments', 'view_roles']
FROM organizations;

-- Employee: View own data
INSERT INTO roles (organization_id, name, is_system, permissions)
SELECT
  id,
  'Employee',
  true,
  ARRAY['view_own_profile']
FROM organizations;
```

---

## TESTING STRATEGY

### 1. Database Tests

```sql
-- Test 1: Verify RLS isolation
SELECT * FROM employees
WHERE organization_id = 'org-2'
AND auth.uid() = 'user-from-org-1';
-- Result: Should return 0 rows (RLS blocks access)

-- Test 2: Test hierarchy depth
WITH RECURSIVE dept_depth AS (
  SELECT id, parent_department_id, 1 as depth
  FROM departments
  WHERE organization_id = 'org-1' AND parent_department_id IS NULL

  UNION ALL

  SELECT d.id, d.parent_department_id, dd.depth + 1
  FROM departments d
  JOIN dept_depth dd ON d.parent_department_id = dd.id
  WHERE d.organization_id = 'org-1'
)
SELECT MAX(depth) FROM dept_depth;
-- Result: Should support unlimited depth

-- Test 3: Permission checking
SELECT has_employee_permission('emp-uuid', 'employees', 'view');
-- Result: TRUE or FALSE
```

### 2. API Tests

```typescript
// test/api/employees.test.ts
describe('Employees API', () => {
  it('should list employees in user organization', async () => {
    const res = await fetch('/api/employees', {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.every(e => e.organization_id === userOrgId)).toBe(true)
  })

  it('should prevent access to other org employees', async () => {
    // Setup: Create employee in different org
    const res = await fetch(`/api/employees/${otherOrgEmpId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(res.status).toBe(403)
  })

  it('should require permission to create employee', async () => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { Authorization: `Bearer ${limitedUserToken}` },
      body: JSON.stringify({ ...employeeData })
    })

    expect(res.status).toBe(403)
  })
})
```

### 3. Frontend Tests

```typescript
// test/components/EmployeeDirectory.test.tsx
describe('EmployeeDirectory', () => {
  it('should display department tree', async () => {
    const { getByText } = render(<EmployeeDirectory />)

    await waitFor(() => {
      expect(getByText('Engineering')).toBeInTheDocument()
      expect(getByText('Backend Team')).toBeInTheDocument()
    })
  })

  it('should show employee list', async () => {
    const { getByRole } = render(<EmployeeDirectory />)

    const rows = getByRole('table').querySelectorAll('tbody tr')
    expect(rows.length).toBeGreaterThan(0)
  })
})
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All migrations tested locally
- [ ] API endpoints tested with Postman/Insomnia
- [ ] RLS policies verified with test queries
- [ ] TypeScript types match database schema
- [ ] Error handling implemented in all endpoints
- [ ] Audit logging working correctly
- [ ] Permission system tested end-to-end
- [ ] Performance testing done on large datasets

### Deployment Steps
1. **Backup production database**
2. **Run migration:** `supabase db push`
3. **Verify tables created:** Query `pg_tables`
4. **Deploy API routes:** `npm run build && npm run deploy`
5. **Deploy frontend:** Build and deploy Next.js
6. **Create initial org:** Seed script with first organization
7. **Verify RLS:** Run test queries
8. **Monitor logs:** Check for errors 24 hours

### Post-Deployment
- [ ] Users can login and see their organization
- [ ] Employees can view directory
- [ ] Managers can manage departments
- [ ] Audit logs are recording changes
- [ ] No permission errors for authorized users
- [ ] No data leakage between orgs
- [ ] Performance acceptable (queries < 500ms)

---

## MIGRATION GUIDE FOR EXISTING DATA

If migrating from the old `profiles` table:

```sql
-- Step 1: Create organizations for existing users
INSERT INTO organizations (name, slug, status)
SELECT DISTINCT organization, organization || '-org', 'active'
FROM profiles
WHERE organization IS NOT NULL;

-- Step 2: Create departments (one per organization)
INSERT INTO departments (organization_id, name, status)
SELECT o.id, 'Default Department', 'active'
FROM organizations o;

-- Step 3: Migrate users to employees
INSERT INTO employees (id, organization_id, department_id, employee_id, position_title, employment_type, start_date)
SELECT
  p.id,
  o.id,
  d.id,
  p.id::text,
  p.role,
  'full_time',
  CURRENT_DATE
FROM profiles p
LEFT JOIN organizations o ON o.name = p.organization
LEFT JOIN departments d ON d.organization_id = o.id AND d.name = 'Default Department'
WHERE p.id IS NOT NULL;

-- Step 4: Create Employee role and assign to all users
INSERT INTO roles (organization_id, name, is_system, permissions)
SELECT id, 'Employee', true, '{"view_own_profile"}'::jsonb->>'permissions'
FROM organizations;

INSERT INTO employee_roles (employee_id, role_id)
SELECT e.id, r.id
FROM employees e
JOIN roles r ON r.organization_id = e.organization_id AND r.name = 'Employee';
```

---

## SUPPORT & MAINTENANCE

### Common Issues

**RLS blocking legitimate queries:**
- Verify user is in `employees` table
- Check `organization_id` matches
- Review RLS policy logic

**Department hierarchy too deep:**
- Database supports unlimited depth
- Frontend may need pagination for large trees
- Use `get_department_tree()` function for efficient queries

**Permission checks slow:**
- Add `employee_roles_idx` if not present
- Use caching in API layer
- Implement permission token in JWT

### Monitoring

```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor audit log growth
SELECT TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') as date,
       COUNT(*) as events
FROM audit_events
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Find slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## NEXT STEPS

1. **Review** this implementation guide with your team
2. **Test** the migration in a staging environment
3. **Adjust** RLS policies based on your specific use cases
4. **Build** API endpoints for your specific needs
5. **Create** frontend components
6. **Deploy** to production with careful monitoring

---

**Questions or issues? Check the DATABASE_SCHEMA_ANALYSIS.md file for detailed schema documentation.**
