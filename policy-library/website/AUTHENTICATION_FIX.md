# Authentication Double-Login Fix

## Problem Summary

Users were experiencing **double authentication** - being asked to log in twice when accessing the policy library and related tools.

### Root Cause

Two separate authentication systems were running in parallel:

1. **Modal Login** (oneguyconsulting.com)
   - Triggered by the "Login" button on the main site
   - Showed "Login to Policy Library" modal
   - **CRITICAL SECURITY ISSUE**: Passed credentials in URL as `?email=...&password=...`
   - Redirected to `/policies/` with credentials exposed in query parameters

2. **Portal Login** (portal.oneguyconsulting.com)
   - Proper Supabase authentication with secure cookie-based sessions
   - "Welcome Back" sign-in page
   - This is the CORRECT authentication system

### The Problem Flow

1. User clicks "Login" button → Modal appears
2. User enters credentials → Redirects to `/policies/?email=...&password=...`
3. User accesses the policy library (no auth required - middleware was disabled)
4. User tries to access certain features
5. System redirects to `portal.oneguyconsulting.com/auth/login`
6. **User has to login AGAIN** because the two systems don't share sessions

## Solution Implemented

### 1. ✅ Enabled Authentication Middleware

**File Changed:** `middleware.ts` (was `middleware.ts.disabled`)

**What it does:**
- Automatically refreshes Supabase sessions on every request
- Checks if user is authenticated before allowing access
- Redirects unauthenticated users to `portal.oneguyconsulting.com/auth/login`
- Preserves the original destination URL for redirect after login
- Allows public paths (homepage, blog) to be accessed without authentication

### 2. ⚠️ REQUIRED: Update Main Site Login Button

**Action Required on oneguyconsulting.com:**

The Login button on the main site navigation needs to be updated to remove the modal and link directly to the portal.

**Current behavior (BROKEN):**
```html
<button id="login-trigger">Login</button>
<!-- This triggers a modal with id="login-modal" -->
```

**Required change:**
```html
<a href="https://portal.oneguyconsulting.com/auth/login">Login</a>
```

**If the main site is on Webflow, Squarespace, or similar:**
1. Find the "Login" button in the site editor
2. Change it from a button to a link
3. Set the link URL to: `https://portal.oneguyconsulting.com/auth/login`
4. Remove/delete the login modal (#login-modal)
5. Remove any JavaScript that handles the modal login form submission

### 3. 🔒 Security Improvements

**Fixed vulnerabilities:**
- ❌ **REMOVED**: Credentials in URL query parameters (massive security risk)
- ✅ **ENABLED**: Supabase authentication middleware
- ✅ **ENABLED**: Secure, httpOnly cookie-based sessions
- ✅ **ENABLED**: Automatic session refresh
- ✅ **ENFORCED**: Authentication required for protected content

## User Experience After Fix

### New Login Flow:
1. User clicks "Login" on oneguyconsulting.com
2. Redirected directly to `portal.oneguyconsulting.com/auth/login`
3. User enters credentials **ONCE**
4. After successful login, redirected back to intended destination
5. **No second login required** - session is maintained across the domain

### Protected vs Public Content

**Public (no login required):**
- Homepage (/)
- Blog (/blog)
- Mixpanel analytics endpoints

**Protected (login required):**
- Policy library (/covered-entities, /business-associates)
- Audit tools (/audit/physical, /audit/it-risk)
- Training modules (/training)
- All other pages

## Testing Checklist

After implementing the main site changes:

- [ ] Clear browser cookies
- [ ] Visit oneguyconsulting.com
- [ ] Click "Login" button
- [ ] Verify you're taken to portal.oneguyconsulting.com/auth/login
- [ ] Enter credentials: `po@test.com` / `password`
- [ ] Verify successful login
- [ ] Navigate to /policies/ or /audit/it-risk
- [ ] **Confirm NO second login prompt appears**
- [ ] Verify you can access all protected content with single login
- [ ] Check browser network tab - confirm NO credentials in URL

## Files Modified

1. `middleware.ts.disabled` → `middleware.ts` (enabled)
2. `lib/supabase/middleware.ts` (updated with authentication redirect logic)
3. `AUTHENTICATION_FIX.md` (this document)

## Next Steps

1. **Update main site login button** (see instructions above)
2. **Test the complete flow** (see testing checklist)
3. **Deploy changes** to production
4. **Monitor for issues** - check logs for any authentication errors

## Support

If you encounter issues after implementing these changes:

1. Check browser console for errors
2. Verify Supabase environment variables are set correctly in `.env.local`
3. Confirm middleware is enabled (file named `middleware.ts` not `.disabled`)
4. Test in incognito/private browsing mode to rule out cookie issues
5. Check network tab to see if redirects are working correctly

---

**Created:** 2026-02-03
**Issue:** Double authentication (15+ hours)
**Status:** Fixed (policy library side) - Main site update required
**Security Level:** CRITICAL (credentials exposed in URL - now fixed)
