# In-Memory Python Console Todo App Tasks

## Task List

### Task 1: Create TodoManager Class
- **ID**: todo-001
- **Description**: Implement the TodoManager class with in-memory storage
- **Acceptance Criteria**:
  - Create a TodoManager class
  - Initialize with an empty list for storing todos
  - Todos stored as dictionaries with id, description, completed keys
  - IDs start from 1 and increment for each new todo
- **Dependencies**: None
- **Tests**: Unit tests for add, get, complete, delete operations

### Task 2: Implement Add Todo Functionality
- **ID**: todo-002
- **Description**: Implement method to add new todos
- **Acceptance Criteria**:
  - Method to add a new todo with description
  - Auto-generate unique IDs starting from 1
  - New todos are marked as incomplete by default
  - Returns the ID of the newly added todo
- **Dependencies**: Task 1
- **Tests**: Test adding todos, verify ID generation, verify completion status

### Task 3: Implement List Todos Functionality
- **ID**: todo-003
- **Description**: Implement method to retrieve all todos
- **Acceptance Criteria**:
  - Method to return all todos
  - Todos include ID, description, and completion status
  - Returns empty list when no todos exist
- **Dependencies**: Task 1
- **Tests**: Test listing todos, verify format, test with empty list

### Task 4: Implement Complete Todo Functionality
- **ID**: todo-004
- **Description**: Implement method to mark todos as completed
- **Acceptance Criteria**:
  - Method to mark a todo as completed by ID
  - Validates that todo exists before updating
  - Returns True on success, False if todo doesn't exist
- **Dependencies**: Task 1
- **Tests**: Test completing existing todos, test with invalid IDs

### Task 5: Implement Delete Todo Functionality
- **ID**: todo-005
- **Description**: Implement method to delete todos by ID
- **Acceptance Criteria**:
  - Method to remove a todo by ID
  - Validates that todo exists before deletion
  - Returns True on success, False if todo doesn't exist
- **Dependencies**: Task 1
- **Tests**: Test deleting existing todos, test with invalid IDs

### Task 6: Create Console Interface
- **ID**: todo-006
- **Description**: Implement the console interface for user interaction
- **Acceptance Criteria**:
  - Display menu with available commands
  - Process user commands (add, list, complete, delete, quit)
  - Format and display todos in a readable format
  - Handle user input validation
- **Dependencies**: Tasks 1-5
- **Tests**: Test command processing, test menu display

### Task 7: Implement Main Application Loop
- **ID**: todo-007
- **Description**: Create the main application loop that orchestrates all components
- **Acceptance Criteria**:
  - Initialize TodoManager and ConsoleInterface
  - Run main loop until user chooses to quit
  - Handle exit gracefully
- **Dependencies**: Tasks 1-6
- **Tests**: Test application flow, test graceful exit

### Task 8: Add Error Handling
- **ID**: todo-008
- **Description**: Implement comprehensive error handling throughout the application
- **Acceptance Criteria**:
  - Handle invalid todo IDs gracefully
  - Handle invalid commands gracefully
  - Provide helpful error messages to users
  - Prevent application crashes from invalid input
- **Dependencies**: Tasks 1-7
- **Tests**: Test error conditions, verify graceful handling

### Task 9: Add Help Functionality
- **ID**: todo-009
- **Description**: Implement help command to show available commands
- **Acceptance Criteria**:
  - Help command shows all available commands
  - Help includes brief description of each command
  - Accessible via 'help' or '?' command
- **Dependencies**: Task 6
- **Tests**: Test help command, verify output format