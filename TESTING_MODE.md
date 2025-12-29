# Testing Mode Configuration

Authentication has been temporarily disabled for testing purposes.

## What Changed

### 1. AuthContext (`src/contexts/AuthContext.tsx`)
- Added `TESTING_MODE = true` flag
- Created a mock user with ID: `test-user-id-123`
- Email: `test@example.com`
- Bypassed all Supabase authentication calls
- Added console warning when testing mode is active

### 2. ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- Added `TESTING_MODE = true` flag
- Bypasses authentication checks and always renders children
- No redirect to sign-in page

## How to Use

### Enable Testing Mode (Current State)
The app is currently in testing mode. You can:
- Access all pages without signing in
- Browse the app as if you're logged in as `test@example.com`
- Test all features without authentication barriers

### Disable Testing Mode (Restore Authentication)
To re-enable authentication, change `TESTING_MODE` to `false` in both files:

**File 1: `src/contexts/AuthContext.tsx` (line 25)**
```typescript
const TESTING_MODE = false; // Change from true to false
```

**File 2: `src/components/ProtectedRoute.tsx` (line 10)**
```typescript
const TESTING_MODE = false; // Change from true to false
```

## Important Notes

⚠️ **Database Operations**: The mock user ID (`test-user-id-123`) doesn't exist in the database. Some operations may fail or return empty results. You may need to:
- Manually create this user in the database, OR
- Modify database queries to work with mock data, OR
- Use a real user ID from your database

⚠️ **Production**: Do NOT deploy with `TESTING_MODE = true`. This bypasses all security and authentication.

⚠️ **Console Warning**: When testing mode is active, you'll see an orange warning in the browser console: "🧪 TESTING MODE ENABLED - Authentication Bypassed"

## Testing Checklist

With testing mode enabled, you can now test:
- ✅ Browse Homes view
- ✅ Add Home modal and functionality
- ✅ Home cards and interactions
- ✅ Compare mode
- ✅ All navigation
- ✅ Settings and other features

## Recommended Next Steps

1. **Test the new Browse Homes feature** - Add homes, toggle favorites, use compare mode
2. **Check database connectivity** - Ensure Supabase queries work with the mock user
3. **Re-enable authentication** - Set both flags to `false` when done testing
4. **Verify authentication flow** - Test sign-in/sign-up after re-enabling

## Quick Toggle Script

You can create a script to quickly toggle testing mode:

```bash
# Enable testing mode
sed -i 's/TESTING_MODE = false/TESTING_MODE = true/g' src/contexts/AuthContext.tsx src/components/ProtectedRoute.tsx

# Disable testing mode
sed -i 's/TESTING_MODE = true/TESTING_MODE = false/g' src/contexts/AuthContext.tsx src/components/ProtectedRoute.tsx
```
