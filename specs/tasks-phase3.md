# Phase 3 Atomic Tasks

## T1 - Update models.py for Conversation and Message

### Description
Update the database models to include Conversation and Message models for storing chat history, while preserving existing User and Task models.

### Implementation Steps
- [ ] Add Conversation model with fields: id (UUID, PK), user_id (UUID, FK to User), created_at (timestamp)
- [ ] Add Message model with fields: id (UUID, PK), conversation_id (UUID, FK to Conversation), role (enum: 'user'/'assistant'), content (TEXT), created_at (timestamp)
- [ ] Define proper relationships between User-Conversation and Conversation-Message
- [ ] Add foreign key constraints with cascade delete
- [ ] Add proper indexing for performance (user_id, conversation_id, created_at)
- [ ] Add validation constraints for role field ('user'/'assistant')
- [ ] Update User model to include relationship with conversations
- [ ] Update existing models if needed to maintain consistency
- [ ] Test model creation and basic operations
- [ ] Verify foreign key relationships work correctly

### Acceptance Criteria
- [ ] Conversation model includes all required fields with proper types
- [ ] Message model includes all required fields with proper types
- [ ] Role field accepts only 'user' or 'assistant' values
- [ ] User and Conversation models have proper relationship defined
- [ ] Conversation and Message models have proper relationship defined
- [ ] Foreign key constraints are properly implemented with cascade delete
- [ ] All constraints and validations work correctly
- [ ] Models can be created and used in database operations
- [ ] Existing User and Task models remain unchanged

### Dependencies
- Neon Serverless PostgreSQL
- SQLModel
- Existing User and Task models from Phase 2

---

## T2 - Implement MCP tools in mcp.py

### Description
Create a module containing the five MCP tools (Model-Controller-Presenter pattern) for task management operations that will be called by the AI chatbot.

### Implementation Steps
- [ ] Create mcp.py module with add_task function accepting title, description="", priority="medium", tags=""
- [ ] Implement proper validation for add_task parameters
- [ ] Return structured response with success status and task details
- [ ] Create list_tasks function accepting status="all" parameter
- [ ] Implement filtering logic for different status values (all, pending, completed, deleted)
- [ ] Create update_task function accepting id and optional fields (title, description, priority, tags)
- [ ] Implement partial update logic for update_task
- [ ] Create delete_task function accepting id parameter
- [ ] Implement soft delete by updating status to "deleted"
- [ ] Create toggle_complete function accepting id parameter
- [ ] Implement status toggling logic between "pending" and "completed"
- [ ] Add proper error handling for all tools (validation, not found, unauthorized)
- [ ] Ensure all tools use current_user.id for user-specific actions
- [ ] Add input validation and sanitization
- [ ] Test all tools with sample data
- [ ] Verify user isolation works correctly

### Acceptance Criteria
- [ ] add_task function creates tasks with provided parameters and associates with current user
- [ ] list_tasks function returns only tasks belonging to current user with optional status filtering
- [ ] update_task function updates only specified fields for user's tasks
- [ ] delete_task function marks tasks as deleted without permanent removal
- [ ] toggle_complete function toggles completion status correctly
- [ ] All tools validate that operations are performed on user's own tasks
- [ ] Proper error responses are returned for invalid operations
- [ ] Input validation prevents invalid data from being processed
- [ ] Tools return structured responses compatible with AI system

### Dependencies
- User and Task models from T1
- Current user authentication context
- Database session management

---

## T3 - Create /api/chat endpoint with Groq and MCP tools

### Description
Implement the chat API endpoint that integrates with Groq API for natural language processing and calls MCP tools based on recognized intents.

### Implementation Steps
- [ ] Create routes/chat.py with POST /api/chat endpoint
- [ ] Add authentication middleware to verify user is logged in
- [ ] Integrate with Groq API for natural language processing
- [ ] Implement intent recognition logic to classify user messages
- [ ] Map recognized intents to appropriate MCP tools (add_task, list_tasks, etc.)
- [ ] Parse parameters from natural language input
- [ ] Call appropriate MCP tools based on recognized intent
- [ ] Format MCP tool responses into natural language responses
- [ ] Save user message to Message table with role='user'
- [ ] Save AI response to Message table with role='assistant'
- [ ] Associate messages with proper conversation
- [ ] Implement conversation history retrieval
- [ ] Add proper error handling for Groq API failures
- [ ] Add error handling for MCP tool failures
- [ ] Test with sample natural language inputs
- [ ] Verify conversation history is persisted correctly

