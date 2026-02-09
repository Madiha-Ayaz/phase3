# MCP Tools Specification for AI-Powered Todo Chatbot

## Overview
This document defines the Model-Controller-Presenter (MCP) tools that will be used by the AI chatbot to perform task management operations. These tools provide a standardized interface between the natural language processing layer and the underlying task management system, ensuring consistent behavior and proper user isolation.

## Tool Architecture Pattern
The MCP pattern separates concerns as follows:
- **Model**: Handles data structures and database operations
- **Controller**: Manages business logic and validation
- **Presenter**: Formats output for the AI system and user interface

## Authentication Context
All tools operate within the context of the current authenticated user. The `current_user` ID is automatically applied to all operations to ensure proper user data isolation.

## Available Tools

### 1. add_task
**Purpose**: Creates a new task for the current user

**Signature**:
```python
add_task(title: str, description: str = "", priority: str = "medium", tags: str = "") -> dict
```

**Parameters**:
- `title` (str, required): The title of the task (max 200 characters)
- `description` (str, optional): Optional detailed description of the task
- `priority` (str, optional): Priority level ("low", "medium", "high") - defaults to "medium"
- `tags` (str, optional): Comma-separated tags for categorizing the task

**Returns**:
```python
{
    "success": bool,
    "task_id": int,
    "message": str,
    "task": {
        "id": int,
        "title": str,
        "description": str,
        "status": str,  # "pending" by default
        "priority": str,
        "tags": str,
        "created_at": datetime,
        "updated_at": datetime
    }
}
```

**Behavior**:
- Validates that title is not empty and does not exceed 200 characters
- Sets default status to "pending"
- Automatically associates the task with `current_user.id`
- Returns success status and created task details

### 2. list_tasks
**Purpose**: Retrieves tasks for the current user based on status filter

**Signature**:
```python
list_tasks(status: str = "all") -> dict
```

**Parameters**:
- `status` (str, optional): Filter tasks by status ("all", "pending", "completed", "deleted") - defaults to "all"

**Returns**:
```python
{
    "success": bool,
    "count": int,
    "tasks": [
        {
            "id": int,
            "title": str,
            "description": str,
            "status": str,
            "priority": str,
            "tags": str,
            "completed_at": datetime,
            "created_at": datetime,
            "updated_at": datetime
        }
    ]
}
```

**Behavior**:
- Only returns tasks belonging to `current_user.id`
- Filters tasks based on the status parameter if provided
- Orders tasks by creation date (newest first)
- Returns empty array if no tasks match the criteria

### 3. update_task
**Purpose**: Updates an existing task for the current user

**Signature**:
```python
update_task(id: int, title: str = None, description: str = None, priority: str = None, tags: str = None) -> dict
```

**Parameters**:
- `id` (int, required): The ID of the task to update
- `title` (str, optional): New title for the task
- `description` (str, optional): New description for the task
- `priority` (str, optional): New priority level ("low", "medium", "high")
- `tags` (str, optional): New comma-separated tags for the task

**Returns**:
```python
{
    "success": bool,
    "message": str,
    "task": {
        "id": int,
        "title": str,
        "description": str,
        "status": str,
        "priority": str,
        "tags": str,
        "created_at": datetime,
        "updated_at": datetime
    }
}
```

**Behavior**:
- Only allows updating tasks that belong to `current_user.id`
- Updates only the fields that are provided (partial update)
- Validates that the task ID exists and belongs to the current user
- Updates the `updated_at` timestamp
- Preserves the original `created_at` timestamp

### 4. delete_task
**Purpose**: Marks a task as deleted for the current user

**Signature**:
```python
delete_task(id: int) -> dict
```

**Parameters**:
- `id` (int, required): The ID of the task to delete

**Returns**:
```python
{
    "success": bool,
    "message": str,
    "task_id": int
}
```

**Behavior**:
- Only allows deleting tasks that belong to `current_user.id`
- Changes the task status to "deleted" (soft delete)
- Does not permanently remove the task from the database
- Validates that the task ID exists and belongs to the current user
- Returns success status and the task ID

### 5. toggle_complete
**Purpose**: Toggles the completion status of a task for the current user

**Signature**:
```python
toggle_complete(id: int) -> dict
```

**Parameters**:
- `id` (int, required): The ID of the task to toggle

**Returns**:
```python
{
    "success": bool,
    "message": str,
    "task": {
        "id": int,
        "title": str,
        "status": str,  # "completed" or "pending"
        "completed_at": datetime,  # Updated when status becomes "completed"
        "updated_at": datetime
    }
}
```

**Behavior**:
- Only allows toggling tasks that belong to `current_user.id`
- Changes "pending" to "completed" or "completed" to "pending"
- Sets `completed_at` timestamp when changing to "completed" status
- Clears `completed_at` timestamp when changing from "completed" to "pending"
- Validates that the task ID exists and belongs to the current user

## Error Handling
All tools follow a consistent error handling pattern:

**Error Response Format**:
```python
{
    "success": False,
    "error": {
        "type": str,  # "validation_error", "not_found", "unauthorized", "server_error"
        "message": str,
        "details": dict  # Additional error details when applicable
    }
}
```

**Common Error Types**:
- `validation_error`: Input parameters do not meet validation requirements
- `not_found`: Requested resource (task) does not exist
- `unauthorized`: Attempted operation on a resource that doesn't belong to the current user
- `server_error`: Internal system error occurred during operation

## Security Considerations
- All operations are automatically filtered by `current_user.id`
- No tool allows cross-user data access or modification
- Input validation prevents injection attacks
- Proper authentication must be established before any tool execution

## Performance Considerations
- Tools should execute within 500ms under normal conditions
- Database queries should use appropriate indexing
- Results should be paginated for large datasets (though not implemented in this version)

## Integration with AI System
- Tools return structured JSON responses that can be easily processed by the AI system
- Error responses provide clear messages that can be converted to natural language
- Success messages include sufficient detail for AI to generate appropriate responses to users