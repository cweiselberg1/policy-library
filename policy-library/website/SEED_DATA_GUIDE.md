# 🌱 Seed Data Guide

## What is Seed Data?

Seed data populates your database with test data so you can immediately see how the employee management system works without manually creating everything.

## What Gets Created

### 📁 Departments (5 total)
```
/ENG (Engineering)
  ├── /ENG/BACKEND (Backend Engineering)
  └── /ENG/FRONTEND (Frontend Engineering)
/COMP (Compliance & Privacy)
/HR (Human Resources)
```

### 📚 Policy Bundles (4 total)
1. **HIPAA Security Rule - All Staff** (4 policies, 30 days)
   - Security Awareness Training
   - Password Policy
   - Device Security
   - Workstation Security

2. **HIPAA Privacy Rule - All Staff** (4 policies, 30 days)
   - Notice of Privacy Practices
   - Minimum Necessary Standard
   - Patient Rights
   - Breach Notification

3. **Technical Safeguards - Engineering** (5 policies, 45 days)
   - Access Control
   - Audit Controls
   - Integrity Controls
   - Transmission Security
   - Encryption Standards

4. **Privacy Officer Responsibilities** (5 policies, 60 days)
   - Privacy Officer Duties
   - Complaint Process
   - Sanctions Policy
   - Workforce Training Requirements
   - Business Associate Management

### 🔗 Department Policy Assignments (6 total)
- **Engineering Dept** → Security Rule + Technical Safeguards
- **Compliance Dept** → Privacy Rule + Privacy Officer Training
- **HR Dept** → Privacy Rule

## How to Load Seed Data

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20260210_seed_data.sql`
6. Paste into the editor
7. Click **Run** (or press Cmd+Enter)
8. Wait for "Success. No rows returned" message

### Option 2: Via Supabase CLI (Advanced)

```bash
cd /Users/chuckw./policy-library/website

# Apply the migration
npx supabase migration up

# Or run specific migration
npx supabase db execute --file supabase/migrations/20260210_seed_data.sql
```

## Verification

After loading seed data, verify it worked:

### 1. Check Departments
```sql
SELECT name, code, path
FROM departments
ORDER BY path;
```

**Expected:** 6 rows (including the default "All Employees" dept)

### 2. Check Policy Bundles
```sql
SELECT name,
       array_length(target_roles, 1) as role_count,
       jsonb_array_length(policies) as policy_count,
       default_due_days
FROM policy_bundles;
```

**Expected:** 4 rows

### 3. Check Assignments
```sql
SELECT d.name as department,
       pb.name as policy_bundle
FROM department_policy_requirements dpr
JOIN departments d ON d.id = dpr.department_id
JOIN policy_bundles pb ON pb.id = dpr.policy_bundle_id
ORDER BY d.name, pb.name;
```

**Expected:** 6 rows

## What About Employees?

**Seed data does NOT create employees.** Why?

1. Employees need real email addresses for invitations
2. Employee onboarding should use the actual invitation workflow
3. Testing the invitation flow is important

### How to Add Test Employees

1. Go to your Privacy Officer dashboard
2. Click **"Invite Employee"**
3. Enter test email addresses (use real emails you can access)
4. Select a department from the seeded list
5. Send invitations
6. Accept invitations via email
7. Test the employee dashboard

**Tip:** Use email aliases for testing:
- yourname+test1@gmail.com
- yourname+test2@gmail.com
- yourname+test3@gmail.com

These all deliver to yourname@gmail.com but count as separate accounts!

## Idempotency

The seed data is **idempotent** - you can run it multiple times safely.

Each INSERT has a `WHERE NOT EXISTS` check:
```sql
WHERE NOT EXISTS (
  SELECT 1 FROM departments WHERE code = 'ENG'
);
```

This means:
- ✅ First run: Creates data
- ✅ Second run: Skips (already exists)
- ✅ No errors
- ✅ No duplicates

## Reset Database (Start Over)

If you want to clear all data and start fresh:

```sql
-- WARNING: This deletes ALL data!
TRUNCATE TABLE
  employee_policy_assignments,
  department_policy_requirements,
  policy_bundles,
  employee_invitations,
  employees,
  departments,
  organizations
CASCADE;
```

Then re-run both migrations:
1. `20260209_employee_management_consolidated.sql` (creates structure)
2. `20260210_seed_data.sql` (adds test data)

## Next Steps After Seeding

1. ✅ Load seed data (this guide)
2. ✅ Access app at `/policies/` path
3. ✅ Sign up as first user (becomes Privacy Officer)
4. ✅ Explore pre-created departments
5. ✅ Explore pre-created policy bundles
6. ✅ Invite test employees
7. ✅ Test compliance tracking
8. ✅ Test employee dashboard

---

**Ready to test? Load the seed data and start inviting employees!** 🚀
