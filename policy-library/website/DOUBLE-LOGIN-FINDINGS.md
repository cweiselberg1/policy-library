# Double Login Issue - Key Findings

## Issue Confirmed ✓

The double login issue on oneguyconsulting.com has been **successfully reproduced and documented** using automated Playwright testing.

---

## What Happens

```
User Journey:
1. User clicks "Login" button on homepage
   ↓
2. User enters credentials on portal.oneguyconsulting.com/auth/login
   ↓
3. User clicks "Sign In"
   ↓
4. 🚨 APPLICATION MAKES TWO AUTH ATTEMPTS AUTOMATICALLY 🚨
   - First attempt at timestamp T
   - Second attempt at timestamp T+10 seconds
   ↓
5. User sees form still displayed with error message
   (appears to need re-entry, creating confusion)
```

---

## Technical Evidence

### Two Authentication Attempts Detected

**First Attempt:**
```
[03:54:55.756Z] CONSOLE: Attempting signIn...
[03:54:55.757Z] REQUEST: GET /api/auth/providers
[03:54:55.867Z] REQUEST: GET /api/auth/csrf
[03:54:55.986Z] REQUEST: POST /api/auth/callback/credentials
[03:54:56.196Z] RESPONSE: 401 Unauthorized
[03:54:56.197Z] CONSOLE: SignIn error: CredentialsSignin
```

**Second Attempt (10 seconds later):**
```
[03:55:06.393Z] CONSOLE: Attempting signIn...
[03:55:06.394Z] REQUEST: GET /api/auth/providers
[03:55:06.509Z] REQUEST: GET /api/auth/csrf
[03:55:06.617Z] REQUEST: POST /api/auth/callback/credentials
[03:55:06.827Z] RESPONSE: 401 Unauthorized
[03:55:06.828Z] CONSOLE: SignIn error: CredentialsSignin
```

**Gap between attempts:** 10.6 seconds

---

## Visual Evidence

Screenshots captured at each step:

1. **Homepage** - Login button visible
2. **Login Page** - First credential prompt appears
3. **Credentials Filled** - User enters email/password
4. **After Submit** - Form processing
5. **Second Prompt** - Form STILL visible with error (this is the double login)

All screenshots saved in:
`/Users/chuckw./policy-library/website/login-test-screenshots/automated-test-1770177284187/`

---

## Root Cause (Preliminary Analysis)

The application is making **two separate authentication API calls** for a single user action. This is NOT the user being asked to manually re-enter credentials twice, but rather the application automatically attempting authentication twice.

### Most Likely Causes:

1. **Double Form Submission**
   - Missing `preventDefault()` on form submit
   - Event listener bound twice
   - React component mounting twice in Strict Mode

2. **NextAuth.js Configuration Issue**
   - Credentials provider callback invoked twice
   - Race condition in auth flow
   - Improper error handling triggering retry

3. **Client-Side Hydration Problem**
   - Next.js SSR hydration causing double event binding
   - Form handler attached on both server and client

4. **Automatic Retry Logic**
   - Built-in retry mechanism after 401 response
   - Unintended retry behavior in error handler

---

## Code Locations to Investigate

Based on the URL structure (`portal.oneguyconsulting.com/auth/login`), check these files:

### Frontend (Login Form)
- `/app/auth/login/page.tsx` - Login page component
- Form submit handler - Check for double event binding
- `signIn()` call - Verify only called once

### Backend (Auth API)
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- Credentials provider callback
- Error handling logic

### Look For:
```typescript
// BAD - No preventDefault
form.onSubmit((e) => {
  signIn('credentials', { ... })  // May fire twice
})

// GOOD - Proper handling
form.onSubmit((e) => {
  e.preventDefault()
  if (isSubmitting) return  // Guard against double-click
  setIsSubmitting(true)
  signIn('credentials', { ... })
})
```

---

## Impact

### User Experience
- Users see form remain after submission
- Error message appears but form still active
- Creates confusion about whether to re-enter credentials

### System
- **2x API load** on authentication endpoint
- Duplicate log entries
- Potential rate limiting issues
- Wasted server resources

---

## Next Steps

1. **Architect Review** - Analyze the authentication code to pinpoint exact cause
2. **Fix Implementation** - Add guards against double submission
3. **Verification Testing** - Re-run Playwright test to confirm single auth attempt
4. **Monitoring** - Add logging to track if issue recurs

---

## How to Reproduce (Manual)

1. Open browser to https://oneguyconsulting.com
2. Open DevTools → Network tab
3. Click "Login" button
4. Enter any credentials
5. Click "Sign In"
6. **Observe:** Two POST requests to `/api/auth/callback/credentials` in Network tab
7. **Observe:** Console shows "Attempting signIn..." twice

---

## Test Automation

**Automated test script created:**
`/Users/chuckw./policy-library/website/test-double-login-automated.js`

**To re-run:**
```bash
cd /Users/chuckw./policy-library/website
node test-double-login-automated.js
```

The test will automatically:
- Navigate to the site
- Click login
- Fill credentials
- Submit form
- Detect if multiple auth attempts occur
- Generate screenshots and logs

---

**Status:** Issue confirmed, ready for architect diagnosis and fix implementation

**Full Report:** See `DOUBLE-LOGIN-TEST-REPORT.md` for complete technical details
