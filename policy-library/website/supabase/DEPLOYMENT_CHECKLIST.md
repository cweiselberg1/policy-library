# Deployment Checklist

**Complete pre-deployment verification before applying migration**

---

## Pre-Deployment (1 Week Before)

- [ ] **Backup Current Database**
  - [ ] Full pg_dump to local file
  - [ ] Verify backup can be restored
  - [ ] Document backup location: `_______________`

- [ ] **Review Changes with Team**
  - [ ] Architecture review with database admin
  - [ ] API team understands new query patterns
  - [ ] Frontend team understands new UI requirements
  - [ ] QA prepared with test cases

- [ ] **Performance Testing**
  - [ ] Load test RLS policies (< 100ms per query)
  - [ ] Load test department path queries (< 50ms)
  - [ ] Load test assignment queries with 10k+ records
  - [ ] Identify any slow queries

- [ ] **Documentation**
  - [ ] Update API documentation
  - [ ] Update database schema docs
  - [ ] Create runbook for common operations
  - [ ] Document role permissions matrix

- [ ] **Rollback Plan**
  - [ ] Test partial rollback (just drop new tables)
  - [ ] Test full rollback to backup
  - [ ] Document rollback procedure: `MIGRATION_STRATEGY.md`
  - [ ] Get approval from tech lead

---

## 24 Hours Before Deployment

- [ ] **Final Review**
  - [ ] Re-read migration file for correctness
  - [ ] Verify all indexes are in place
  - [ ] Verify all triggers are correct
  - [ ] Check trigger execution order

- [ ] **Notify Stakeholders**
  - [ ] Email: engineering team
  - [ ] Email: product team
  - [ ] Slack: #engineering channel
  - [ ] Message: "Migration scheduled for [TIME] UTC on [DATE]"

- [ ] **Prepare Monitoring**
  - [ ] Set up Sentry alerts
  - [ ] Set up database performance alerts
  - [ ] Prepare query monitoring dashboard
  - [ ] Get ready to monitor error logs

- [ ] **Test Environment**
  - [ ] Run migration on staging DB
  - [ ] Run all test suites on staged schema
  - [ ] Verify RLS policies work as expected
  - [ ] Spot-check data integrity

---

## Deployment Day

### Phase 1: Pre-Deployment Checks (T-30 minutes)

- [ ] **Database Health**
  ```sql
  -- Check current active connections
  SELECT count(*) FROM pg_stat_activity;
  -- Should be < 5 during maintenance window

  -- Check for long-running queries
  SELECT * FROM pg_stat_activity
  WHERE query NOT LIKE 'autovacuum%'
    AND state != 'idle'
    AND duration > '1 minute';
  -- Kill if necessary: SELECT pg_terminate_backend(pid);
  ```

- [ ] **Disk Space**
  ```sql
  -- Ensure at least 10GB free
  SELECT pg_database_size('policy_library_db') as used,
         pg_tablespace_size('pg_default') as tablespace;
  ```

- [ ] **Backup Freshness**
  - [ ] Last backup was within 1 hour

- [ ] **Team Ready**
  - [ ] DBA at computer
  - [ ] Developer monitoring logs
  - [ ] QA ready to test

---

### Phase 2: Execute Migration (T-0)

**Maintenance Window:** `___:___ to ___:___ UTC`
**Expected Duration:** 5-10 minutes (mostly index creation)

```bash
# Step 1: Set maintenance mode (notify users)
# In your app: set MAINTENANCE_MODE=true

# Step 2: Final backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > \
  backup-pre-migration-$(date +%s).sql

# Step 3: Run migration (idempotent - safe to retry)
psql -h $DB_HOST -U $DB_USER $DB_NAME \
  < migrations/20260209_organizational_hierarchy.sql

# Step 4: Verify (see "Phase 3: Verification")

# Step 5: Disable maintenance mode
# In your app: set MAINTENANCE_MODE=false
```

---

### Phase 3: Verification (T+5 minutes)

**Run these checks immediately after migration:**

```sql
-- ✅ Check 1: All tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'organizations', 'departments', 'organization_members',
  'policy_bundles', 'department_policy_requirements',
  'employee_policy_assignments'
);
-- Expected: 6 rows

-- ✅ Check 2: All indexes exist
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
AND (indexname LIKE 'idx_%' OR indexname LIKE 'trg_%');
-- Expected: 20+ indexes

-- ✅ Check 3: All triggers exist
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Expected: 5 triggers

-- ✅ Check 4: RLS is enabled
SELECT table_name, row_security_enabled
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'organizations', 'departments', 'organization_members',
  'policy_bundles', 'department_policy_requirements',
  'employee_policy_assignments'
);
-- Expected: All TRUE

-- ✅ Check 5: Types exist
SELECT typname FROM pg_type
WHERE typname IN (
  'user_role_type',
  'department_status_type',
  'assignment_status_type'
);
-- Expected: 3 rows

-- ✅ Check 6: Default org exists
SELECT COUNT(*) FROM organizations WHERE slug = 'default-org';
-- Expected: 1 row

-- ✅ Check 7: All users have org membership
SELECT COUNT(*) as users_without_org
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM organization_members om WHERE om.user_id = u.id
);
-- Expected: 0 rows

-- ✅ Check 8: No orphaned assignments
SELECT COUNT(*) as orphaned
FROM employee_policy_assignments epa
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = epa.user_id
);
-- Expected: 0 rows

-- ✅ Check 9: Triggers working (paths auto-calculated)
INSERT INTO departments (
  organization_id, parent_id, name, code
) VALUES (
  (SELECT id FROM organizations LIMIT 1),
  NULL,
  'Test Dept',
  'TEST'
) RETURNING path, path_depth;
-- Expected: path = '/TEST', path_depth = 1
-- Then DELETE test record

-- ✅ Check 10: Audit log entry
SELECT COUNT(*) FROM audit_log
WHERE event_type = 'migration_completed'
AND details->>'migration_name' = '20260209_organizational_hierarchy';
-- Expected: 1 row
```

