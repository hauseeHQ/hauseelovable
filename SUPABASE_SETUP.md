# Supabase Magic Link Setup Guide

## Auth Callback Flow

The app uses Supabase Magic Link (passwordless email OTP) authentication. Here's how it works:

### Flow:
1. User enters email on `/signin` or `/signup`
2. Supabase sends magic link email
3. User clicks link in email
4. Browser redirects to `/auth/callback?code=...`
5. `AuthCallbackPage.tsx` exchanges code for session
6. User is redirected to `/plan` (or returnTo location)

### AuthCallbackPage.tsx
The callback page:
- Extracts `code` from URL query params
- Calls `supabase.auth.exchangeCodeForSession(window.location.href)`
- Checks for session
- Redirects to `/plan` (or `returnTo` from state/query params)

## Supabase Dashboard Configuration

### Whitelist These URLs:

In your Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
http://localhost:5173
```
(or your production URL)

**Redirect URLs:**
```
http://localhost:5173/auth/callback
https://yourdomain.com/auth/callback
```

### Email Templates

The default Supabase email template works, but you can customize it in:
Supabase Dashboard → Authentication → Email Templates → Magic Link

### Environment Variables

Make sure these are set in your `.env`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:5173/signin`
3. Enter your email
4. Check your email for magic link
5. Click the link
6. Should redirect to `/auth/callback` then `/plan`

## Troubleshooting

- **Redirect loop**: Check that `/auth/callback` is whitelisted in Supabase
- **"Invalid redirect URL"**: Add your callback URL to Redirect URLs in Supabase dashboard
- **Code not exchanging**: Check browser console for errors, verify Supabase URL/key are correct

