#!/usr/bin/env python3
"""
Script to check OAuth configuration and help troubleshoot redirect URI issues
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=== OAuth Configuration Check ===")
print()

# Check required environment variables
required_vars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'BACKEND_URL',
    'FRONTEND_URL'
]

missing_vars = []
for var in required_vars:
    value = os.getenv(var)
    if not value or value == 'your_google_client_id' or value == 'your_google_client_secret':
        missing_vars.append(var)
    print(f"{var}: {'SET' if value and value != 'your_google_client_id' and value != 'your_google_client_secret' else 'NOT SET/DEFAULT'}")

print()

if missing_vars:
    print(f"❌ Missing or default environment variables: {', '.join(missing_vars)}")
    print("Please update your .env file with proper values.")
else:
    print("✅ All required environment variables are set")

print()

# Check redirect URI
backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
expected_redirect_uri = f"{backend_url}/auth/google/callback"
print(f"Expected Google OAuth redirect URI: {expected_redirect_uri}")

print()
print("=== Action Required ===")
print("Please verify this exact redirect URI is registered in Google Cloud Console:")
print(f"  {expected_redirect_uri}")
print()
print("Steps to verify in Google Cloud Console:")
print("1. Go to https://console.cloud.google.com/apis/credentials")
print("2. Find your OAuth 2.0 Client ID")
print("3. Click 'Edit'")
print("4. Under 'Authorized redirect URIs', verify the above URI is listed")
print("5. If not present, add it and click 'Save'")
print()
print("After updating Google Cloud Console, restart your backend server.")

# Additional checks
print()
print("=== Additional Checks ===")
print(f"Frontend URL: {os.getenv('FRONTEND_URL', 'NOT SET')}")
print(f"API URL (from frontend): {os.getenv('NEXT_PUBLIC_API_URL', 'NOT SET')}")
print(f"Google Client ID: {os.getenv('GOOGLE_CLIENT_ID', 'NOT SET')[:20]}...")

# Check if URLs are consistent
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
api_url = os.getenv('NEXT_PUBLIC_API_URL', 'http://localhost:8000')

if backend_url != api_url:
    print(f"⚠️  Backend URL ({backend_url}) doesn't match API URL ({api_url})")
    print("   This might cause issues with the authentication flow")
else:
    print("✅ Backend URL matches API URL")