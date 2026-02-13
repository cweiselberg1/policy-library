# Training Portal Setup Guide

**Status:** Built and Ready for Deployment
**Date:** 2026-02-03

---

## 🚀 What Was Built

A complete training portal system with:

- ✅ **User Authentication** (Supabase Auth)
- ✅ **Sequential Training Flow** (Policies → HIPAA 101 → Cybersecurity)
- ✅ **Progress Tracking** (Save/Resume functionality)
- ✅ **Training Dashboard** (Overview of completion status)
- ✅ **39 Policy Acknowledgments** (Checklist with tracking)
- ✅ **HIPAA 101 Training** (Comprehensive content + quiz)
- ✅ **Cybersecurity Training** (Awareness content + quiz)
- ✅ **API Routes** (Progress, policies, modules, sessions)
- ✅ **Database Schema** (Users, progress, completions)

---

## 📋 Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: "OGC Training Portal"
4. Set database password (save it!)
5. Choose region closest to you
6. Wait for project to provision (~2 minutes)

### 2. Run Database Migrations

```bash
cd /Users/chuckw./policy-library/website/

# Apply the migration
cat supabase/migrations/001_create_training_tables.sql | pbcopy
```

Then in Supabase Dashboard:
1. Go to SQL Editor
2. Paste the migration SQL
3. Click "Run"
4. Verify tables created in Database → Tables

### 3. Get Supabase Credentials

In Supabase Dashboard:
1. Go to Settings → API
2. Copy these values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep secret!

### 4. Configure Environment Variables

Create `.env.local`:

```bash
cd /Users/chuckw./policy-library/website/
cp .env.local.example .env.local
nano .env.local
```

Paste your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

### 5. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000/signup

Test flow:
1. Sign up for account
2. Login
3. Go to /training
4. Complete policies checklist
5. Click "Continue" → HIPAA 101
6. Complete HIPAA 101 → Continue
7. Complete Cybersecurity → Finish
8. View completion dashboard

### 6. Build for Production

```bash
npm run build
```

Check for errors. Fix any TypeScript issues.

### 7. Deploy to Production

```bash
# Deploy to FastComet
rsync -avz --delete out/ oneguyco@oneguyconsulting.com:/home/oneguyco/public_html/policies/

# Or deploy to Vercel (recommended for dynamic features)
npx vercel
```

**Note:** For Supabase to work in production, add environment variables to your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- FastComet: Add to `.env.local` on server (ensure not web-accessible)

---

## 🗂️ File Structure

```
website/
├── app/
│   ├── api/
│   │   └── training/
│   │       ├── progress/route.ts      # GET/POST progress
│   │       ├── policies/route.ts      # Mark policies complete
│   │       ├── modules/route.ts       # Mark modules complete
│   │       └── session/route.ts       # Save/resume position
│   ├── training/
│   │   ├── page.tsx                   # Dashboard
│   │   ├── policies/page.tsx          # Policy checklist
│   │   ├── hipaa-101/page.tsx         # HIPAA 101 training
│   │   └── cybersecurity/page.tsx     # Cybersecurity training
│   ├── login/page.tsx                 # Login page
│   ├── signup/page.tsx                # Signup page
│   └── layout.tsx                     # Root layout
├── components/
│   ├── training/
│   │   ├── PolicyChecklist.tsx        # 39-policy checklist
│   │   ├── TrainingModule.tsx         # Reusable module wrapper
│   │   ├── TrainingDashboard.tsx      # Progress overview
│   │   ├── ProgressTracker.tsx        # Sidebar progress
│   │   ├── ModuleCard.tsx             # Module display
│   │   └── QuizQuestion.tsx           # Interactive quizzes
│   └── auth/
│       ├── LoginForm.tsx              # Login form
│       ├── SignUpForm.tsx             # Signup form
│       └── AuthProvider.tsx           # Auth context
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser client
│   │   ├── server.ts                  # Server client
│   │   ├── auth.ts                    # Auth helpers
│   │   └── middleware.ts              # Route protection
│   └── training/
│       ├── flow.ts                    # Sequential flow logic (if created)
│       └── progress.ts                # Progress utilities (if created)
├── public/
│   └── training-content/
│       ├── hipaa-101.md               # HIPAA 101 content
│       └── cybersecurity.md           # Cybersecurity content
├── supabase/
│   └── migrations/
│       └── 001_create_training_tables.sql  # Database schema
├── types/
│   └── training.ts                    # TypeScript types
├── middleware.ts                      # Route protection
├── .env.local.example                 # Environment template
└── package.json                       # Dependencies

```

