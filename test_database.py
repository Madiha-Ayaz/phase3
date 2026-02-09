#!/usr/bin/env python3
"""
Simple test script to verify database connectivity and data insertion
"""

import asyncio
import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field, create_engine, Session, select
from backend.models import User, Task
from backend.db import get_session, create_db_and_tables
from passlib.context import CryptContext

# Create a test engine
from backend.db import engine

def test_database_connection():
    print("Testing database connection...")
    
    try:
        # Create tables
        create_db_and_tables()
        print("✓ Tables created successfully")
        
        # Create a test user
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash("testpassword123")
        
        with Session(engine) as session:
            # Check if test user already exists
            existing_user = session.exec(select(User).where(User.email == "test@example.com")).first()
            
            if not existing_user:
                test_user = User(
                    email="test@example.com",
                    hashed_password=hashed_password,
                    provider="email",
                    first_name="Test",
                    last_name="User",
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
                title="Test Task",
                description="This is a test task to verify database functionality",
                priority="medium",
                tags=["test", "database"],
                created_at=datetime.utcnow()
            )
            
            session.add(test_task)
            session.commit()
            session.refresh(test_task)
            
            print(f"✓ Test task created with ID: {test_task.id}")
            
            # Query the data back to verify it was saved
            retrieved_task = session.get(Task, test_task.id)
            if retrieved_task:
                print(f"✓ Successfully retrieved task: {retrieved_task.title}")
                print(f"✓ Task belongs to user: {retrieved_task.user.email}")
            
            # Count total users and tasks
            user_count = session.exec(select(User)).all()
            task_count = session.exec(select(Task)).all()
            
            print(f"✓ Total users in database: {len(user_count)}")
            print(f"✓ Total tasks in database: {len(task_count)}")
    
    except Exception as e:
        print(f"✗ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n✓ Database test completed successfully!")
    return True

if __name__ == "__main__":
    test_database_connection()