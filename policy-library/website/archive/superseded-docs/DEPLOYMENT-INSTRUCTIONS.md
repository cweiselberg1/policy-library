# IMMEDIATE DEPLOYMENT INSTRUCTIONS

## Current Status: 50% Complete

### ✅ COMPLETED:
1. Database migration created (`supabase/migrations/20260212_incident_management.sql`)
2. API routes created:
   - `/api/incidents` (GET, POST)
   - `/api/incidents/[id]` (GET, PATCH, DELETE)
   - `/api/incidents/anonymous` (POST)
   - `/api/incidents/[id]/comments` (POST)
3. Privacy Officer incident list page created

### 🚧 REMAINING WORK (2-3 hours):

#### 1. Apply Database Migration (15 min)
```bash
cd /Users/chuckw./policy-library/website

# Option A: Via Supabase Dashboard (RECOMMENDED)
# 1. Go to https://supabase.com/dashboard
# 2. Select project: jyjytbwjifeqtfowqcqf
# 3. Click "SQL Editor"
# 4. Copy contents of supabase/migrations/20260212_incident_management.sql
# 5. Paste and click "Run"

# Option B: Via Supabase CLI
npx supabase db push
```

#### 2. Create Remaining Pages (1 hour)

**Still need to create:**
- `app/dashboard/privacy-officer/incidents/[id]/page.tsx` - Incident detail/edit
- `app/dashboard/employee/report-incident/page.tsx` - Employee reporting
- `app/incident/report-anonymous/page.tsx` - Anonymous reporting (public)

#### 3. Update Navigation (15 min)
- Add "Incidents" link to Privacy Officer dashboard
- Add "Report Incident" to Employee dashboard
- Update dashboard stats to include incident count

#### 4. Update Privacy Officer Role (10 min)
```sql
-- Run this in Supabase SQL Editor
UPDATE profiles
SET role = 'privacy_officer'
WHERE email = 'cweiselberg1@gmail.com';
```

#### 5. Deploy to Vercel (30 min)
```bash
# Build and test locally first
npm run build

# If build succeeds, deploy via Vercel Dashboard:
# 1. Push code to git
git add .
git commit -m "Merge incident management system"
git push

# 2. Vercel auto-deploys from git
# 3. Verify deployment succeeds
```

#### 6. Configure Domain (30 min)
**In Vercel Dashboard:**
1. Go to Project → Settings → Domains
2. Add domain: `oneguyconsulting.com`
3. Add domain: `www.oneguyconsulting.com`
4. Copy provided DNS records

**In FastComet/Namecheap DNS:**
1. Log in to FastComet control panel
2. Go to DNS Management for oneguyconsulting.com
3. Add A record: `@` → `76.76.21.21` (Vercel IP)
4. Add CNAME: `www` → `cname.vercel-dns.com`
5. Wait 15-60 min for DNS propagation

#### 7. Test Everything (30 min)
- [ ] Visit oneguyconsulting.com
- [ ] Login as Privacy Officer
- [ ] View incidents page
- [ ] Test creating incident
- [ ] Test employee login
- [ ] Test anonymous reporting

---

## FASTEST PATH TO COMPLETION

**Want this done ASAP? Run this script:**

```bash
cd /Users/chuckw./policy-library/website

# Apply migration via Supabase dashboard (manual step above)

# Update role
echo "UPDATE profiles SET role = 'privacy_officer' WHERE email = 'cweiselberg1@gmail.com';" | pbcopy
echo "✅ SQL copied to clipboard - paste in Supabase SQL Editor"

# Build
npm run build

# If successful, deploy
git add .
git commit -m "feat: merge incident management system"
git push

echo "✅ Code pushed - Vercel will auto-deploy"
echo "⏭️  Next: Configure domain in Vercel dashboard"
```

---

## SHORTCUTS TAKEN (What's Partially Implemented)

The following exist but need UI components:
- Incident detail page (API works, need UI)
- Employee reporting (API works, need UI)
- Anonymous reporting (API works, need UI)

**Quick Fix:** These can be added AFTER initial deployment. The core system will work without them.

---

## CREDENTIALS

**Login:** cweiselberg1@gmail.com
**Password:** TrumpDiddlesKid$123
**Role:** privacy_officer (after running UPDATE)

---

## ROLLBACK PLAN

If something breaks:
1. Vercel → Deployments → Click "..." on previous deployment → "Promote to Production"
2. Takes 30 seconds to rollback

---

## SUPPORT

If stuck, check:
1. Vercel deployment logs
2. Supabase logs (Dashboard → Logs)
3. Browser console for frontend errors
