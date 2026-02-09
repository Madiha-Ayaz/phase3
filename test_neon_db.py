#!/usr/bin/env python3
"""
Test script specifically for Neon database connection
"""

import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session, select
from backend.models import User, Task
from backend.db import create_db_and_tables
from passlib.context import CryptContext
from datetime import datetime
import uuid

# Load environment variables
load_dotenv('/mnt/c/phase-3-hackathon-todo-app/.env')

def test_neon_database_connection():
    print("Testing Neon database connection...")
    
    # Get the database URL from environment
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url or 'neon.tech' not in database_url:
        print("⚠️  WARNING: DATABASE_URL in .env doesn't appear to be a Neon URL")
        print("   Current DATABASE_URL:", database_url)
        print("   Please update your .env file with your actual Neon database URL")
        return False
    
    print(f"Using database URL: {database_url.replace('@', ' [EMAIL_PROTECTED] ').replace(':', ' : ')}")
    
    try:
        # Create engine with the Neon database URL
        engine = create_engine(database_url, echo=True)  # echo=True to see SQL queries
        
        # Test the connection by creating tables
        print("\nCreating database tables...")
        SQLModel.metadata.create_all(engine)
        print("✓ Tables created successfully")
        
        # Test inserting and retrieving data
        print("\nTesting data insertion...")
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash("testpassword123")

        with Session(engine) as session:
            # Check if test user already exists
            existing_user = session.exec(select(User).where(User.email == "neontest@example.com")).first()

            if not existing_user:
                test_user = User(
                    email="neontest@example.com",
                    hashed_password=hashed_password,
                    provider="email",
                    first_name="Neon",
                    last_name="Test",
                    created_at=datetime.utcnow()
                )

                session.add(test_user)
                session.commit()
                session.refresh(test_user)

                print(f"✓ Test user created with ID: {test_user.id}")
            else:
                test_user = existing_user
                print(f"✓ Using existing test user with ID: {test_user.id}")

            # Create a test task for the user
            test_task = Task(
                user_id=test_user.id,
                title="Neon Database Test Task",
                description="This task verifies that the Neon database connection is working properly",
                priority="medium",
                tags=["neon", "test", "database"],
                created_at=datetime.utcnow()
            )

            session.add(test_task)
            session.commit()
            session.refresh(test_task)

            print(f"✓ Test task created with ID: {test_task.id}")

            # Query the data back to verify it was saved in Neon
            retrieved_task = session.get(Task, test_task.id)
            if retrieved_task:
                print(f"✓ Successfully retrieved task from Neon: {retrieved_task.title}")
                print(f"✓ Task belongs to user in Neon: {retrieved_task.user.email}")

            # Count total users and tasks in Neon database
            user_count = session.exec(select(User)).all()
            task_count = session.exec(select(Task)).all()

            print(f"✓ Total users in Neon database: {len(user_count)}")
            print(f"✓ Total tasks in Neon database: {len(task_count)}")

    except Exception as e:
        print(f"✗ Error connecting to Neon database: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

    print("\n✓ Neon database test completed successfully!")
    print("✓ Your data is now stored in the Neon database!")
    return True

if __name__ == "__main__":
    test_neon_database_connection()