**Script to run all checks:**
```bash
cat > verify_migration.sql << 'EOF'
-- Run all verification checks
\set ON_ERROR_STOP on

-- Check 1-10 as above
...

EOF

psql -h $DB_HOST -U $DB_USER $DB_NAME -f verify_migration.sql
```

---

### Phase 4: Data Integrity (T+10 minutes)

```sql
-- Verify path format
SELECT id, path FROM departments
WHERE path !~ '^/[A-Z0-9-/]*$'
LIMIT 10;
-- Expected: 0 rows (all valid)

-- Verify depth calculations
SELECT d.id, d.path_depth,
  (LENGTH(d.path) - LENGTH(REPLACE(d.path, '/', ''))) as calculated
FROM departments d
WHERE d.path_depth != (LENGTH(d.path) - LENGTH(REPLACE(d.path, '/', '')))
LIMIT 10;
-- Expected: 0 rows (all correct)

-- Verify no circular references
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id, 1 as level
  FROM departments

  UNION ALL

  SELECT d.id, d.parent_id, a.level + 1
  FROM ancestors a
  JOIN departments d ON d.id = a.parent_id
  WHERE a.level < 100
)
SELECT DISTINCT id FROM ancestors
WHERE level > 50;
-- Expected: 0 rows (no deep cycles)

-- Verify assignment dates
SELECT COUNT(*) FROM employee_policy_assignments
WHERE assigned_at > due_at;
-- Expected: 0 rows

-- Verify no NULL violations
SELECT COUNT(*) FROM departments
WHERE path IS NULL OR path_depth IS NULL;
-- Expected: 0 rows
```

---

### Phase 5: Performance Testing (T+15 minutes)

```sql
-- Warm up the cache
SELECT * FROM departments LIMIT 1000;
SELECT * FROM organization_members LIMIT 1000;

-- Test 1: Path query performance
EXPLAIN ANALYZE
SELECT * FROM departments
WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
  AND path LIKE '/ALL/%';

-- Test 2: RLS policy evaluation
EXPLAIN ANALYZE
SELECT * FROM employee_policy_assignments
WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
LIMIT 100;

-- Test 3: Complex hierarchy query
EXPLAIN ANALYZE
SELECT d.*, COUNT(o.id) as member_count
FROM departments d
LEFT JOIN organization_members o ON o.primary_department_id = d.id
WHERE d.organization_id = (SELECT id FROM organizations LIMIT 1)
GROUP BY d.id;

-- Expected: All queries < 50ms execution time
-- If slower: Check missing indexes, re-run ANALYZE
```

If queries are slow:
```sql
-- Analyze statistics
ANALYZE departments;
ANALYZE organization_members;
ANALYZE employee_policy_assignments;

-- Re-check performance
```

---

## Post-Deployment

### Immediately After (T+30 minutes)

- [ ] **Smoke Tests**
  - [ ] Navigate to dashboard - loads without errors
  - [ ] Login as employee - can see assignments
  - [ ] Login as manager - can see dept assignments
  - [ ] Login as PO - can see all data
  - [ ] Create new department - path auto-calculated
  - [ ] Assign policy to user - due_at auto-calculated

- [ ] **Monitor Logs**
  - [ ] Check Sentry for errors
  - [ ] Check database logs for warnings
  - [ ] Check API logs for 403/404 errors (RLS issues)
  - [ ] Search logs for "PGRST116" (RLS denials)

- [ ] **Quick Data Checks**
  ```sql
  SELECT COUNT(*) as total_users FROM auth.users;
  SELECT COUNT(*) as total_members FROM organization_members;
  SELECT COUNT(*) as total_assignments FROM employee_policy_assignments;
  -- Verify counts match expectations
  ```

---

### Next 24 Hours

- [ ] **Monitor Performance**
  - [ ] Check slow query logs (> 100ms)
  - [ ] Check database CPU usage
  - [ ] Check connection pool utilization
  - [ ] Monitor error rates in Sentry

- [ ] **User Reports**
  - [ ] Slack: "Any issues seen?"
  - [ ] Email: Product team
  - [ ] Monitor support tickets

