# Fixing Google OAuth Redirect URI Mismatch Error

## Problem
You're encountering a "Error 400: redirect_uri_mismatch" when trying to log in with Google. This error occurs when the redirect URI configured in your Google Cloud Console application doesn't match the URI being used by your application.

## Root Cause
The issue is that your application and Google Cloud Console have mismatched redirect URIs:
- Your application is configured to use: `http://localhost:8000/auth/google/callback`
- Your Google Cloud Console application may be configured with a different redirect URI

## Solution Steps

### 1. Update Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID (should be `209046205664-lf0jn9n2ls29rtucl8aofhd2tiis1q9f.apps.googleusercontent.com`)
5. Click "Edit" on your OAuth 2.0 Client ID
6. In the "Authorized redirect URIs" section, make sure you have:
   - `http://localhost:8000/auth/google/callback`
7. Click "Save"

### 2. Verify Environment Variables
The following environment variables have been updated in your project:

**Backend (.env file):**
- `BACKEND_URL=http://localhost:8000` (was `http://localhost:8080`)

**Frontend (.env file):**
- `NEXT_PUBLIC_API_URL=http://localhost:8000` (should already be set)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=209046205664-lf0jn9n2ls29rtucl8aofhd2tiis1q9f.apps.googleusercontent.com`

### 3. Restart Your Applications
After making these changes:
1. Stop your running backend and frontend applications
2. Restart your backend: `cd backend && uvicorn main:app --reload --port 8000`
3. Restart your frontend: `cd frontend && npm run dev` (or your equivalent command)

### 4. Test the Fix
Try logging in with Google again. The redirect URI mismatch error should now be resolved.

## Additional Notes
- Make sure both your backend and frontend are running on the correct ports (8000 and 3000 respectively)
- If you're running the backend on a different port, update the `BACKEND_URL` in `backend/.env` and the redirect URI in Google Cloud Console accordingly
- The redirect URI in Google Cloud Console must match exactly what your application uses (including protocol, domain, port, and path)