# Database Schema Specification - Phase 3: AI-Powered Todo Chatbot

## 1. Overview

This document specifies the database schema for Phase 3 of the Full-Stack Web Application, which introduces AI-powered chatbot functionality. The schema extends the existing User and Task models with new Conversation and Message models to support chat history storage and retrieval.

## 2. Database Technology

- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel
- **Connection**: Connection pooling with appropriate timeout settings

## 3. User Model (Existing)

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
from sqlmodel import SQLModel, Field, Column, Relationship
from typing import Optional, List
from datetime import datetime
import uuid
from sqlalchemy import String, Text

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(sa_column=Column("email", String, nullable=False, unique=True))
    hashed_password: Optional[str] = Field(sa_column=Column("hashed_password", String, nullable=True))
    provider: str = Field(sa_column=Column("provider", String, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    last_login: Optional[datetime] = Field(nullable=True)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user")
    conversations: List["Conversation"] = Relationship(back_populates="user")

    __table_args__ = (
        CheckConstraint("provider IN ('email', 'google', 'github')", name="valid_provider"),
    )
```

## 4. Task Model (Existing)

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
from sqlalchemy import String, Text, Boolean

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
```

## 5. Conversation Model (New)

### 5.1 Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the conversation |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to the user who owns the conversation |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | When the conversation was created |

### 5.2 Constraints
- Primary Key: id
- Foreign Key: user_id references users(id) with CASCADE delete
- Not Null: id, user_id, created_at

### 5.3 Indexes
- `idx_conversations_user_id`: Index on user_id for efficient user conversation retrieval
- `idx_conversations_created_at`: Index on created_at for chronological ordering

### 5.4 SQL Definition
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
```

### 5.5 SQLModel Definition (Python)
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid

class Conversation(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship to user
    user: Optional["User"] = Relationship(back_populates="conversations")
    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")
```

## 6. Message Model (New)

### 6.1 Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the message |
| conversation_id | UUID | FOREIGN KEY, NOT NULL | Reference to the conversation this message belongs to |
| role | VARCHAR(20) | NOT NULL, CHECK(in list) | The role of the message sender ('user' or 'assistant') |
| content | TEXT | NOT NULL | The content of the message |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | When the message was created |

### 6.2 Constraints
- Primary Key: id
- Foreign Key: conversation_id references conversations(id) with CASCADE delete
- Not Null: id, conversation_id, role, content, created_at
- Check Constraint: role must be one of 'user', 'assistant'

### 6.3 Indexes
- `idx_messages_conversation_id`: Index on conversation_id for efficient conversation message retrieval
- `idx_messages_role`: Index on role for filtering by message sender
- `idx_messages_created_at`: Index on created_at for chronological ordering

### 6.4 SQL Definition
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### 6.5 SQLModel Definition (Python)
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy import String, Text

class Message(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", ondelete="CASCADE")
    role: str = Field(sa_column=Column("role", String, nullable=False))  # 'user' or 'assistant'
    content: str = Field(sa_column=Column("content", Text, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship to conversation
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")

    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant')", name="valid_role"),
    )
```

## 7. Relationships

### 7.1 User-Tasks Relationship
- One User can have many Tasks (One-to-Many)
- Foreign key constraint ensures referential integrity
- CASCADE delete: When a user is deleted, all their tasks are also deleted
- Tasks are isolated per user, ensuring data privacy

### 7.2 User-Conversations Relationship
- One User can have many Conversations (One-to-Many)
- Foreign key constraint ensures referential integrity
- CASCADE delete: When a user is deleted, all their conversations are also deleted
- Conversations are isolated per user, ensuring data privacy

### 7.3 Conversation-Messages Relationship
- One Conversation can have many Messages (One-to-Many)
- Foreign key constraint ensures referential integrity
- CASCADE delete: When a conversation is deleted, all its messages are also deleted
- Messages are isolated per conversation, ensuring proper organization

## 8. Security Considerations

### 8.1 Data Privacy
- User isolation through foreign key relationships
- No cross-user data access possible through database constraints
- Proper indexing to support authentication and authorization queries
- Conversation and message data is isolated per user through the user_id foreign key

### 8.2 Data Integrity
- Foreign key constraints prevent orphaned records
- Check constraints ensure valid data values (role, priority)
- Unique constraints prevent duplicate emails
- Proper cascading deletes maintain referential integrity

## 9. Performance Considerations

### 9.1 Indexing Strategy
- Primary indexes on all ID fields for efficient lookups
- Index on user_id for fast user data retrieval (tasks, conversations)
- Index on conversation_id for fast conversation message retrieval
- Index on role for filtering messages by sender type
- Index on created_at for chronological operations

### 9.2 Query Optimization
- Queries should leverage indexes for optimal performance
- Use parameterized queries to prevent SQL injection
- Consider partitioning for large datasets (future consideration)
- Efficient retrieval of conversation history with proper joins

## 10. Migration Strategy

### 10.1 Schema Update Process
1. Create conversations table with all fields and constraints
2. Create messages table with all fields, constraints, and foreign key
3. Create all necessary indexes
4. Update existing User model to include conversations relationship
5. Verify referential integrity constraints

### 10.2 Future Schema Changes
- Use migration scripts for any schema modifications
- Maintain backward compatibility where possible
- Update both SQL and SQLModel definitions simultaneously

## 11. Dependencies

- Neon Serverless PostgreSQL database
- SQLModel ORM
- UUID generation support
- Array data type support for tags (PostgreSQL specific)
- Text data type support for message content

## 12. Validation Requirements

### 12.1 User Validation
- Email format validation at application level
- Provider value validation (must be 'email', 'google', or 'github')
- Password strength validation (for email-based accounts)

### 12.2 Task Validation
- Title length validation (1-255 characters)
- Priority value validation (must be 'low', 'medium', or 'high')
- Tags array validation (max 10 tags, each 1-50 characters)

### 12.3 Conversation Validation
- No specific validation beyond database constraints
- Automatically associated with current user

### 12.4 Message Validation
- Role value validation (must be 'user' or 'assistant')
- Content length validation (max 10,000 characters)
- Proper association with existing conversation

## 13. Sample Data

### 13.1 Sample Conversation Records
```sql
INSERT INTO conversations (user_id, created_at) VALUES
('uuid1', '2025-01-02 10:00:00+00'),
('uuid2', '2025-01-02 11:00:00+00');
```

### 13.2 Sample Message Records
```sql
INSERT INTO messages (conversation_id, role, content, created_at) VALUES
('conv_uuid1', 'user', 'Add a new task to buy groceries', '2025-01-02 10:05:00+00'),
('conv_uuid1', 'assistant', 'I have added the task "buy groceries" to your list.', '2025-01-02 10:05:30+00'),
('conv_uuid1', 'user', 'Show me my tasks', '2025-01-02 10:06:00+00'),
('conv_uuid1', 'assistant', 'Here are your tasks: 1. buy groceries (pending)', '2025-01-02 10:06:30+00');
```