### Acceptance Criteria
- [ ] /api/chat endpoint accepts user messages and returns AI responses
- [ ] Authentication is verified before processing messages
- [ ] Natural language is correctly processed through Groq API
- [ ] Intents are correctly recognized (add task, list tasks, update task, delete task, toggle complete)
- [ ] Appropriate MCP tools are called based on recognized intents
- [ ] Parameters are correctly extracted from natural language
- [ ] Natural language responses are generated from MCP tool results
- [ ] User messages are saved to database with role='user'
- [ ] AI responses are saved to database with role='assistant'
- [ ] Conversation history is properly maintained and retrievable
- [ ] Error handling works for API failures and invalid inputs
- [ ] User isolation is maintained (cannot access others' conversations)

### Dependencies
- MCP tools from T2
- Conversation and Message models from T1
- Groq API configuration
- Authentication middleware

---

## T4 - Update frontend root page to AI Chat Dashboard

### Description
Transform the root page (page.tsx) into an AI Chat Dashboard that serves as the primary interface when users are logged in.

### Implementation Steps
- [ ] Modify root page (app/page.tsx) to serve as AI Chat Dashboard
- [ ] Implement conditional rendering based on authentication status
- [ ] Create layout with chat interface as main component
- [ ] Add sidebar or split-view for task list integration
- [ ] Implement real-time chat functionality using WebSocket or polling
- [ ] Display conversation history when loading the page
- [ ] Add message input field with send button
- [ ] Implement message sending functionality to /api/chat endpoint
- [ ] Add typing indicators during AI processing
- [ ] Implement scroll to bottom for new messages
- [ ] Add loading states during AI processing
- [ ] Implement error handling for chat failures
- [ ] Add message formatting for both user and assistant messages
- [ ] Test chat functionality with various inputs
- [ ] Verify layout responsiveness on different screen sizes

### Acceptance Criteria
- [ ] Root page displays AI Chat Dashboard when user is logged in
- [ ] Unauthenticated users are redirected to login page
- [ ] Chat interface is prominently displayed
- [ ] Conversation history loads and displays correctly
- [ ] User can send messages and receive AI responses
- [ ] Typing indicators show during AI processing
- [ ] New messages appear in real-time
- [ ] Message bubbles are styled differently for user vs assistant
- [ ] Loading states are shown during AI processing
- [ ] Error messages are displayed for chat failures
- [ ] Page is responsive on different screen sizes
- [ ] Layout integrates well with task list component

### Dependencies
- Backend chat API from T3
- Authentication context from Phase 2
- Task list component from T5

---

## T5 - Implement task list component

### Description
Create a reusable task list component that maintains existing task management functionality while integrating with the AI chat interface.

### Implementation Steps
- [ ] Create TaskList component with props for tasks and callbacks
- [ ] Implement display of tasks with title, status, priority, and tags
- [ ] Add task creation form with title, description, priority, tags
- [ ] Implement task editing functionality
- [ ] Add task deletion with confirmation
- [ ] Implement task completion toggle
- [ ] Add filtering and sorting options for tasks
- [ ] Add pagination for large task lists
- [ ] Implement real-time updates when tasks change via chat
- [ ] Add loading states for API operations
- [ ] Add error handling for API failures
- [ ] Apply neon gradient and glassmorphism styling
- [ ] Implement responsive design for different screen sizes
- [ ] Ensure component works independently and with chat integration
- [ ] Test all CRUD operations through the component
- [ ] Verify user isolation (only shows current user's tasks)

### Acceptance Criteria
- [ ] TaskList component displays tasks with all relevant information
- [ ] Users can create new tasks through the component
- [ ] Users can edit existing tasks
- [ ] Users can delete tasks with confirmation
- [ ] Users can toggle task completion status
- [ ] Filtering and sorting options work correctly
- [ ] Pagination works for large task lists
- [ ] Real-time updates work when tasks are modified via chat
- [ ] Loading states are shown during API operations
- [ ] Error messages are displayed for API failures
- [ ] Neon gradient and glassmorphism styling is applied
- [ ] Component is responsive on different screen sizes
- [ ] Component maintains user isolation (shows only user's tasks)

### Dependencies
- Backend task API from Phase 2
- Task types and interfaces
- Styling libraries (Tailwind CSS)

---

## T6 - Implement chat interface component

### Description
Create a standalone chat interface component that can be integrated into the dashboard and manages the chat experience.

### Implementation Steps
- [ ] Create ChatInterface component with message history display
- [ ] Implement message bubble styling with different appearance for user vs assistant
- [ ] Add message input field with send button
- [ ] Implement keyboard support (Enter to send, Shift+Enter for new line)
- [ ] Add scrollable message container that auto-scrolls to bottom
- [ ] Implement typing indicators during AI processing
- [ ] Add timestamp display for messages
- [ ] Implement message formatting (support for Markdown if needed)
- [ ] Add ability to clear conversation history
- [ ] Implement message error display
- [ ] Add loading states during message processing
- [ ] Implement responsive design for different screen sizes
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Apply neon gradient and glassmorphism styling
- [ ] Test with both English and Urdu text
- [ ] Ensure proper character encoding for multilingual support

### Acceptance Criteria
- [ ] ChatInterface component displays messages in bubble format
- [ ] User and assistant messages have different visual styles
- [ ] Message input field supports text entry and sending
- [ ] Keyboard shortcuts work (Enter to send, Shift+Enter for new line)
- [ ] Message container auto-scrolls to latest message
- [ ] Typing indicators show during AI processing
- [ ] Timestamps are displayed for messages
- [ ] Message formatting is properly applied
- [ ] Ability to clear conversation history is available
- [ ] Error states are properly displayed
- [ ] Loading states are shown during processing
- [ ] Component is responsive on different screen sizes
- [ ] Accessibility features are implemented
- [ ] Neon gradient and glassmorphism styling is applied
- [ ] Both English and Urdu text display correctly
- [ ] Proper character encoding is maintained

### Dependencies
- Backend chat API from T3
- Styling libraries (Tailwind CSS)
- Message types and interfaces

---

## T7 - Add global navbar and footer

### Description
Implement a consistent navigation bar and footer that appear on every page of the application.

### Implementation Steps
- [ ] Create Header component with navigation links and user profile
- [ ] Add logo and branding elements to header
- [ ] Implement navigation menu with links to main sections
- [ ] Add user profile dropdown with logout option
- [ ] Add responsive hamburger menu for mobile
- [ ] Create Footer component with consistent content
- [ ] Add copyright information to footer
- [ ] Include important links in footer (Privacy Policy, Terms, etc.)
- [ ] Add social media links to footer if applicable
- [ ] Implement consistent styling across header and footer
- [ ] Apply neon gradient and glassmorphism effects
- [ ] Ensure header and footer work on all pages
- [ ] Test responsive behavior on different screen sizes
- [ ] Add accessibility attributes to navigation elements
- [ ] Implement smooth scrolling for anchor links
- [ ] Verify navigation works correctly in authenticated/unauthenticated states

### Acceptance Criteria
- [ ] Header component appears consistently on all pages
- [ ] Footer component appears consistently on all pages
- [ ] Navigation links work correctly
- [ ] User profile dropdown shows when logged in
- [ ] Logout functionality works from header
- [ ] Responsive hamburger menu works on mobile
- [ ] Copyright information is displayed in footer
- [ ] Footer links work correctly
- [ ] Neon gradient and glassmorphism styling is applied
- [ ] Components are responsive on different screen sizes
- [ ] Accessibility attributes are implemented
- [ ] Navigation works in both authenticated and unauthenticated states
- [ ] Smooth scrolling works for anchor links

### Dependencies
- Routing system from Next.js
- Authentication context from Phase 2
- Styling libraries (Tailwind CSS)

---

## T8 - Make responsive

### Description
Ensure the entire application, especially the AI Chat Dashboard, is fully responsive across all device sizes and orientations.

### Implementation Steps
- [ ] Audit current layout for responsive issues
- [ ] Implement responsive grid layouts using Tailwind CSS
- [ ] Adjust chat interface for mobile screen sizes
- [ ] Optimize task list component for mobile viewing
- [ ] Ensure message bubbles are readable on small screens
- [ ] Adjust input fields and buttons for touch targets
- [ ] Implement collapsible sidebars for smaller screens
- [ ] Optimize header navigation for mobile (hamburger menu)
- [ ] Adjust footer layout for different screen sizes
- [ ] Test chat input field behavior on mobile keyboards
- [ ] Optimize conversation history display for mobile
- [ ] Ensure all interactive elements have proper touch targets
- [ ] Implement proper spacing and padding for all screen sizes
- [ ] Test orientation changes (portrait/landscape)
- [ ] Optimize loading states for mobile connections
- [ ] Verify all components maintain neon/glassmorphism effects on mobile
- [ ] Test with actual mobile devices if possible

### Acceptance Criteria
- [ ] Application layout adapts properly to mobile screen sizes
- [ ] Chat interface remains usable on small screens
- [ ] Task list is readable and functional on mobile
- [ ] Message bubbles are properly sized on all devices
- [ ] Input fields and buttons have adequate touch targets
- [ ] Sidebars collapse appropriately on smaller screens
- [ ] Header navigation works with hamburger menu on mobile
- [ ] Footer layout adjusts for different screen sizes
- [ ] Chat input behaves properly with mobile keyboards
- [ ] Conversation history displays well on mobile
- [ ] All interactive elements meet touch target requirements
- [ ] Proper spacing and padding are maintained across screen sizes
- [ ] Orientation changes are handled gracefully
- [ ] Loading states work well on slower mobile connections
- [ ] Visual effects (neon/glassmorphism) work on mobile
- [ ] No horizontal scrolling is required on mobile devices