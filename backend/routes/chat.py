from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel import Session, select
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import os
import json
import logging
import re
from groq import Groq
from dotenv import load_dotenv

# Import models and dependencies
try:
    from models import User, Conversation, Message, RoleEnum
    from db import get_session
    from mcp import add_task, list_tasks, update_task, delete_task, toggle_complete, search_tasks_by_title_or_description, delete_task_by_search, complete_all_pending_tasks
    from fastapi.security import HTTPBearer
    from fastapi import Depends, HTTPException, status
    from sqlmodel import Session
    import uuid
    from jose import jwt
    from jose.exceptions import JWTError
    import os
    import logging
    from datetime import datetime, timedelta
except ImportError:
    from backend.models import User, Conversation, Message, RoleEnum
    from backend.db import get_session
    from backend.mcp import add_task, list_tasks, update_task, delete_task, toggle_complete, search_tasks_by_title_or_description, delete_task_by_search, complete_all_pending_tasks
    from fastapi.security import HTTPBearer
    from fastapi import Depends, HTTPException, status
    from sqlmodel import Session
    import uuid
    from jose import jwt
    from jose.exceptions import JWTError
    import os
    import logging
    from datetime import datetime, timedelta

# JWT configuration (should match main.py)
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-please-change-in-production-12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Logger
logger = logging.getLogger(__name__)

# Define the get_current_user function locally to avoid circular import
async def get_current_user(
    credentials: HTTPBearer = Depends(HTTPBearer()),
    session: Session = Depends(get_session)
) -> User:
    """Get current user from JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
    except JWTError:
        logger.error("Token decoding failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = session.get(User, uuid.UUID(user_id))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Load environment variables - force reload to ensure .env file is read
load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client with debug logging
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not found in environment variables")
else:
    # Log that key exists (but mask most of it for security)
    masked_key = f"{GROQ_API_KEY[:5]}***{GROQ_API_KEY[-3:]}" if len(GROQ_API_KEY) > 8 else "***"
    logger.info(f"GROQ_API_KEY found: {masked_key}")
    logger.info(f"Full GROQ_API_KEY length: {len(GROQ_API_KEY)} characters")

# Initialize Groq client
try:
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
    if GROQ_API_KEY:
        logger.info("Groq client initialized successfully")
    else:
        logger.warning("Groq client not initialized - no API key found")
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {str(e)}")
    groq_client = None

router = APIRouter(prefix="/api", tags=["chat"])

# System prompt for the AI assistant
SYSTEM_PROMPT = """
You are an AI assistant that helps users manage their tasks through natural language.
Your job is to understand the user's intent and call the appropriate functions to manage tasks.
Available functions:
- add_task: Create a new task with title, description, priority, and tags
- list_tasks: Get a list of tasks with optional status filter
- update_task: Update an existing task with id and optional fields
- delete_task: Delete a task by id
- toggle_complete: Toggle the completion status of a task by id
- complete_all_pending: Mark all pending tasks as completed

Understand the user's request and call the appropriate function.
If the user wants to add a task, extract the title, description, priority, and tags if mentioned.
If the user wants to list tasks, determine if they want all, pending, or completed tasks.
If the user wants to update a task, identify the task ID and the fields to update.
If the user wants to delete a task, identify the task ID OR description/title. Look for keywords like "delete", "remove", "eliminate", "get rid of", or "cancel".
If the user wants to mark a task as complete/incomplete, identify the task ID OR description/title. Look for keywords like "complete", "finish", "done", "mark as done", "accomplish", or "close".
If the user wants to complete all pending tasks, look for phrases like "complete all pending", "mark all pending as done", "finish all pending", or "complete all tasks".

For task completion/deletion, the user may say things like:
- "Complete task #1" or "Mark task #1 as complete" (use the ID "1" in the id field)
- "Finish the grocery task" or "Mark grocery task as done" (use the search term "grocery task" in the id field)
- "Delete the meeting task" or "Remove the meeting task" (use the search term "meeting task" in the id field)
- "Cancel task #3" or "Eliminate task #3" (use the ID "3" in the id field)
- "Complete all pending tasks" or "Mark all pending as completed" (use intent "complete_all_pending")

IMPORTANT: When the user refers to a task by its description or title (without an explicit number/ID), put the description/title text in the "id" field. When the user provides an explicit task number/ID, put that number/ID in the "id" field.

When identifying tasks by description/title, try to match the closest task from their list.
If multiple tasks match, ask the user to clarify or provide the task ID.

Return a JSON response with the following format:
{
    "intent": "add_task|list_tasks|update_task|delete_task|toggle_complete|complete_all_pending|other",
    "parameters": {
        // Parameters based on intent
        "title": "...", // for add_task, update_task
        "description": "...", // for add_task, update_task
        "priority": "...", // for add_task, update_task
        "tags": "...", // for add_task, update_task
        "status_filter": "...", // for list_tasks
        "id": "...", // for update_task, delete_task, toggle_complete (use actual ID if available, or description/title for search)
        "task_fields": {...} // for update_task
    },
    "message": "Natural language response to the user"
}

