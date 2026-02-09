# OAuth Setup Instructions

## Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API)
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" > "OAuth 2.0 Client IDs"
6. Set Application Type to "Web application"
7. In "Authorized redirect URIs", add:
   - `http://localhost:8000/auth/google/callback`
8. Download the credentials JSON file and extract the client ID and secret
9. Add these to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## GitHub OAuth Configuration

1. Go to [GitHub Settings](https://github.com/settings/profile)
2. Go to "Developer settings" in the left sidebar
3. Click "OAuth Apps" or "GitHub Apps"
4. Click "New OAuth App"
5. Fill in the details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:8000/auth/github/callback`
6. Click "Register Application"
7. Copy the Client ID and Client Secret
8. Add these to your `.env` file:
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following:

```
SECRET_KEY=your-super-secret-key-change-this-in-production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/todoapp
```

## Running the Application

1. Make sure you're in the backend directory:
   ```bash
   cd /path/to/backend
   ```

2. Activate your virtual environment:
   ```bash
   source venv/bin/activate
   ```

3. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

## Testing OAuth

1. Make sure your frontend is running on `http://localhost:3000`
2. Your backend should be running on `http://localhost:8000`
3. Visit `http://localhost:8000/docs` to access the API documentation
4. Test the OAuth endpoints:
   - Google: `/auth/google`
   - GitHub: `/auth/github`
   - View all users: `/admin/users` (requires authentication)