---

## 📊 Database Schema

### Tables

1. **users** - Extended user profiles
   - email, full_name, organization, department, role, avatar_url

2. **training_progress** - Overall progress tracking
   - user_id, policies_completed, hipaa_101_complete, cybersecurity_complete,
   - overall_percentage, current_step

3. **policy_acknowledgments** - Individual policy sign-offs
   - user_id, policy_id, acknowledged_at

4. **module_completions** - Module completion records
   - user_id, module_name, completed_at, quiz_score, certificate_url

5. **training_sessions** - Save/resume data
   - user_id, last_position, last_module, scroll_position

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Protected routes via middleware
- ✅ Secure password hashing (Supabase)
- ✅ JWT-based authentication
- ✅ Service role key kept server-side only

---

## 🎯 Training Flow

```
1. User signs up/logs in
   ↓
2. Dashboard shows progress (0%)
   ↓
3. Click "Start Training" → Policies
   ↓
4. Check all 39 policies
   ↓
5. Click "Continue" → HIPAA 101 (33% complete)
   ↓
6. Read content, pass quiz (75%+)
   ↓
7. Click "Continue" → Cybersecurity (66% complete)
   ↓
8. Read content, pass quiz (80%+)
   ↓
9. Click "Complete" → Dashboard (100%)
   ↓
10. View completion certificate
```

---

## 🧪 Testing Checklist

Before going live, test:

- [ ] User can sign up
- [ ] User can log in
- [ ] User redirected to /training after login
- [ ] Dashboard shows 0% progress initially
- [ ] Policy checklist loads all 39 policies
- [ ] Checking policies updates progress
- [ ] "Save & Exit" preserves progress
- [ ] "Continue" button enabled after all policies checked
- [ ] HIPAA 101 content loads
- [ ] Quiz questions work and show feedback
- [ ] Passing quiz (75%+) marks module complete
- [ ] Cybersecurity module accessible after HIPAA 101
- [ ] Cybersecurity quiz requires 80%+ to pass
- [ ] Dashboard shows 100% after all modules complete
- [ ] Certificate/completion message displays
- [ ] User can log out
- [ ] User can resume training after logging back in

---

## 🚨 Troubleshooting

### "Network request failed" errors
- Check Supabase credentials in .env.local
- Verify Supabase project is running (not paused)
- Check browser console for specific error

### Authentication not working
- Verify NEXT_PUBLIC_SUPABASE_URL starts with https://
- Check anon key is the public one (not service role)
- Clear browser cookies and try again

### Database errors
- Run migration SQL in Supabase SQL Editor
- Check RLS policies are enabled
- Verify user_id columns match auth.uid()

### Build errors
- Run `npm run build` to see TypeScript errors
- Check all imports are correct
- Verify all files created properly

---

## 📈 Next Steps (Future Enhancements)

- [ ] Email notifications on completion
- [ ] Downloadable PDF certificates
- [ ] Admin dashboard to view all trainee progress
- [ ] Expiration/renewal reminders (annual training)
- [ ] Additional training modules (ransomware, phishing simulation)
- [ ] Integration with HR systems
- [ ] Reporting and analytics
- [ ] Mobile app version

---

## 📞 Support

**Files:** `/Users/chuckw./policy-library/website/`
**Live URL (after deployment):** https://oneguyconsulting.com/policies/training/
**Documentation:** This file + inline code comments

**For Issues:**
- Check browser console for errors
- Review Supabase logs in Dashboard → Logs
- Verify environment variables are set correctly

---

**Built with:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS
**Build Date:** February 3, 2026
**Developer:** Claude Code + oh-my-claudecode (Ralph + Ultrawork)

