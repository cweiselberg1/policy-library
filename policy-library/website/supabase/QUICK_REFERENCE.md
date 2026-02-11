# Organizational Hierarchy - Quick Reference

**TL;DR for developers implementing the new schema**

---

## Key Tables at a Glance

| Table | Purpose | Key Fields | Notes |
|-------|---------|-----------|-------|
| `organizations` | Multi-tenant root | `id, name, slug` | Soft-delete via `deleted_at` |
| `departments` | Hierarchical tree | `id, parent_id, path, path_depth, code` | Materialized path (e.g., `/IT/SEC`) |
| `organization_members` | User roles | `user_id, organization_id, role, primary_department_id` | Links users to orgs + depts |
| `policy_bundles` | Policy groups | `policy_ids[], target_roles[], target_departments[]` | Auto-assign if `is_default=true` |
| `employee_policy_assignments` | Individual tracking | `user_id, policy_bundle_id, status, due_at, is_overdue` | Computed overdue field |

---

## Common Queries (Copy-Paste Ready)

### Get User's Organization & Department
```sql
SELECT o.*, om.role, d.name as dept_name
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
LEFT JOIN departments d ON d.id = om.primary_department_id
WHERE om.user_id = auth.uid();
```

### Get All Children of a Department (Recursive)
```sql
SELECT * FROM departments
WHERE organization_id = $org_id
  AND path LIKE (
    SELECT path || '/%'
    FROM departments WHERE id = $parent_id
  );
```

### Get User's Overdue Assignments
```sql
SELECT epa.*, pb.name, d.code
FROM employee_policy_assignments epa
JOIN policy_bundles pb ON pb.id = epa.policy_bundle_id
JOIN departments d ON d.id = epa.department_id
WHERE epa.user_id = auth.uid()
  AND epa.is_overdue = TRUE
  AND epa.status != 'completed';
```

### Compliance Summary by Department
```sql
SELECT
  d.code,
  COUNT(DISTINCT epa.user_id) as users,
  COUNT(*) FILTER (WHERE epa.status = 'completed') as done,
  ROUND(100.0 * COUNT(*) FILTER (WHERE epa.status = 'completed') / COUNT(*)) as pct
FROM departments d
LEFT JOIN employee_policy_assignments epa ON epa.department_id = d.id
WHERE d.organization_id = $org_id
GROUP BY d.id, d.code;
```

---

## Frontend Integration (TypeScript)

### Load User's Organization Context
```typescript
const { data: member } = await supabase
  .from('organization_members')
  .select('*, organization:organizations(*), department:departments(*)')
  .eq('user_id', userId)
  .single();

// member.role → 'privacy_officer' | 'employee' | ...
// member.organization → full org details
// member.department → full department details
```

### Load User's Assignments
```typescript
const { data: assignments } = await supabase
  .from('employee_policy_assignments')
  .select(`
    id, status, due_at, completed_at, completion_percentage, is_overdue,
    policy_bundle:policy_bundles(name, policy_ids)
  `)
  .eq('user_id', userId)
  .order('due_at', { ascending: true });

// Filter by status in frontend
const pending = assignments.filter(a => a.status === 'assigned');
const overdue = assignments.filter(a => a.is_overdue);
```

### Check User's Permissions (RLS Enforced)
```typescript
// Try to access - if you can't, RLS blocked it
try {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', othersOrgId);

  if (error?.code === 'PGRST116') {
    // RLS policy prevented access
    console.log('Not allowed');
  }
} catch (err) {
  // Handle error
}
```

---

## Role Permissions Matrix

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ ACTION           │ PRIVACY OFFICER  │ DEPT MANAGER     │ EMPLOYEE         │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ View all orgs    │ ✅               │ Own only         │ Own only         │
│ View all depts   │ ✅               │ Own + children   │ Own only         │
│ View all members │ ✅               │ Own dept         │ Self only        │
│ View assignments │ ✅               │ Own dept         │ Self only        │
│ Edit assignments │ ✅               │ Own dept         │ ❌               │
│ Create depts     │ ✅               │ ❌               │ ❌               │
│ Assign policies  │ ✅               │ Own dept         │ ❌               │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

---

## Triggers Summary

| Trigger | When | What It Does |
|---------|------|-------------|
| `maintain_department_path` | INSERT/UPDATE dept | Auto-calculates `path` & `path_depth` |
| `calculate_assignment_due_date` | INSERT assignment | Auto-calculates `due_at` from bundle |
| `sync_user_profile_from_org_member` | INSERT/UPDATE member | Syncs to legacy `users` table |
| `update_timestamp` | UPDATE any table | Sets `updated_at = NOW()` |

---

## Indexes (Performance Critical)

Always use these in queries:

```sql
-- Department queries
idx_departments_org_id
idx_departments_path              ← Use with LIKE
idx_departments_path_like

-- Assignment queries
idx_assignments_user_id
idx_assignments_org_user_status   ← Composite index
idx_assignments_is_overdue        ← WHERE is_overdue = TRUE

-- Org member queries
idx_org_members_org_id
idx_org_members_role
```

