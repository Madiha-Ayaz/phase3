from sqlmodel import SQLModel, Field, Relationship, Column, JSON
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

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class RoleEnum(str, Enum):
    user = "user"
    assistant = "assistant"

class User(SQLModel, table=True):
    __tablename__ = "user"  # Explicit lowercase table name for PostgreSQL

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: Optional[str] = Field(default=None, max_length=255)
    provider: ProviderEnum = Field(default=ProviderEnum.email, sa_column=Column(SAEnum(ProviderEnum), nullable=False))
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


class Task(SQLModel, table=True):
    __tablename__ = "task"  # Explicit lowercase table name for PostgreSQL

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: PriorityEnum = Field(default=PriorityEnum.medium, sa_column=Column(SAEnum(PriorityEnum), nullable=False))
    # Fixed: Store tags as JSON (JSONB in PostgreSQL) – supports lists perfectly
    tags: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

    # Relationship to user
    user: User = Relationship(back_populates="tasks")


class Conversation(SQLModel, table=True):
    __tablename__ = "conversation"  # Explicit lowercase table name for PostgreSQL

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user and messages
    user: User = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    __tablename__ = "message"  # Explicit lowercase table name for PostgreSQL

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversation.id", ondelete="CASCADE")
    role: RoleEnum = Field(sa_column=Column(SAEnum(RoleEnum), nullable=False))  # 'user' or 'assistant'
    content: str = Field(sa_column=Column("content", TEXT, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Conversation = Relationship(back_populates="messages")


# ── Pydantic Models for API ────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = "UTC"
    theme_preference: Optional[str] = "dark"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    provider: ProviderEnum
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = "UTC"
    theme_preference: Optional[str] = "dark"
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    tags: Optional[List[str]] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    completed: bool
    priority: PriorityEnum
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"