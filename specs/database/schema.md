# Database Schema Specification

## 1. Overview

This document specifies the database schema for the Full-Stack Web Application. It defines the core data models for User and Task entities with their relationships, constraints, and indexing strategies.

## 2. Database Technology

- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel
- **Connection**: Connection pooling with appropriate timeout settings

## 3. User Model

### 3.1 Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the user |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| hashed_password | VARCHAR(255) | NULLABLE | Hashed password (nullable for OAuth users) |
| provider | VARCHAR(20) | NOT NULL, CHECK(in list) | Authentication provider ('email', 'google', 'github') |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | When the user account was created |
| last_login | TIMESTAMP WITH TIME ZONE | NULLABLE | When the user last logged in |

### 3.2 Constraints
- Primary Key: id
- Unique Constraint: email (to prevent duplicate email registration)
- Check Constraint: provider must be one of 'email', 'google', 'github'
- Not Null: id, email, provider, created_at

### 3.3 Indexes
- `idx_users_email`: Index on email field for efficient lookups during authentication
- `idx_users_provider`: Index on provider field for filtering by authentication method

### 3.4 SQL Definition
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NULL,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('email', 'google', 'github')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
```

### 3.5 SQLModel Definition (Python)
```python
from sqlmodel import SQLModel, Field, Column
from typing import Optional
from datetime import datetime
import uuid

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(sa_column=Column("email", String, nullable=False, unique=True))
    hashed_password: Optional[str] = Field(sa_column=Column("hashed_password", String, nullable=True))
    provider: str = Field(sa_column=Column("provider", String, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    last_login: Optional[datetime] = Field(nullable=True)

    __table_args__ = (
        CheckConstraint("provider IN ('email', 'google', 'github')", name="valid_provider"),
    )
```

## 4. Task Model

### 4.1 Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the task |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to the user who owns the task |
| title | VARCHAR(255) | NOT NULL | Title of the task |
| description | TEXT | NULLABLE | Detailed description of the task |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether the task is completed |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium', CHECK(in list) | Priority level ('low', 'medium', 'high') |
| tags | TEXT[] | NULLABLE | Array of tags associated with the task |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | When the task was created |

### 4.2 Constraints
- Primary Key: id
- Foreign Key: user_id references users(id) with CASCADE delete
- Not Null: id, user_id, title, completed, created_at
- Check Constraint: priority must be one of 'low', 'medium', 'high'

### 4.3 Indexes
- `idx_tasks_user_id`: Index on user_id for efficient user task retrieval
- `idx_tasks_completed`: Index on completed field for filtering by completion status
- `idx_tasks_priority`: Index on priority field for sorting and filtering
- `idx_tasks_created_at`: Index on created_at for chronological ordering

### 4.4 SQL Definition
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

### 4.5 SQLModel Definition (Python)
```python
from sqlmodel import SQLModel, Field, Relationship, Column
from typing import Optional, List
from datetime import datetime
import uuid

class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    title: str = Field(sa_column=Column("title", String, nullable=False))
    description: Optional[str] = Field(sa_column=Column("description", Text, nullable=True))
    completed: bool = Field(default=False, sa_column=Column("completed", Boolean, nullable=False))
    priority: str = Field(default="medium", sa_column=Column("priority", String, nullable=False))
    tags: Optional[List[str]] = Field(sa_column=Column("tags", ARRAY(String), nullable=True))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship to user
    user: Optional["User"] = Relationship(back_populates="tasks")

    __table_args__ = (
        CheckConstraint("priority IN ('low', 'medium', 'high')", name="valid_priority"),
    )

# Add relationship to User model
User.tasks = Relationship(back_populates="user")
```

## 5. Relationships

### 5.1 User-Tasks Relationship
- One User can have many Tasks (One-to-Many)
- Foreign key constraint ensures referential integrity
- CASCADE delete: When a user is deleted, all their tasks are also deleted
- Tasks are isolated per user, ensuring data privacy

## 6. Security Considerations

### 6.1 Data Privacy
- User isolation through foreign key relationships
- No cross-user data access possible through database constraints
- Proper indexing to support authentication and authorization queries

### 6.2 Data Integrity
- Foreign key constraints prevent orphaned records
- Check constraints ensure valid data values
- Unique constraints prevent duplicate emails

## 7. Performance Considerations

### 7.1 Indexing Strategy
- Primary indexes on all ID fields for efficient lookups
- Index on user_id for fast user task retrieval
- Index on completed status for filtering completed tasks
- Index on priority for sorting and filtering by priority
- Index on created_at for chronological operations

### 7.2 Query Optimization
- Queries should leverage indexes for optimal performance
- Use parameterized queries to prevent SQL injection
- Consider partitioning for large datasets (future consideration)

## 8. Migration Strategy

### 8.1 Initial Schema Creation
1. Create users table with all fields and constraints
2. Create tasks table with all fields, constraints, and foreign key
3. Create all necessary indexes
4. Verify referential integrity constraints

### 8.2 Future Schema Changes
- Use migration scripts for any schema modifications
- Maintain backward compatibility where possible
- Update both SQL and SQLModel definitions simultaneously

## 9. Dependencies

- Neon Serverless PostgreSQL database
- SQLModel ORM
- UUID generation support
- Array data type support for tags (PostgreSQL specific)

## 10. Validation Requirements

### 10.1 User Validation
- Email format validation at application level
- Provider value validation (must be 'email', 'google', or 'github')
- Password strength validation (for email-based accounts)

### 10.2 Task Validation
- Title length validation (1-255 characters)
- Priority value validation (must be 'low', 'medium', or 'high')
- Tags array validation (max 10 tags, each 1-50 characters)

## 11. Sample Data

### 11.1 Sample User Records
```sql
INSERT INTO users (email, hashed_password, provider, created_at, last_login) VALUES
('john@example.com', '$2b$12$hashed_password_here', 'email', '2025-01-01 10:00:00+00', '2025-01-02 14:30:00+00'),
('jane@gmail.com', NULL, 'google', '2025-01-01 11:00:00+00', '2025-01-02 15:00:00+00'),
('bob@github.com', NULL, 'github', '2025-01-01 12:00:00+00', '2025-01-02 16:00:00+00');
```

### 11.2 Sample Task Records
```sql
INSERT INTO tasks (user_id, title, description, completed, priority, tags, created_at) VALUES
('uuid1', 'Complete project proposal', 'Write and submit the project proposal document', false, 'high', '{work,important}', '2025-01-01 10:30:00+00'),
('uuid1', 'Buy groceries', 'Milk, bread, eggs, fruits', false, 'medium', '{personal}', '2025-01-01 11:00:00+00'),
('uuid2', 'Review code changes', 'Review pull requests in the repository', true, 'high', '{work,code}', '2025-01-01 11:30:00+00');
```