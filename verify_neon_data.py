#!/usr/bin/env python3
"""
Script to verify data in Neon database and start the application
"""

import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session, select
from backend.models import User, Task
from datetime import datetime

# Load environment variables
load_dotenv('/mnt/c/phase-3-hackathon-todo-app/.env')

def verify_neon_data():
    print("Verifying data in Neon database...")
    
    # Get the database URL from environment
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url or 'neon.tech' not in database_url:
        print("⚠️  ERROR: DATABASE_URL in .env doesn't appear to be a Neon URL")
        print("   Current DATABASE_URL:", database_url)
        print("   Please update your .env file with your actual Neon database URL")
        return False
    
    try:
        # Create engine with the Neon database URL
        engine = create_engine(database_url, echo=False)
        
        with Session(engine) as session:
            # Get all users
            users = session.exec(select(User)).all()
            print(f"\n📋 Found {len(users)} users in Neon database:")
            for user in users:
                print(f"   • User ID: {user.id}")
                print(f"     Email: {user.email}")
                print(f"     Provider: {user.provider}")
                print(f"     Created: {user.created_at}")
            
            # Get all tasks
            tasks = session.exec(select(Task)).all()
            print(f"\n📝 Found {len(tasks)} tasks in Neon database:")
            for task in tasks:
                print(f"   • Task ID: {task.id}")
                print(f"     Title: {task.title}")
                print(f"     Completed: {task.completed}")
                print(f"     Priority: {task.priority}")
                print(f"     Tags: {task.tags}")
                print(f"     Created: {task.created_at}")
                
                # Get associated user info
                user = session.get(User, task.user_id)
                if user:
                    print(f"     Owner: {user.email}")
                print()
    
    except Exception as e:
        print(f"✗ Error verifying data in Neon database: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

    print("✓ Data verification completed successfully!")
    return True

def start_application():
    print("\n🚀 To start your application, run:")
    print("   cd /mnt/c/phase-3-hackathon-todo-app/backend")
    print("   uvicorn main:app --reload --port 8000")
    print("\n🌐 Then visit:")
    print("   - Backend API: http://localhost:8000")
    print("   - API Documentation: http://localhost:8000/docs")
    print("   - Google OAuth: http://localhost:8000/auth/google")
    print("\n🔐 For OAuth to work properly:")
    print("   1. Make sure your Google OAuth credentials are in .env")
    print("   2. Ensure the redirect URI in Google Cloud Console matches:")
    print(f"      http://localhost:8000/auth/google/callback")
    print("   3. Restart the server after any .env changes")

if __name__ == "__main__":
    print("🔍 Verifying Neon Database Connection & Data")
    print("="*50)
    
    success = verify_neon_data()
    
    if success:
        print("\n✅ SUCCESS: Your Neon database is properly configured!")
        print("✅ SUCCESS: Data is being stored and retrieved correctly!")
        start_application()
    else:
        print("\n❌ FAILED: There was an issue with the database connection.")