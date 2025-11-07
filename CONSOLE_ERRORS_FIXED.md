# Console Errors Fixed

This document summarizes the console errors that were identified and fixed.

## Issues Fixed

### 1. Empty String in Image `src` Attribute ✅

**Error:**
```
An empty string ("") was passed to the src attribute. 
This may cause the browser to download the whole page again over the network.
```

**Root Cause:**
- The editor page (`app/editor/[slug]/page.tsx`) was using `<AdBanner type="article-side" />` without providing the required `imageUrl` prop
- This caused the AdBanner component to try rendering an image with an empty string

**Fix:**
- Changed from `<AdBanner>` to `<AdBannerFetcher>` in the editor page
- Added null check in `AdBanner` component to return `null` if imageUrl is empty or invalid

**Files Modified:**
- `app/editor/[slug]/page.tsx` - Changed to use AdBannerFetcher
- `components/ad-banner.tsx` - Added validation check

### 2. Image Missing Required `src` Property ✅

**Error:**
```
Image is missing required "src" property: {}
```

**Root Cause:**
- Same as issue #1 - AdBanner was being used without proper props

**Fix:**
- Same fix as issue #1 - using AdBannerFetcher which properly fetches banner data

### 3. NextAuth ClientFetchError (JSON Parse Error) ✅

**Error:**
```
JSON.parse: unexpected end of data at line 1 column 1 of the JSON data
Read more at https://errors.authjs.dev#autherror
```

**Root Cause:**
- The app uses NextAuth v5 beta (5.0.0-beta.30) but didn't have proper configuration
- NextAuth v5 has a completely different API from v4
- The old configuration was attempting v4-style setup which doesn't work with v5
- When the `SessionProvider` tried to fetch session data, it received malformed responses

**Fix:**
- Created new `auth.ts` at project root following NextAuth v5 conventions
- Configured Google OAuth provider properly
- Updated API route to use v5-style handlers export
- Added required environment variables to templates
- Created setup documentation

**Files Created:**
- `auth.ts` - New NextAuth v5 configuration
- `GOOGLE_OAUTH_SETUP.md` - Setup guide for Google OAuth
- `env.local.example` - Development environment template

**Files Modified:**
- `app/api/auth/[...nextauth]/route.ts` - Updated to use v5 handlers
- `env.production.template` - Added Google OAuth variables

**Files Deleted:**
- `lib/next-auth.ts` - Old v4-style configuration (no longer needed)

## Configuration Required

To use Google authentication, you need to set up Google OAuth credentials:

1. Follow the guide in `GOOGLE_OAUTH_SETUP.md`
2. Add these environment variables:
   - `GOOGLE_CLIENT_ID` - From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
   - `AUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)

## Features Using Authentication

The following features require user authentication via Google OAuth:
- User sign-in
- Article comments
- Article likes
- Personalized recommendations

## Development Without OAuth

If you don't want to set up Google OAuth immediately for development:
- The app will still work for browsing articles
- Features requiring authentication (comments, likes) won't function
- No console errors will appear as long as `AUTH_SECRET` is set

## Testing

1. Copy `env.local.example` to `.env.local`
2. Fill in the Google OAuth credentials (or leave them empty for basic testing)
3. Set `AUTH_SECRET` to any random string for development
4. Run `npm run dev`
5. No console errors should appear

## Security Notes

- Never commit `.env.local` to version control
- Use strong random values for `AUTH_SECRET` in production
- Keep `GOOGLE_CLIENT_SECRET` secure
- Rotate secrets periodically

