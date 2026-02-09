# 🔧 FIX: Google OAuth Error - "column user.hashed_password does not exist"

## 📋 PROBLEM DESCRIPTION
After Google OAuth login succeeds, your app redirects to `/auth/error?provider=google&error=internal_error` with the backend error:
```
(psycopg2.errors.UndefinedColumn) column user.hashed_password does not exist
```

## 🧠 ROOT CAUSE ANALYSIS
This error occurs due to a **database schema mismatch** between your SQLAlchemy/SQLModel models and the actual database tables in Neon:

1. **Schema Evolution Issue**: Your User model defines a `hashed_password` column, but the existing `user` table in Neon doesn't have this column
2. **Migration Problem**: When Google OAuth creates or updates a user, it tries to access the `hashed_password` field which doesn't exist in the database
3. **Table Creation Timing**: The database tables were likely created with an older version of the model that didn't include all the required columns

## ✅ SOLUTION: Schema Migration

### STEP 1: Update Your .env File
First, update your `.env` file with your **actual** Neon database credentials:

```bash
# Database Configuration
# REPLACE WITH YOUR ACTUAL NEON CONNECTION STRING
DATABASE_URL=postgresql://your_username:your_actual_password@ep-your-actual-endpoint.us-east-1.aws.neon.tech/your_actual_database_name?sslmode=require

# OAuth Configuration
GOOGLE_CLIENT_ID=your_real_google_client_id
GOOGLE_CLIENT_SECRET=your_real_google_client_secret

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### STEP 2: Run Manual SQL Migration
Connect to your Neon database and run these SQL commands to add the missing columns:

```sql
-- Add missing columns to the user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'email';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bio VARCHAR(500);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'dark';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Create the enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'providerenum') THEN
        CREATE TYPE providerenum AS ENUM ('email', 'google', 'github');
    END IF;
END$$;

-- Change provider column to use the enum type
ALTER TABLE "user" ALTER COLUMN provider TYPE providerenum 
USING CASE 
    WHEN provider = 'email' THEN 'email'::providerenum
    WHEN provider = 'google' THEN 'google'::providerenum
    WHEN provider = 'github' THEN 'github'::providerenum
    ELSE 'email'::providerenum
END;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_provider ON "user"(provider);
```

### STEP 3: Alternative - Python Migration Script
If you prefer to run the migration via Python, update your .env with real credentials and run:

```python
#!/usr/bin/env python3
"""
Database Migration Script for Neon PostgreSQL
Fixes the schema mismatch issue where columns are missing from the user table
"""

import os
from dotenv import load_dotenv
from sqlmodel import create_engine
from sqlalchemy import text

# Load environment variables
load_dotenv('.env')

def run_migration():
    print("🔧 Starting database migration to fix schema mismatch...")
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return False
    
    print(f"📡 Connecting to database...")
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Execute migration SQL
        with engine.connect() as conn:
            # Begin transaction
            with conn.begin() as trans:
                print("📝 Adding missing columns to user table...")
                
                # Add missing columns
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'email';
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bio VARCHAR(500);
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS location VARCHAR(100);
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'dark';
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                """))
                
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
                """))
                
                print("🔄 Updating provider column to use enum type...")
                
                # Create enum type if it doesn't exist
                conn.execute(text("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'providerenum') THEN
                            CREATE TYPE providerenum AS ENUM ('email', 'google', 'github');
                        END IF;
                    END$$;
                """))
                
                # Change provider column to use the enum type
                conn.execute(text("""
                    ALTER TABLE "user" ALTER COLUMN provider TYPE providerenum 
                    USING CASE 
                        WHEN provider = 'email' THEN 'email'::providerenum
                        WHEN provider = 'google' THEN 'google'::providerenum
                        WHEN provider = 'github' THEN 'github'::providerenum
                        ELSE 'email'::providerenum
                    END;
                """))
                
                # Create indexes
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
                """))
                
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_user_provider ON "user"(provider);
                """))
                
                print("✅ Migration completed successfully!")
        
        return True
                
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Running Neon Database Migration")
    print("="*50)
    
    success = run_migration()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("💡 Your database schema now matches the User model")
        print("🔗 Google OAuth should now work without the 'hashed_password does not exist' error")
    else:
        print("\n💥 Migration failed!")
        print("📋 Please check your database connection and credentials")
```

### STEP 4: Correct User Model (For Reference)
Your User model in `models.py` should look like this:

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid
from pydantic import BaseModel, EmailStr
from enum import Enum
from sqlalchemy import TEXT
import sqlalchemy as sa
from sqlalchemy.types import Enum as SAEnum  # For database enum type

class ProviderEnum(str, Enum):
    email = "email"
    google = "google"
    github = "github"

class User(SQLModel, table=True):
    __tablename__ = "user"  # Explicit lowercase table name for PostgreSQL

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: Optional[str] = Field(default=None, max_length=255)
    provider: ProviderEnum = Field(default=ProviderEnum.email, sa_column=sa.Column(SAEnum(ProviderEnum), nullable=False))
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    location: Optional[str] = Field(default=None, max_length=100)
    timezone: Optional[str] = Field(default="UTC", max_length=50)
    theme_preference: Optional[str] = Field(default="dark", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = Field(default=None)

    # Relationships to tasks and conversations
    tasks: List["Task"] = Relationship(back_populates="user")
    conversations: List["Conversation"] = Relationship(back_populates="user")
```

## 🚀 POST-MIGRATION STEPS

1. **Restart your backend server** after updating the .env file
2. **Test Google OAuth** again - it should now work without the error
3. **Verify the user table** has all required columns by querying it

## 🔍 VERIFICATION COMMANDS

After migration, you can verify the columns exist:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('hashed_password', 'provider', 'email', 'first_name', 'last_name', 'created_at')
ORDER BY column_name;
```

## 🎉 CONCLUSION

This migration will fix the schema mismatch issue and allow Google OAuth to work properly. The `hashed_password` column (and other missing columns) will be added to your Neon database, resolving the "column does not exist" error.