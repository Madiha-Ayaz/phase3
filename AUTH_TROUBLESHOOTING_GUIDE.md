# Complete Authentication Troubleshooting Guide

## Current Configuration Status
Your application environment variables (in `backend/.env`) are configured as:
- BACKEND_URL: `http://localhost:8000`
- FRONTEND_URL: `http://localhost:3000`
- GOOGLE_CLIENT_ID: `209046205664-lf0jn9n2ls29rtucl8aofhd2tiis1q9f.apps.googleusercontent.com`
- GITHUB_CLIENT_ID: `Ov23liTBocjc4vv1brYG` (Note: This appears to be a placeholder - you'll need to set up your own GitHub OAuth app)

## Required OAuth Redirect URIs

### For Google OAuth:
- Expected redirect URI: `http://localhost:8000/auth/google/callback`
- This must be registered in Google Cloud Console

### For GitHub OAuth:
- Expected redirect URI: `http://localhost:8000/auth/github/callback`
- This must be registered in GitHub OAuth App settings
- **IMPORTANT:** The current GitHub client ID in your .env file (`Ov23liTBocjc4vv1brYG`) appears to be a placeholder. You need to create your own GitHub OAuth application.

## Step-by-Step Setup for Google OAuth

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com/
   - Select your project or create a new one
   - Navigate to "APIs & Services" > "Credentials"

2. **Create or Edit OAuth 2.0 Client ID:**
   - If creating new: Click "Create Credentials" > "OAuth 2.0 Client ID"
   - If editing existing: Find your OAuth 2.0 Client ID and click "Edit"
   - For application type, select "Web application"

3. **Configure Authorized Redirect URIs:**
   - Add this exact URI: `http://localhost:8000/auth/google/callback`
   - Click "Save"

4. **Update Environment Variables (if creating new):**
   - If you created a new OAuth app, copy the Client ID and Client Secret
   - Update your backend `.env` file:
     - `GOOGLE_CLIENT_ID=your_new_client_id`
     - `GOOGLE_CLIENT_SECRET=your_new_client_secret`
   - The values should match what you see in Google Cloud Console

**Note:** Your current Google OAuth is already configured with client ID: `209046205664-lf0jn9n2ls29rtucl8aofhd2tiis1q9f.apps.googleusercontent.com`

## Step-by-Step Setup for GitHub OAuth

1. **Go to GitHub Settings:**
   - Visit https://github.com/settings/profile
   - Navigate to "Developer settings" > "OAuth Apps"

2. **Create a New OAuth App:**
   - Click "New OAuth App"
   - Fill in the application details:
     - Application name: "Todo App" (or whatever you prefer)
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:8000/auth/github/callback`

3. **Get Your Client Credentials:**
   - After creating the app, you'll see your Client ID and Client Secret
   - Copy both values

4. **Update Environment Variables:**
   - Update your backend `.env` file:
     - Replace `GITHUB_CLIENT_ID=Ov23liTBocjc4vv1brYG` with your actual Client ID
     - Replace `GITHUB_CLIENT_SECRET=5fcfdff101e12c57182977f8dceb007233d586dd` with your actual Client Secret
   - The values should match what you see in GitHub OAuth App settings

5. **Save the .env file and restart your backend server**

## Common Issues and Solutions

### Issue 1: "redirect_uri_mismatch" Error
**Cause:** The redirect URI registered in the OAuth provider doesn't match what your application is requesting.
**Solution:** Ensure the exact URIs are registered in Google Cloud Console and GitHub OAuth Apps as specified above.

### Issue 2: Application Not Running on Correct Ports
**Check:** Make sure your backend is running on port 8000 and frontend on port 3000
**Backend command:** `uvicorn main:app --reload --port 8000`
**Frontend command:** `npm run dev` (or `npm run dev --port 3000`)

### Issue 3: Environment Variables Not Loaded
**Solution:** Make sure to restart your backend server after updating the `.env` file

## Testing the Fix

1. **Verify your Google Cloud Console:**
   - Log in to Google Cloud Console
   - Go to APIs & Services > Credentials
   - Verify your OAuth 2.0 Client ID has `http://localhost:8000/auth/google/callback` in authorized redirect URIs

2. **Verify your GitHub OAuth App:**
   - Go to GitHub Developer Settings
   - Verify your OAuth App has `http://localhost:8000/auth/github/callback` as the callback URL

3. **Restart your applications:**
   - Stop both backend and frontend
   - Start backend: `cd backend && uvicorn main:app --reload --port 8000`
   - Start frontend: `cd frontend && npm run dev`
   - Make sure both are running on the correct ports

4. **Test the authentication:**
   - Go to your frontend application (usually http://localhost:3000)
   - Try clicking "Sign in with Google" or "Sign in with GitHub"
   - You should be redirected to the respective OAuth provider
   - After authentication, you should be redirected back to your app and logged in

## Debugging Tips

If you're still having issues:

1. **Check backend logs:** Look for log messages when you initiate OAuth flow
2. **Check browser developer tools:** Look for network errors or redirects
3. **Verify all environment variables** are set correctly in both backend and frontend
4. **Make sure ports are available** and not used by other applications

## Important Notes

- The backend URL in your `.env` file must match the URL where your backend server is running
- The redirect URIs in OAuth providers must match exactly (including protocol, domain, port, and path)
- After any configuration changes, restart your backend server