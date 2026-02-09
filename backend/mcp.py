from sqlmodel import Session, select
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from models import User, Task, PriorityEnum
from fastapi import HTTPException, status


def add_task(
    title: str,
    description: str = "",
    priority: str = "medium",
    tags: str = "",
    current_user: User = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    Create a new task for the current user.

    Args:
        title: Task title (required)
        description: Task description (optional)
        priority: Task priority ('low', 'medium', 'high') - defaults to 'medium'
        tags: Comma-separated tags as string (optional)
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with success status and created task details
    """
    try:
        # Validate inputs
        if not title or len(title.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title is required"
            )

        if len(title) > 255:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must be 255 characters or less"
            )

        # Validate priority - handle empty strings by using default
        if not priority or priority.strip() == "":
            priority = "medium"  # Set default priority

        try:
            priority_enum = PriorityEnum(priority.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Priority must be 'low', 'medium', or 'high'"
            )

        # Parse tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]

        # Create task
        task = Task(
            title=title.strip(),
            description=description.strip() if description else None,
            priority=priority_enum,
            tags=tag_list,
            user_id=current_user.id,
            completed=False
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "message": f"Task '{task.title}' added successfully",
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": "pending",
                "priority": task.priority.value,
                "tags": task.tags,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add task: {str(e)}"
        )


def list_tasks(
    status_filter: str = "all",
    current_user: User = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    List tasks for the current user based on status filter.

    Args:
        status_filter: Filter tasks by status ('all', 'pending', 'completed', 'deleted')
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with success status and list of tasks
    """
    try:
        # Build query based on status filter
        query = select(Task).where(Task.user_id == current_user.id)

        if status_filter.lower() == "pending":
            query = query.where(Task.completed == False)
        elif status_filter.lower() == "completed":
            query = query.where(Task.completed == True)
        elif status_filter.lower() == "deleted":
            # Assuming deleted tasks have a different status, but we don't have that field
            # For now, return empty list since we don't have soft delete implemented
            query = query.where(Task.id == uuid.UUID(int=0))  # Will return empty
        # 'all' returns all tasks for the user

        tasks = session.exec(query.order_by(Task.created_at.desc())).all()

        task_list = []
        for task in tasks:
            task_dict = {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": "completed" if task.completed else "pending",
                "priority": task.priority.value,
                "tags": task.tags,
                "completed_at": task.updated_at.isoformat() if task.completed and task.updated_at else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
            task_list.append(task_dict)

        return {
            "success": True,
            "count": len(task_list),
            "tasks": task_list
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tasks: {str(e)}"
        )


def update_task(
    id: str,  # Changed from int to str to handle UUID
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[str] = None,
    current_user: User = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    Update an existing task for the current user.

    Args:
        id: Task ID to update (UUID string)
        title: New title (optional)
        description: New description (optional)
        priority: New priority (optional)
        tags: New tags as comma-separated string (optional)
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with success status and updated task details
    """
    try:
        # Convert string ID to UUID if needed
        try:
            task_id = uuid.UUID(str(id))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task ID format"
            )

        # Get the task
        task = session.get(Task, task_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this task"
            )

        # Update fields if provided
        if title is not None:
            if len(title.strip()) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Title cannot be empty"
                )
            if len(title) > 255:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Title must be 255 characters or less"
                )
            task.title = title.strip()

        if description is not None:
            task.description = description.strip() if description.strip() else None

        if priority is not None:
            # Handle empty priority strings by using default
            if not priority or priority.strip() == "":
                priority = "medium"  # Set default priority

            try:
                priority_enum = PriorityEnum(priority.lower())
                task.priority = priority_enum
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Priority must be 'low', 'medium', or 'high'"
                )

        if tags is not None:
            if tags.strip():
                tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
                task.tags = tag_list
            else:
                task.tags = []

        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "message": f"Task '{task.title}' updated successfully",
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": "completed" if task.completed else "pending",
                "priority": task.priority.value,
                "tags": task.tags,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )


def delete_task(
    id: str,  # Changed from int to str to handle UUID
    current_user: User = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    Mark a task as deleted for the current user (soft delete by changing status).

    Args:
        id: Task ID to delete (UUID string)
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with success status and task ID
    """
    try:
        # Convert string ID to UUID if needed
        try:
            task_id = uuid.UUID(str(id))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task ID format"
            )

        # Get the task
        task = session.get(Task, task_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this task"
            )

        # Since we don't have a soft-delete field in the schema, we'll just delete the task
        # In a real implementation, you might want to add a 'status' field to the Task model
        session.delete(task)
        session.commit()

        return {
            "success": True,
            "message": f"Task with ID {id} deleted successfully",
            "task_id": str(id)
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )


def search_tasks_by_title_or_description(
    search_term: str,
    current_user: User = None,
    session: Session = None
) -> List[Task]:
    """
    Search for tasks by title or description containing the search term.

    Args:
        search_term: The term to search for in task titles or descriptions
        current_user: The authenticated user
        session: Database session

    Returns:
        List of tasks matching the search term
    """
    try:
        # Build query to find tasks by title or description
        query = select(Task).where(
            (Task.user_id == current_user.id) &
            (
                (Task.title.ilike(f"%{search_term}%")) |
                ((Task.description.is_not(None)) & (Task.description.ilike(f"%{search_term}%")))
            )
        )

        tasks = session.exec(query.order_by(Task.created_at.desc())).all()
        return tasks

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search tasks: {str(e)}"
        )


def toggle_complete(
    id: str,  # Changed from int to str to handle UUID
    current_user: User = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    Toggle the completion status of a task for the current user.
    Can accept either a UUID ID or a search term to find the task by title/description.

    Args:
        id: Task ID to toggle (UUID string) or search term for title/description
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with success status and updated task details
    """
    try:
        # First try to parse as UUID
        try:
            task_id = uuid.UUID(str(id))

            # Get the task by ID
            task = session.get(Task, task_id)

            if not task:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found"
                )

        except ValueError:
            # If it's not a valid UUID, treat it as a search term
            search_term = str(id).strip()

            # Handle the case where AI returns placeholder text like "<task_id>"
            if search_term.startswith("<") and search_term.endswith(">"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid task identifier provided. Please provide a valid task ID or description to complete the task."
                )

            matching_tasks = search_tasks_by_title_or_description(search_term, current_user, session)

            if not matching_tasks:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Could not find a task with the description '{search_term}'. Please provide the task ID or a more specific description to complete the task."
                )
            elif len(matching_tasks) > 1:
                # If multiple tasks match, return a list of matching tasks
                task_titles = [f"'{task.title}' (ID: {task.id})" for task in matching_tasks[:5]]  # Limit to first 5
                task_list_str = ", ".join(task_titles)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Found multiple tasks matching '{search_term}'. Please provide the specific task ID to complete. Matching tasks: {task_list_str}"
                )
            else:
                # Exactly one task matched
                task = matching_tasks[0]

        if task.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this task"
            )

        # Toggle completion status
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        status_text = "completed" if task.completed else "pending"
        return {
            "success": True,
            "message": f"Task '{task.title}' marked as {status_text}",
            "task": {
                "id": str(task.id),
                "title": task.title,
                "status": status_text,
                "completed_at": task.updated_at.isoformat() if task.completed else None,
                "updated_at": task.updated_at.isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle task completion: {str(e)}"
        )


def delete_task_by_search(
    search_term: str,
    current_user: User = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    Delete a task by searching for it by title or description.

    Args:
        search_term: The term to search for in task titles or descriptions
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with success status and task ID
    """
    try:
        # Handle the case where AI returns placeholder text like "<task_id>"
        if search_term.startswith("<") and search_term.endswith(">"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid task identifier provided. Please provide a valid task ID or description to delete the task."
            )

        # Search for tasks matching the search term
        matching_tasks = search_tasks_by_title_or_description(search_term, current_user, session)

        if not matching_tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Could not find a task with the description '{search_term}'. Please provide the task ID or a more specific description to delete the task."
            )
        elif len(matching_tasks) > 1:
            # If multiple tasks match, return a list of matching tasks
            task_titles = [f"'{task.title}' (ID: {task.id})" for task in matching_tasks[:5]]  # Limit to first 5
            task_list_str = ", ".join(task_titles)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Found multiple tasks matching '{search_term}'. Please provide the specific task ID to delete. Matching tasks: {task_list_str}"
            )
        else:
            # Exactly one task matched
            task = matching_tasks[0]

            if task.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to delete this task"
                )

            # Delete the task
            session.delete(task)
            session.commit()

            return {
                "success": True,
                "message": f"Task '{task.title}' deleted successfully",
                "task_id": str(task.id)
            }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )


def complete_all_pending_tasks(
    current_user: User = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    Mark all pending tasks as completed for the current user.

    Args:
        current_user: The authenticated user
        session: Database session

    Returns:
        Dictionary with success status and summary of completed tasks
    """
    try:
        # Get all pending tasks for the user
        query = select(Task).where(
            (Task.user_id == current_user.id) &
            (Task.completed == False)
        )

        pending_tasks = session.exec(query.order_by(Task.created_at.desc())).all()

        if not pending_tasks:
            return {
                "success": True,
                "message": "No pending tasks to complete.",
                "count": 0,
                "tasks_completed": []
            }

        # Update all pending tasks to completed
        completed_task_titles = []
        for task in pending_tasks:
            task.completed = True
            task.updated_at = datetime.utcnow()
            session.add(task)
            completed_task_titles.append(task.title)

        session.commit()

        return {
            "success": True,
            "message": f"Successfully completed {len(pending_tasks)} pending task(s).",
            "count": len(pending_tasks),
            "tasks_completed": [
                {
                    "id": str(task.id),
                    "title": task.title,
                    "priority": task.priority.value
                } for task in pending_tasks
            ]
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete all pending tasks: {str(e)}"
        )