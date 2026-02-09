# Setting up Google OAuth for Your Todo App

## Step 1: Get Your Neon Database Connection String

1. Log in to your Neon account at https://console.neon.tech/
2. Create a new project or select an existing one
3. Go to Project Settings > Connection Details
4. Copy the connection string in the format:
   `postgresql://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require`
5. Replace the DATABASE_URL in your `.env` file with this connection string

## Step 2: Configure Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API)
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set up the application type as "Web application"
6. Add the following redirect URIs:
   - `http://localhost:8000/auth/google/callback`
   - `http://127.0.0.1:8000/auth/google/callback`
   - If deployed: `https://your-deployed-url.com/auth/google/callback`

## Step 3: Update Your Environment Variables

Update your `.env` file with the actual values:

```
# Database Configuration
DATABASE_URL=postgresql://your_actual_username:your_actual_password@ep-actual-endpoint.aws.neon.tech/your_actual_database?sslmode=require

# OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# JWT Secret (change this in production)
SECRET_KEY=your-actual-super-secret-jwt-key-change-this-in-production

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
```

## Step 4: Install Required Dependencies

Make sure you have all required packages:

```bash
pip install sqlmodel sqlalchemy psycopg2-binary python-dotenv passlib[bcrypt] python-jose[cryptography] httpx python-multipart
```

## Step 5: Test the Database Connection

Run the test script to verify the database connection:

```bash
cd /mnt/c/phase-3-hackathon-todo-app
python test_database.py
```

## Step 6: Run the Application

Start the backend server:

```bash
cd /mnt/c/phase-3-hackathon-todo-app/backend
uvicorn main:app --reload --port 8000
```

## Troubleshooting Common Issues

### Issue: 404 after Google Auth Redirect
- Make sure your Google OAuth redirect URI exactly matches what's registered in Google Cloud Console
- Check that BACKEND_URL in your .env file matches the URL where your backend is running
- Verify that the callback endpoint `/auth/google/callback` exists in your main.py (it should)

### Issue: Data Not Showing in Database
- Ensure the database tables are created by running the application once
- Check that your Neon database connection string is correct
- Verify that SSL mode is set to 'require' for Neon databases

### Issue: Database Connection Errors
- Make sure your Neon database allows connections from your IP
- Verify that the username, password, and database name are correct
- Check that the endpoint URL is correct

## Verification Steps

After setting everything up:

1. Visit `http://localhost:8000` to check if the backend is running
2. Visit `http://localhost:8000/docs` to access the API documentation
3. Try registering a user via the `/auth/register` endpoint
4. Test the Google OAuth flow by visiting `/auth/google`
5. Check your Neon dashboard to see if data is being inserted into the database tables