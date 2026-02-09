# OAuth Setup Guide

This document explains how to set up Google and GitHub OAuth for the Todo App.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API)
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URIs:
   - `http://localhost:8000/auth/google/callback`
6. Download the credentials and add them to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set the homepage URL to `http://localhost:3000`
4. Set the authorization callback URL to `http://localhost:8000/auth/github/callback`
5. Add the credentials to your `.env` file:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Environment Variables

Make sure your backend `.env` file has these variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

And your frontend `.env` file should have:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## OAuth Flow

The OAuth flow works as follows:

1. User clicks "Sign in with Google" or "Sign in with GitHub" on the login page
2. The frontend redirects to the backend OAuth endpoint
3. The backend redirects to the OAuth provider (Google/GitHub)
4. After user authenticates, the OAuth provider redirects back to the backend
5. The backend exchanges the authorization code for an access token
6. The backend creates a JWT token and redirects to the frontend callback URL with the token
7. The frontend receives the token in the callback URL and stores it in localStorage
8. The user is redirected to the dashboard

## Frontend Components

- `frontend/src/app/login/page.tsx` - Login page with OAuth buttons
- `frontend/src/app/register/page.tsx` - Registration page with OAuth options
- `frontend/src/app/auth/callback/page.tsx` - Handles OAuth callback and token storage
- `frontend/src/lib/auth.ts` - Authentication utilities
- `frontend/src/app/dashboard/page.tsx` - Protected dashboard page
- `app/page.tsx` - Main redirect page based on authentication status

## Backend Endpoints

- `GET /auth/google` - Initiates Google OAuth flow
- `GET /auth/google/callback` - Handles Google OAuth callback
- `GET /auth/github` - Initiates GitHub OAuth flow
- `GET /auth/github/callback` - Handles GitHub OAuth callback
- `POST /auth/login` - Email/password login
- `POST /auth/register` - Email/password registration
- `GET /auth/me` - Get current user info

## Error Handling

The OAuth flow includes proper error handling:

- Network errors
- Invalid credentials
- OAuth provider errors
- Token validation failures
- Redirect failures

## Security Considerations

- JWT tokens are stored in localStorage (consider using httpOnly cookies in production)
- OAuth provider validation is performed on the backend
- Proper CORS configuration is set up
- Tokens are validated before accessing protected resources