from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
import os
from dotenv import load_dotenv
from sqlalchemy import text

# Load environment variables FIRST
load_dotenv()  # This is the missing line that was causing DATABASE_URL to be wrong/default

# Database URL from environment variable (with fallback for safety)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://todo_user:todo123@localhost:5432/todoapp"  # use your actual user/pass here as fallback
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=False)  # echo=True for debugging SQL queries

def create_db_and_tables():
    """Create all database tables defined in models.py"""
    # Create all tables from the current models
    # This will only create tables that don't already exist
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency to get a database session for each request"""
    with Session(engine) as session:
        yield session