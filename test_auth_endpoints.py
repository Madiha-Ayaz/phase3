#!/usr/bin/env python3
"""
Test script to verify authentication endpoints are working properly
"""

import os
import requests
from dotenv import load_dotenv
import uuid
import time

# Load environment variables
load_dotenv('/mnt/c/phase-3-hackathon-todo-app/.env')

def test_auth_endpoints():
    print("🧪 Testing Authentication Endpoints...")
    
    # Get backend URL from environment
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
    print(f"📡 Testing against: {backend_url}")
    
    # Test root endpoint
    print("\n1️⃣  Testing root endpoint...")
    try:
        response = requests.get(f"{backend_url}")
        if response.status_code == 200:
            print("✅ Root endpoint: OK")
            print(f"   Response: {response.json().get('message', 'N/A')}")
        else:
            print(f"❌ Root endpoint: Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint: Error - {str(e)}")
    
    # Test health endpoint
    print("\n2️⃣  Testing health endpoint...")
    try:
        response = requests.get(f"{backend_url}/health")
        if response.status_code == 200:
            print("✅ Health endpoint: OK")
            print(f"   Status: {response.json().get('status', 'N/A')}")
        else:
            print(f"❌ Health endpoint: Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint: Error - {str(e)}")
    
    # Test OAuth endpoints
    print("\n3️⃣  Testing OAuth endpoints...")
    try:
        # Test Google OAuth initiation
        response = requests.get(f"{backend_url}/auth/google")
        if response.status_code in [302, 307]:  # Redirect
            print("✅ Google OAuth endpoint: OK (redirect expected)")
        elif response.status_code == 501:  # Not implemented
            print("⚠️  Google OAuth endpoint: Not configured (expected if credentials missing)")
        else:
            print(f"❌ Google OAuth endpoint: Unexpected status {response.status_code}")
    except Exception as e:
        print(f"❌ Google OAuth endpoint: Error - {str(e)}")
    
    try:
        # Test GitHub OAuth initiation
        response = requests.get(f"{backend_url}/auth/github")
        if response.status_code in [302, 307]:  # Redirect
            print("✅ GitHub OAuth endpoint: OK (redirect expected)")
        elif response.status_code == 501:  # Not implemented
            print("⚠️  GitHub OAuth endpoint: Not configured (expected if credentials missing)")
        else:
            print(f"❌ GitHub OAuth endpoint: Unexpected status {response.status_code}")
    except Exception as e:
        print(f"❌ GitHub OAuth endpoint: Error - {str(e)}")
    
    # Test logout endpoint (without token - should return 401 or handle gracefully)
    print("\n4️⃣  Testing logout endpoint...")
    try:
        response = requests.post(f"{backend_url}/auth/logout", 
                                headers={'Authorization': 'Bearer invalid-token'})
        if response.status_code in [401, 200]:  # Either unauthorized or acknowledged
            print("✅ Logout endpoint: OK (handles invalid tokens properly)")
        else:
            print(f"❌ Logout endpoint: Unexpected status {response.status_code}")
    except Exception as e:
        print(f"❌ Logout endpoint: Error - {str(e)}")
    
    # Test refresh endpoint (without token - should return 401)
    print("\n5️⃣  Testing refresh endpoint...")
    try:
        response = requests.post(f"{backend_url}/auth/refresh", 
                                 headers={'Authorization': 'Bearer invalid-token'})
        if response.status_code == 401:  # Unauthorized is expected for invalid token
            print("✅ Refresh endpoint: OK (handles invalid tokens properly)")
        else:
            print(f"❌ Refresh endpoint: Expected 401, got {response.status_code}")
    except Exception as e:
        print(f"❌ Refresh endpoint: Error - {str(e)}")
    
    print("\n📋 Authentication endpoints test completed!")
    print("\n💡 Note: OAuth endpoints may show 'not configured' if Google/GitHub credentials are not set in environment variables.")
    print("   This is expected behavior when credentials are missing.")

if __name__ == "__main__":
    test_auth_endpoints()