Always respond in a helpful and friendly manner after performing the requested action.
"""


@router.post("/chat")
async def chat(
    message: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Main chat endpoint that processes user messages using Groq API and MCP tools.

    Args:
        message: The user's message in natural language
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with AI response and conversation context
    """
    if not groq_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API key not configured. Please set GROQ_API_KEY environment variable."
        )

    try:
        # Validate that the API key is working by attempting a simple API call
        try:
            # Make a quick validation call to ensure API key is valid
            # We'll do a minimal call to check authentication
            validation_check = groq_client.models.list()
            logger.debug("Successfully validated Groq API key")
        except Exception as auth_error:
            logger.error(f"Groq API authentication failed: {str(auth_error)}")
            if "invalid_api_key" in str(auth_error).lower() or "401" in str(auth_error):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Groq API key. Please check your GROQ_API_KEY environment variable."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Groq API authentication error: {str(auth_error)}"
                )

        # Get or create a conversation for this user
        # For simplicity, we'll use the most recent conversation or create a new one
        conversation_query = select(Conversation).where(
            Conversation.user_id == current_user.id
        ).order_by(Conversation.created_at.desc()).limit(1)

        conversation = session.exec(conversation_query).first()

        if not conversation:
            conversation = Conversation(user_id=current_user.id)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

        # Save user message to database
        user_message = Message(
            conversation_id=conversation.id,
            role=RoleEnum.user,
            content=message
        )
        session.add(user_message)
        session.commit()

        # Prepare messages for the AI
        # For now, just send the system prompt and the latest user message
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ]

        # Call Groq API
        logger.info(f"Calling Groq API with message: {message[:100]}...")  # Log first 100 chars
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",  # Using a currently supported model
            temperature=0.7,
            max_tokens=1000,
            response_format={"type": "json_object"}  # Request JSON response
        )

        ai_response = chat_completion.choices[0].message.content
        logger.info(f"Received response from Groq API: {ai_response[:100]}...")  # Log first 100 chars

        # Parse the AI response as JSON
        try:
            parsed_response = json.loads(ai_response)
            intent = parsed_response.get("intent", "other")
            parameters = parsed_response.get("parameters", {})
            message_to_user = parsed_response.get("message", "I processed your request.")
        except json.JSONDecodeError:
            # If the response is not valid JSON, try to extract intent manually
            logger.warning(f"Failed to parse Groq response as JSON: {ai_response}")
            intent = "other"
            parameters = {}
            message_to_user = ai_response

        # Execute the appropriate MCP tool based on intent
        tool_result = None
        if intent == "add_task":
            tool_result = add_task(
                title=parameters.get("title", ""),
                description=parameters.get("description", ""),
                priority=parameters.get("priority", "medium"),
                tags=parameters.get("tags", ""),
                current_user=current_user,
                session=session
            )
        elif intent == "list_tasks":
            status_filter = parameters.get("status_filter", "all")
            tool_result = list_tasks(
                status_filter=status_filter,
                current_user=current_user,
                session=session
            )
        elif intent == "update_task":
            task_id = parameters.get("id")
            if task_id:
                # Convert to string in case it's sent as a UUID object
                task_id_str = str(task_id)
                tool_result = update_task(
                    id=task_id_str,
                    title=parameters.get("title"),
                    description=parameters.get("description"),
                    priority=parameters.get("priority"),
                    tags=parameters.get("tags"),
                    current_user=current_user,
                    session=session
                )
        elif intent == "delete_task":
            task_id = parameters.get("id")
            if task_id:
                # First try to parse as UUID, if that fails, treat as search term
                try:
                    # Try to parse as UUID first
                    uuid.UUID(str(task_id))
                    # If this succeeds, use the original function
                    tool_result = delete_task(
                        id=str(task_id),
                        current_user=current_user,
                        session=session
                    )
                except ValueError:
                    # If it's not a valid UUID, treat it as a search term
                    tool_result = delete_task_by_search(
                        search_term=str(task_id),
                        current_user=current_user,
                        session=session
                    )
        elif intent == "toggle_complete":
            task_id = parameters.get("id")
            if task_id:
                # Convert to string in case it's sent as a UUID object
                # First try to parse as UUID, if that fails, treat as search term
                try:
                    # Try to parse as UUID first
                    uuid.UUID(str(task_id))
                    # If this succeeds, use the original function
                    tool_result = toggle_complete(
                        id=str(task_id),
                        current_user=current_user,
                        session=session
                    )
                except ValueError:
                    # If it's not a valid UUID, treat it as a search term
                    tool_result = toggle_complete(
                        id=str(task_id),  # This will now handle search terms
                        current_user=current_user,
                        session=session
                    )
        elif intent == "complete_all_pending":
            # Complete all pending tasks for the user
            tool_result = complete_all_pending_tasks(
                current_user=current_user,
                session=session
            )

        # If there was a successful tool execution, update the message to user
        if tool_result and tool_result.get("success"):
            # Enhance the response based on the intent and tool result
            if intent == "list_tasks":
                # For list tasks, include the actual task data in the response
                tasks = tool_result.get("tasks", [])
                if tasks:
                    task_list_text = "\n".join([
                        f"- {task['title']} [{task['status']}] (Priority: {task['priority']})"
                        for task in tasks
                    ])
                    message_to_user = f"Here are your tasks:\n\n{task_list_text}\n\n{tool_result.get('message', '')}"
                else:
                    message_to_user = "You don't have any tasks at the moment.\n\n" + tool_result.get("message", "")
            elif intent == "add_task":
                # For add task, include task details
                task = tool_result.get("task", {})
                if task:
                    message_to_user = f"{tool_result.get('message', '')}\n\nAdded task: {task.get('title', '')} [Status: {task.get('status', '')}] (Priority: {task.get('priority', '')})"
                else:
                    message_to_user = tool_result.get("message", "")
            elif intent == "delete_task":
                # For delete task
                message_to_user = tool_result.get("message", "")
            elif intent == "update_task":
                # For update task, include updated task details
                task = tool_result.get("task", {})
                if task:
                    message_to_user = f"{tool_result.get('message', '')}\n\nUpdated task: {task.get('title', '')} [Status: {task.get('status', '')}] (Priority: {task.get('priority', '')})"
                else:
                    message_to_user = tool_result.get("message", "")
            elif intent == "toggle_complete":
                # For toggle complete, include task status
                task = tool_result.get("task", {})
                if task:
                    status_text = task.get("status", "pending")
                    message_to_user = f"{tool_result.get('message', '')}\n\nTask is now {status_text}: {task.get('title', '')}"
                else:
                    message_to_user = tool_result.get("message", "")
            elif intent == "complete_all_pending":
                # For complete all pending, include summary of completed tasks
                count = tool_result.get("count", 0)
                tasks_completed = tool_result.get("tasks_completed", [])

                if count > 0:
                    task_list_text = "\n".join([
                        f"- {task['title']} (Priority: {task['priority']})"
                        for task in tasks_completed[:5]  # Limit to first 5 for brevity
                    ])
                    message_to_user = f"{tool_result.get('message', '')}\n\nCompleted tasks:\n{task_list_text}"
                    if len(tasks_completed) > 5:
                        message_to_user += f"\n... and {len(tasks_completed) - 5} more tasks"
                else:
                    message_to_user = tool_result.get("message", "")
            else:
                # For other intents, use the default behavior
                message_to_user += f"\n\nResult: {tool_result.get('message', '')}"

        # Save AI response to database
        assistant_message = Message(
            conversation_id=conversation.id,
            role=RoleEnum.assistant,
            content=message_to_user  # Use the processed response
        )
        session.add(assistant_message)
        session.commit()

        return {
            "success": True,
            "conversation_id": str(conversation.id),
            "response": message_to_user,
            "intent": intent,
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        # Check if this is specifically an API key error
        error_msg = str(e).lower()
        if "invalid_api_key" in error_msg or "401" in error_msg or "authentication" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Groq API key. Please check your GROQ_API_KEY environment variable."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing chat message: {str(e)}"
            )


