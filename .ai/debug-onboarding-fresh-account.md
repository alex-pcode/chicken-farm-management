# Debug: Fresh Account Onboarding → Dashboard Fails to Load

**Date:** 2026-02-22
**Reporter:** User (fresh account test)
**Severity:** Critical — new users cannot access the app after completing onboarding
**Status:** FIXED (2026-02-22)

---

## Symptom

Fresh account → complete onboarding → dashboard does not load. Console shows:

```
/.netlify/functions/crud?operation=completeOnboarding  Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
Failed to complete onboarding: TypeError: Failed to fetch
GET https://chickencare.app/.netlify/functions/data  net::ERR_CONNECTION_TIMED_OUT
Failed to get user profile: TypeError: Failed to fetch
GET https://yckjarujczxrlaftfjbv.supabase.co/rest/v1/user_profiles?select=is_admin  net::ERR_NETWORK_CHANGED
```

The React error #299 is from a **browser extension** (content.js), not the app — ignore it.

---

## Root Cause Analysis

### Bug 1 — `setSession` on service-role client (HIGH PRIORITY) — FIXED

**File:** `netlify/functions/crud.ts`

**What was wrong:**
- `supabase` is a **service-role client** (created with `SUPABASE_SERVICE_ROLE_KEY`).
  Service-role clients bypass RLS entirely — they should never need session management.
- Calling `setSession` on a service-role client **overrides the service role key** with the user's JWT.
  After this call, subsequent DB operations use the user's JWT and RLS policies apply.
- `refresh_token: ''` is an empty string, which is falsy. Supabase JS v2 `setSession` checks:
  `if (!refresh_token) → return AuthSessionMissingError`.
  The session may not be set at all, meaning `auth.uid()` returns `null` in RLS policies.
- Even if `setSession` succeeds, it potentially makes a network call to Supabase Auth to validate the token, adding latency inside the already-time-limited Netlify function.

**Impact on new users specifically:**
- New user has no `user_profiles` row yet
- `completeOnboarding` tries to INSERT into `user_profiles`
- RLS policy: `"Users can insert own profile" WITH CHECK (auth.uid() = user_id)`
- If `setSession` with empty `refresh_token` fails to set the session → `auth.uid()` returns `null`
- INSERT is blocked by RLS → throws an error inside the function
- The function may hang on the auth operation before even reaching the INSERT

**Fix applied:** Removed the `setSession` block entirely. The function authenticates the user via `getAuthenticatedUser()` first, then uses the service-role client for all DB ops with explicit `.eq('user_id', user.id)` filters.

---

### Bug 2 — User stuck on onboarding screen with no feedback (HIGH PRIORITY) — FIXED

**Files changed:**
- `src/contexts/OnboardingProvider.tsx`
- `src/components/features/auth/ProtectedRoute.tsx`

**What was wrong:**
1. User clicks "Complete Setup" / "Start Tracking"
2. `completeOnboarding()` API call fails (network error or 500)
3. `OnboardingProvider.completeOnboarding()` set `isLoading = true`, causing `ProtectedRoute` to unmount the entire onboarding UI and show a loading spinner
4. After failure, `isLoading = false` → onboarding UI remounts from scratch (all form state lost)
5. `onboardingState.hasCompletedOnboarding` remains `false`
6. **No error message was shown to the user**

**Fix applied:**
- Removed `setIsLoading(true/false)` from `OnboardingProvider.completeOnboarding()` — the global loading state was unmounting the onboarding UI during the API call, losing all form progress on failure.
- Rewrote `TierAwareOnboardingWrapper` in `ProtectedRoute.tsx` with:
  - Local `completionError` state displayed as a fixed red error banner at the top of the screen
  - Local `isCompleting` state shown as a translucent loading overlay (keeps onboarding mounted)
  - Centralized `handleComplete()` that wraps all three completion paths (free user, premium skip, premium wizard) with try/catch error handling
  - Error message: "Setup couldn't be saved. Please check your connection and try again."
  - Dismissable banner with × button
- Also removed dependency on `useUserTier()` from `OptimizedDataProvider` (see Bug 4); tier is now derived from `OnboardingProvider`'s `userProfile.subscription_status`.

---

### Bug 3 — `getUserProfile()` fetches ALL data just for onboarding check (MEDIUM) — FIXED

**Files changed:**
- `netlify/functions/data.ts`
- `src/services/api/UserService.ts`

**What was wrong:**
`getUserProfile()` called the **full `/data` endpoint** which runs 4–8 DB queries (egg entries, flock profiles, expenses, etc.) just to extract the user profile. This fired on every app load before onboarding check, and again when `OptimizedDataProvider` fetched data in parallel — **doubling** the function cold-start pressure.

**Fix applied:**
- Added `case 'profile'` to `data.ts` switch → `getProfileOnly(user)` — a single-query function that only fetches the `user_profiles` table.
- Updated `UserService.getUserProfile()` to call `/data?type=profile` instead of the full `/data` endpoint.

---

### Bug 4 — `OptimizedDataProvider` fetches data during onboarding (LOW) — FIXED

**Files changed:**
- `src/App.tsx`
- `src/components/features/auth/ProtectedRoute.tsx`

**What was wrong:**
```tsx
// OLD nesting in App.tsx:
<OnboardingProvider>
  <OptimizedDataProvider>   ← fetches /data immediately
    <ProtectedRoute>
      <MainApp />
    </ProtectedRoute>
  </OptimizedDataProvider>
</OnboardingProvider>
```

`OptimizedDataProvider` started loading data when the user landed on `/app/*` — even if they hadn't completed onboarding. For a new user this created a race with `completeOnboarding`, and both requests hit the same cold Netlify function simultaneously.

**Fix applied:**
- Swapped provider nesting so `OptimizedDataProvider` wraps only post-onboarding content:
  ```tsx
  // NEW nesting in App.tsx:
  <OnboardingProvider>
    <ProtectedRoute>
      <OptimizedDataProvider>
        <MainApp />
      </OptimizedDataProvider>
    </ProtectedRoute>
  </OnboardingProvider>
  ```
- `TierAwareOnboardingWrapper` no longer uses `useUserTier()` (which required `OptimizedDataProvider`). Instead, user tier is derived from `OnboardingProvider`'s `userProfile.subscription_status`.
- Data only loads after onboarding is confirmed complete, eliminating the cold-start race.

---

## Files Changed

| File | Change | Priority | Status |
|------|--------|----------|--------|
| `netlify/functions/crud.ts` | Removed `setSession` block | P0 | Done |
| `src/contexts/OnboardingProvider.tsx` | Removed `isLoading` from `completeOnboarding` | P0 | Done |
| `src/components/features/auth/ProtectedRoute.tsx` | Error banner + loading overlay + tier derivation from userProfile | P0 | Done |
| `netlify/functions/data.ts` | Added `case 'profile'` → `getProfileOnly()` | P1 | Done |
| `src/services/api/UserService.ts` | Changed to `/data?type=profile` | P1 | Done |
| `src/App.tsx` | Moved `OptimizedDataProvider` inside `ProtectedRoute` | P2 | Done |

---

## Testing After Fix

1. Create a fresh account via Sign Up
2. Complete free-user onboarding (click through to "Start Tracking")
3. Verify: user lands on Egg Counter page, no errors in console
4. Verify: `user_profiles` row exists in DB with `onboarding_completed = true`
5. Simulate network failure: throttle network to "Offline" before clicking "Start Tracking"
6. Verify: error banner appears at top of screen, onboarding form state preserved, no crash
7. Dismiss error banner with × button
8. Re-enable network, retry — verify success
