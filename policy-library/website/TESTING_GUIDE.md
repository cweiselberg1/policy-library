# 🧪 Testing Guide - Employee Management System

## Quick Test Checklist

Since your deployment has Vercel authentication enabled, here's how to test everything:

### ✅ Step 1: Access the App
1. Open: https://website-5bn7s9far-chuckwny1987s-projects.vercel.app/policies/
2. Authenticate with Vercel if prompted
3. You should see the HIPAA Policy Library home page

⚠️ **Important:** The app is at `/policies/` not at root `/`. This is configured in `next.config.ts`.

### ✅ Step 2: Sign Up as Privacy Officer
1. Click "Sign Up" or "Login"
2. Create an account with your email
3. Check your email for verification link
4. Verify your email

### ✅ Step 3: Access Privacy Officer Dashboard
1. Navigate to: `/dashboard/privacy-officer`
2. You should see the dashboard with stats:
   - Total Employees: 0
   - Active Employees: 0
   - Total Departments: 1 (Default "All Employees" dept)
   - Compliance Rate: 0%

### ✅ Step 4: Test Department Management
1. Go to `/dashboard/privacy-officer/departments`
2. Click "Add Department"
3. Create a root department (e.g., "Engineering")
4. Create a child department under it (e.g., "Engineering > Backend")
5. Verify you see the hierarchy

**Expected Result:** Unlimited nesting works, path shown like `/ENG/BACKEND`

### ✅ Step 5: Test Employee Invitation
1. Go to `/dashboard/privacy-officer/employees`
2. Click "Invite Employee"
3. Fill out the form:
   - Email: test@example.com
   - Department: Select one you created
   - Position: "Software Engineer"
   - Employment Type: Full Time
   - Role: Employee
4. Click "Send Invitation"

**Expected Result:**
- Invitation appears in the list
- Supabase sends email to test@example.com
- Status: "Pending"

### ✅ Step 6: Test Policy Bundles
1. Go to `/dashboard/privacy-officer/policy-bundles`
2. Click "Create Bundle"
3. Create a policy bundle:
   - Name: "HIPAA Security Rule"
   - Target Roles: Employee
   - Policies: Select from list
   - Due Days: 30
4. Save the bundle

**Expected Result:** Bundle appears in list, can be assigned to departments

### ✅ Step 7: Test Policy Assignment
1. Select a policy bundle
2. Assign it to a department or role
3. View compliance dashboard

**Expected Result:**
- Assignment appears in `/dashboard/privacy-officer/compliance`
- Shows as "Assigned" status
- Due date calculated automatically (30 days from now)

### ✅ Step 8: Test Employee Dashboard
1. Log out
2. Accept the employee invitation (check email)
3. Create account as invited employee
4. Navigate to `/dashboard/employee`

**Expected Result:**
- See "My Policies" page
- Policy bundles assigned to you appear
- Can acknowledge and mark as completed

## 🐛 What to Look For

### Green Flags ✅
- ✅ Pages load without errors
- ✅ Data persists after refresh
- ✅ Invitations send emails
- ✅ Departments show hierarchy
- ✅ Policy assignments calculate due dates
- ✅ Dashboard stats update in real-time
- ✅ Authentication works
- ✅ Multi-tenant: Different orgs see only their data

### Red Flags 🚨
- 🚨 "Unauthorized" errors
- 🚨 "Table does not exist" errors
- 🚨 Blank dashboards with no data
- 🚨 Can't create departments/employees
- 🚨 Invitations don't send
- 🚨 Cross-org data leakage

## 📊 Database Verification

If you want to verify the database directly:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor"
4. You should see 7 tables:
   - ✅ organizations
   - ✅ departments
   - ✅ employees
   - ✅ employee_invitations
   - ✅ policy_bundles
   - ✅ department_policy_requirements
   - ✅ employee_policy_assignments

5. Click on `organizations` table
   - Should see 1 row: "Default Organization"

6. Click on `departments` table
   - Should see 1 row: "All Employees" with path `/ALL`

## 🔍 API Testing (Advanced)

If you want to test the APIs directly, you'll need to authenticate first.

### Get Auth Token
1. Open browser DevTools (F12)
2. Go to Application > Cookies
3. Find `sb-access-token` cookie
4. Copy the value

### Test API Endpoints
```bash
# Replace $TOKEN with your access token

# Test: Get employees
curl -H "Authorization: Bearer $TOKEN" \
  https://website-5bn7s9far-chuckwny1987s-projects.vercel.app/policies/api/employees

# Test: Get departments
curl -H "Authorization: Bearer $TOKEN" \
  https://website-5bn7s9far-chuckwny1987s-projects.vercel.app/policies/api/departments

# Test: Get dashboard stats
curl -H "Authorization: Bearer $TOKEN" \
  https://website-5bn7s9far-chuckwny1987s-projects.vercel.app/policies/api/dashboard/stats
```

## 🎯 Success Criteria

Your system is working correctly if:

1. ✅ You can sign up and log in
2. ✅ Privacy Officer dashboard loads with stats
3. ✅ Can create departments with unlimited nesting
4. ✅ Can invite employees via email
5. ✅ Can create and assign policy bundles
6. ✅ Employee dashboard shows assigned policies
7. ✅ Compliance tracking works (overdue detection)
8. ✅ No RLS errors (can't see other org's data)

## 🚀 Performance Benchmarks

**Expected Performance:**
- Page load: < 1 second
- API response: < 200ms
- Database queries: < 50ms
- Employee list (100 employees): < 500ms
- Department tree (50 depts): < 300ms

## 🔒 Security Testing

1. **Multi-Tenancy**: Create two organizations, verify they can't see each other's data
2. **RLS Policies**: Try accessing another org's data via API - should get 401/403
3. **Role Permissions**: Employee should NOT see Privacy Officer pages
4. **Auth Protection**: Logged out users redirected to login

## 📝 Notes

- First user becomes Privacy Officer automatically
- Default organization exists for testing
- Employee invitations use Supabase Auth (check spam folder)
- Overdue status updates automatically via trigger
- Department paths are materialized for fast queries

---

**Need Help?**
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Documentation: See DEPLOYMENT_COMPLETE.md
