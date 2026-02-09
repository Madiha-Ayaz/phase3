# Task CRUD API Specification

## 1. Overview

This specification defines the REST API endpoints for Task CRUD (Create, Read, Update, Delete) operations. All endpoints require JWT authentication and user isolation based on the user_id from the token.

## 2. Scope

### 2.1 In Scope
- GET /api/tasks - List user's tasks with filtering and pagination
- POST /api/tasks - Create new task with title, description, priority, tags
- PUT /api/tasks/{id} - Update existing task
- DELETE /api/tasks/{id} - Delete task
- PATCH /api/tasks/{id}/complete - Toggle task completion status
- JWT authentication and user isolation
- Input validation and error handling
- Proper HTTP status codes

### 2.2 Out of Scope
- Task sharing between users
- Advanced search functionality beyond basic filtering
- Task categorization beyond tags
- Task history/versioning

## 3. Authentication & Authorization

### 3.1 JWT Token Requirements
- All endpoints require a valid JWT token in the Authorization header
- Format: `Authorization: Bearer <token>`
- Token must contain valid user_id claim
- Requests without valid JWT return 401 Unauthorized
- Requests with invalid/expired JWT return 401 Unauthorized

### 3.2 User Isolation
- Each endpoint validates that the requested task belongs to the authenticated user
- Users can only access their own tasks
- Attempts to access other users' tasks return 403 Forbidden
- Task creation automatically associates the task with the authenticated user

## 4. API Endpoints

### 4.1 GET /api/tasks
**Description**: Retrieve a list of tasks for the authenticated user

**Authentication**: Required (JWT)

**Query Parameters**:
- `limit` (optional, integer, default: 20): Maximum number of tasks to return
- `offset` (optional, integer, default: 0): Number of tasks to skip for pagination
- `status` (optional, string): Filter by status (all, active, completed)
- `priority` (optional, string): Filter by priority (low, medium, high)
- `tag` (optional, string): Filter by tag
- `search` (optional, string): Search in title and description

**Response**:
- Status: 200 OK
- Body:
```json
{
  "tasks": [
    {
      "id": "uuid-string",
      "title": "Task title",
      "description": "Task description",
      "priority": "high|medium|low",
      "completed": true|false,
      "tags": ["tag1", "tag2"],
      "created_at": "2023-12-01T10:00:00Z",
      "updated_at": "2023-12-01T10:00:00Z",
      "user_id": "user-uuid"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid JWT token
- 422 Unprocessable Entity: Invalid query parameters

### 4.2 POST /api/tasks
**Description**: Create a new task for the authenticated user

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "priority": "high|medium|low (default: medium)",
  "tags": ["tag1", "tag2"] (optional, array of strings)
}
```

**Validation**:
- Title is required and must be 1-255 characters
- Description is optional, max 1000 characters
- Priority must be one of: "high", "medium", "low"
- Tags are optional, max 10 tags, each 1-50 characters

**Response**:
- Status: 201 Created
- Body:
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low",
  "completed": false,
  "tags": ["tag1", "tag2"],
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z",
  "user_id": "user-uuid"
}
```

**Error Responses**:
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid JWT token
- 422 Unprocessable Entity: Validation errors

### 4.3 PUT /api/tasks/{id}
**Description**: Update an existing task for the authenticated user

**Authentication**: Required (JWT)

**Path Parameter**:
- `id` (required): Task UUID

**Request Body**:
```json
{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"] (optional, array of strings)
}
```

**Validation**:
- Same validation rules as POST endpoint
- Task ID must exist and belong to authenticated user

**Response**:
- Status: 200 OK
- Body:
```json
{
  "id": "uuid-string",
  "title": "Updated task title",
  "description": "Updated task description",
  "priority": "high|medium|low",
  "completed": true|false,
  "tags": ["tag1", "tag2"],
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T11:00:00Z",
  "user_id": "user-uuid"
}
```

**Error Responses**:
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: Task doesn't belong to user
- 404 Not Found: Task not found
- 422 Unprocessable Entity: Validation errors

### 4.4 DELETE /api/tasks/{id}
**Description**: Delete an existing task for the authenticated user

**Authentication**: Required (JWT)

**Path Parameter**:
- `id` (required): Task UUID

**Response**:
- Status: 204 No Content

**Error Responses**:
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: Task doesn't belong to user
- 404 Not Found: Task not found

### 4.5 PATCH /api/tasks/{id}/complete
**Description**: Toggle the completion status of a task for the authenticated user

**Authentication**: Required (JWT)

**Path Parameter**:
- `id` (required): Task UUID

**Request Body**:
```json
{
  "completed": true|false (optional, if omitted, toggle current status)
}
```

**Response**:
- Status: 200 OK
- Body:
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low",
  "completed": true|false,
  "tags": ["tag1", "tag2"],
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T11:00:00Z",
  "user_id": "user-uuid"
}
```

**Error Responses**:
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: Task doesn't belong to user
- 404 Not Found: Task not found
- 422 Unprocessable Entity: Invalid completed value

## 5. Database Schema

### 5.1 Task Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

## 6. Security Considerations

### 6.1 Authentication
- All endpoints require JWT token validation
- Token must contain valid user_id
- Tokens must not be expired

### 6.2 Authorization
- User isolation: Users can only access their own tasks
- Proper validation of task ownership on each request
- No direct access to other users' tasks

### 6.3 Input Validation
- All user inputs must be validated
- SQL injection prevention through parameterized queries
- Proper sanitization of user inputs

## 7. Error Handling

### 7.1 Standard Error Format
```json
{
  "detail": "Error message",
  "status_code": 404,
  "error_code": "TASK_NOT_FOUND"
}
```

### 7.2 Error Codes
- `AUTHENTICATION_REQUIRED`: 401 - Missing or invalid JWT
- `TASK_NOT_FOUND`: 404 - Task doesn't exist
- `TASK_ACCESS_DENIED`: 403 - User doesn't own the task
- `VALIDATION_ERROR`: 422 - Request validation failed
- `INTERNAL_ERROR`: 500 - Server error

## 8. Performance Considerations

### 8.1 Pagination
- Default limit of 20 items per page
- Support for offset-based pagination
- Total count returned with results

### 8.2 Indexing
- Index on user_id for efficient user task retrieval
- Index on completed status for filtering
- Index on priority for sorting/filtering

## 9. Acceptance Criteria

### 9.1 Authentication & Authorization
- [ ] All endpoints require valid JWT token
- [ ] Users can only access their own tasks
- [ ] Invalid tokens return 401 Unauthorized
- [ ] Access to other users' tasks returns 403 Forbidden

### 9.2 Endpoint Functionality
- [ ] GET /api/tasks returns user's tasks with proper pagination
- [ ] POST /api/tasks creates new task for authenticated user
- [ ] PUT /api/tasks/{id} updates existing task
- [ ] DELETE /api/tasks/{id} removes task
- [ ] PATCH /api/tasks/{id}/complete toggles completion status

### 9.3 Validation & Error Handling
- [ ] Input validation prevents invalid data
- [ ] Proper error responses for all error conditions
- [ ] Task ownership validation works correctly
- [ ] Pagination works as specified

## 10. Dependencies

- JWT authentication middleware
- Database connection (Neon PostgreSQL)
- SQLModel for database operations
- UUID generation for task IDs
- Input validation library