---

## Department Path Examples

```
Organization: "Acme Inc"
├─ /ACME                          path_depth: 1
   ├─ /ACME/HR                    path_depth: 2
   │  └─ /ACME/HR/PAYROLL         path_depth: 3
   ├─ /ACME/IT                    path_depth: 2
   │  ├─ /ACME/IT/SECURITY        path_depth: 3
   │  └─ /ACME/IT/INFRASTRUCTURE  path_depth: 3
   └─ /ACME/LEGAL                 path_depth: 2
```

**Query: Get all children of /ACME/IT**
```sql
WHERE path LIKE '/ACME/IT/%'
-- Returns: SECURITY, INFRASTRUCTURE
```

**Query: Get all descendants (unlimited depth)**
```sql
WHERE path LIKE '/ACME/%'
-- Returns: HR, HR→PAYROLL, IT, IT→SECURITY, IT→INFRASTRUCTURE, LEGAL
```

---

## Data Migration Checklist

- [x] `organizations` table created with default org
- [x] `departments` table created with root dept `/ALL`
- [x] Existing users auto-migrated to `organization_members`
- [x] Roles auto-populated from legacy `users.role` field
- [x] Legacy `users.role` kept in sync via trigger
- [x] All RLS policies created (not enforced yet)

**To enforce RLS:**
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_policy_assignments ENABLE ROW LEVEL SECURITY;
```

---

## Testing Checklist

Before going live:

- [ ] Query existing users → confirm they have `organization_members` record
- [ ] Create new department → confirm path auto-calculated
- [ ] Create assignment → confirm due_at auto-calculated
- [ ] Test as employee → confirm can't see other users
- [ ] Test as manager → confirm can see own + child depts
- [ ] Test as privacy officer → confirm can see all
- [ ] Verify no performance regression (queries < 50ms)
- [ ] Check `updated_at` triggers working
- [ ] Verify soft deletes don't break queries

---

## Troubleshooting

**Q: User says "Access denied" error**
A: Check RLS is enabled. See if user has `organization_members` record. Check their role/dept assignment.

**Q: Department path looks wrong**
A: Check parent_id is correct. Trigger should auto-fix on update. If broken, re-insert.

**Q: Assignments not auto-creating for new employee**
A: Check `is_default=true` on policy bundles. Check department matches target_departments (or is NULL).

**Q: Query timing out**
A: Make sure you're using index on path (LIKE queries). Add organization_id filter first.

**Q: Users.role not syncing from organization_members**
A: Check trigger is enabled. Manually update: `UPDATE users SET role = 'privacy_officer' WHERE id = ...`

---

## File Locations

| File | Purpose |
|------|---------|
| `migrations/20260209_organizational_hierarchy.sql` | Full migration (idempotent) |
| `MIGRATION_STRATEGY.md` | Detailed strategy & phases |
| `IMPLEMENTATION_PATTERNS.md` | Code examples (SQL + TypeScript) |
| `QUICK_REFERENCE.md` | This file |

---

## Key Concepts

**Materialized Path**
- Every department stores full path: `/ORG/DEPT/SUBDEPT`
- Enables fast recursive queries without complex CTEs
- Calculated by trigger on insert/update

**RLS (Row Level Security)**
- PostgreSQL enforces at query time
- Policy-based: Privacy officers see all, employees see self only
- Transparent to application (just query normally)

**Soft Deletes**
- Use `deleted_at IS NULL` in WHERE clauses
- Keeps audit trail but hides deleted records
- Example: `WHERE deleted_at IS NULL`

**Triggers**
- Auto-calculate computed fields (path, due_at)
- Maintain sync with legacy tables
- Update timestamps

---

## Performance Tips

1. **Always filter by organization_id first**
   ```sql
   WHERE organization_id = $org_id AND ...  ← Good
   WHERE ... AND organization_id = $org_id  ← Slower
   ```

2. **Use path index for hierarchy**
   ```sql
   WHERE path LIKE '/ORG/%'  ← Fast (uses index)
   WHERE path ~ '^/ORG/.*'   ← Slower (regex)
   ```

3. **Batch operations when possible**
   ```sql
   INSERT INTO assignments (...) VALUES (...), (...), (...);  ← Good
   INSERT INTO assignments (...) VALUES (...); [repeat 100x]   ← Slow
   ```

4. **Pagination for large result sets**
   ```sql
   .limit(20).offset(page * 20)
   ```

---

## Next Steps

1. Apply migration: `psql < migrations/20260209_organizational_hierarchy.sql`
2. Test basic queries (see Common Queries above)
3. Test RLS with test users
4. Update frontend to use new tables
5. Enable RLS enforcement (Phase 3)
6. Monitor performance for 1 week
7. Decommission legacy department/role fields (optional, later)

---

**Version 1.0 - 2026-02-09**