@router.get("/chat/history/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get conversation history for a specific conversation.

    Args:
        conversation_id: The ID of the conversation to retrieve
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with conversation history
    """
    try:
        # Validate conversation ID
        try:
            conv_id = uuid.UUID(conversation_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid conversation ID format"
            )

        # Check if conversation belongs to user
        conversation = session.get(Conversation, conv_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )

        if conversation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this conversation"
            )

        # Get messages for this conversation
        messages_query = select(Message).where(
            Message.conversation_id == conv_id
        ).order_by(Message.created_at.asc())

        messages = session.exec(messages_query).all()

        message_list = []
        for msg in messages:
            message_list.append({
                "id": str(msg.id),
                "role": msg.role.value,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            })

        return {
            "success": True,
            "conversation_id": str(conversation.id),
            "messages": message_list,
            "created_at": conversation.created_at.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving conversation history: {str(e)}"
        )


@router.get("/chat/conversations")
async def get_user_conversations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get all conversations for the current user.

    Args:
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with list of user's conversations
    """
    try:
        conversations_query = select(Conversation).where(
            Conversation.user_id == current_user.id
        ).order_by(Conversation.created_at.desc())

        conversations = session.exec(conversations_query).all()

        conversation_list = []
        for conv in conversations:
            # Count messages in each conversation
            message_count_query = select(Message).where(
                Message.conversation_id == conv.id
            )
            message_count = len(session.exec(message_count_query).all())

            conversation_list.append({
                "id": str(conv.id),
                "created_at": conv.created_at.isoformat(),
                "message_count": message_count
            })

        return {
            "success": True,
            "conversations": conversation_list,
            "count": len(conversation_list)
        }

    except Exception as e:
        logger.error(f"Error getting user conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving conversations: {str(e)}"
        )