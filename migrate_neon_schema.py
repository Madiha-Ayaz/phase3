#!/usr/bin/env python3
"""
Database Migration Script for Neon PostgreSQL
Fixes the schema mismatch issue where columns are missing from the user table
"""

import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session
from sqlalchemy import text

# Load environment variables
load_dotenv('/mnt/c/phase-3-hackathon-todo-app/.env')

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
        
        # Verify the columns exist
        print("\n🔍 Verifying columns exist...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'user' 
                AND column_name IN ('hashed_password', 'provider', 'first_name', 'last_name')
                ORDER BY column_name;
            """))
            
            columns = result.fetchall()
            print("Columns found in user table:")
            for col in columns:
                print(f"  • {col[0]}: {col[1]}, nullable: {col[2]}, default: {col[3]}")
        
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