- [ ] **Data Quality**
  ```sql
  -- Check for any data inconsistencies
  SELECT COUNT(*) FROM organization_members om
  WHERE NOT EXISTS (
    SELECT 1 FROM departments d
    WHERE d.id = om.primary_department_id
  )
  AND om.primary_department_id IS NOT NULL;
  -- Expected: 0 rows
  ```

- [ ] **RLS Policy Audit**
  ```sql
  -- Count denials
  SELECT COUNT(*) FROM pg_log
  WHERE message LIKE '%PGRST116%'
    AND timestamp > NOW() - INTERVAL '24 hours';
  -- If high (> 100), investigate which policy is blocking
  ```

---

### Next 1 Week

- [ ] **Performance Baseline**
  - [ ] Document query performance metrics
  - [ ] Set up performance alerts
  - [ ] Compare to pre-migration baseline

- [ ] **RLS Enforcement**
  - [ ] If all systems stable, enforce RLS policies fully
  - [ ] Update application to assume RLS is active
  - [ ] Remove any RLS bypass logic

- [ ] **Decommission Legacy Fields** (Optional)
  - [ ] After 1 week: Consider dropping legacy `users.role` and `users.department`
  - [ ] Document deprecation timeline
  - [ ] Update API responses to use `organization_members` instead

- [ ] **Documentation Update**
  - [ ] Update wiki/internal docs
  - [ ] Update API docs
  - [ ] Add troubleshooting guide for common issues

- [ ] **Team Training**
  - [ ] Conduct team training on new schema
  - [ ] Walk through common query patterns
  - [ ] Discuss role-based access model

---

## Rollback Plan

**If critical issues occur during deployment:**

### Option 1: Partial Rollback (Recommended)

```bash
# Drop only new tables (keeps existing data safe)
psql -h $DB_HOST -U $DB_USER $DB_NAME << EOF

DROP TABLE IF EXISTS employee_policy_assignments CASCADE;
DROP TABLE IF EXISTS department_policy_requirements CASCADE;
DROP TABLE IF EXISTS policy_bundles CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

DROP FUNCTION IF EXISTS maintain_department_path();
DROP FUNCTION IF EXISTS calculate_assignment_due_date();
DROP FUNCTION IF EXISTS sync_user_profile_from_org_member();
DROP FUNCTION IF EXISTS update_timestamp();

DROP TYPE IF EXISTS user_role_type;
DROP TYPE IF EXISTS department_status_type;
DROP TYPE IF EXISTS assignment_status_type;

COMMIT;

EOF

# Restart application
systemctl restart policy-library-api
```

**Duration:** ~10 seconds
**Data Loss:** None (only new tables dropped)

---

### Option 2: Full Rollback to Backup

```bash
# Stop application
systemctl stop policy-library-api

# Restore from backup
pg_restore -h $DB_HOST -U $DB_USER -d policy_library_db \
  backup-pre-migration-1234567890.sql

# Restart application
systemctl start policy-library-api
```

**Duration:** 5-10 minutes depending on DB size
**Data Loss:** None (restores to pre-migration state)

---

## Critical Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| DBA | `_________` | `_________` | `_________` |
| Tech Lead | `_________` | `_________` | `_________` |
| Dev Lead | `_________` | `_________` | `_________` |
| Product Owner | `_________` | `_________` | `_________` |

---

## Sign-Off

- [ ] **DBA Approval**
  - Name: `_______________` Date: `___________`
  - Signature: `___________________`

- [ ] **Tech Lead Approval**
  - Name: `_______________` Date: `___________`
  - Signature: `___________________`

- [ ] **Product Owner Approval**
  - Name: `_______________` Date: `___________`
  - Signature: `___________________`

---

## Post-Deployment Sign-Off

- [ ] **Migration Successful**
  - Completed by: `_______________` Time: `___________`
  - All verification checks: ✅ PASSED

- [ ] **Performance Verified**
  - Verified by: `_______________` Time: `___________`
  - No queries > 100ms: ✅ PASSED

- [ ] **Ready for Production**
  - Approved by: `_______________` Date: `___________`

---

## Appendix A: Emergency Contacts

**If something goes wrong, contact:**

1. DBA: `_________`
2. Tech Lead: `_________`
3. On-call engineer: `_________` (from PagerDuty)

**Rollback decision:**
- If > 10% error rate: ROLLBACK immediately
- If > 50ms avg query time: INVESTIGATE, may rollback
- If RLS denying legitimate access: DISABLE RLS, investigate

---

## Appendix B: Monitoring Dashboard

Set up monitoring for:

```
1. Error Rate (Sentry)
   - Target: < 0.1% increase from baseline
   - Alert if: > 1% errors in 5-min window

2. Query Performance (pg_stat_statements)
   - Target: < 50ms p99 for department queries
   - Alert if: > 200ms p99

3. RLS Denials (Logs)
   - Target: 0 unexpected denials
   - Alert if: > 100 denials/hour

4. Database CPU
   - Target: < 70% utilization
   - Alert if: > 85% sustained

5. Connection Pool
   - Target: < 80% of max connections
   - Alert if: > 90% utilization
```

---

**Deployment Checklist v1.0 - 2026-02-09**

**Last Updated:** `_______________`
**Next Review:** `_______________`
