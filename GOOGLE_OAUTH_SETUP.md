# Google OAuth Setup Guide

This application uses Google OAuth for user authentication (sign-in, comments, likes, recommendations).

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity)

### 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required information:
   - App name: `AI Tech News` (or your site name)
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### 3. Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: `AI Tech News Web Client`
   - **Authorized JavaScript origins**:
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`
   - **Authorized redirect URIs**:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
5. Click **Create**
6. Save the **Client ID** and **Client Secret**

### 4. Configure Environment Variables

#### For Development (.env.local)
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
AUTH_SECRET=your_random_secret_here
```

#### For Production
Add these to your production environment (AWS Lightsail, Vercel, etc.):
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
AUTH_SECRET=your_random_secret_here
```

### 5. Generate AUTH_SECRET

Run this command to generate a secure random secret:
```bash
openssl rand -base64 32
```

## Testing

1. Start your development server: `npm run dev`
2. Navigate to your site
3. Click the "Sign In" button
4. You should be redirected to Google's OAuth consent screen
5. After granting permissions, you'll be redirected back to your site

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"
- Make sure you've configured the OAuth consent screen
- Verify your redirect URIs match exactly

### Error: "Invalid client: Unauthorized redirect_uri"
- Check that your authorized redirect URIs include:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://yourdomain.com/api/auth/callback/google` (production)

### Error: "The client is not authorized to request an authorization code"
- Enable the Google+ API or Google Identity in your Google Cloud project

### JSON Parse Error in Console
- Make sure all environment variables are set correctly
- Verify `AUTH_SECRET` is set
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are valid

## Features Using Authentication

The following features require Google OAuth authentication:
- **User Sign In** - Users can sign in with their Google account
- **Comments** - Users must be signed in to post comments on articles
- **Likes** - Users must be signed in to like articles
- **Recommendations** - Personalized article recommendations based on user activity

## Development Without OAuth (Optional)

If you want to develop without setting up Google OAuth immediately:
1. Comment out the `signIn` button in the header component
2. Mock the session in components that use `useSession()`
3. Note: Comments, likes, and other auth-dependent features won't work

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your `GOOGLE_CLIENT_SECRET` secure
- Use a strong random value for `AUTH_SECRET` in production
- Rotate your secrets periodically

