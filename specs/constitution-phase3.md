# Hackathon II: AI-Powered Todo Chatbot Constitution - Phase 3

## Core Principles

### I. Strictly Spec-Driven Development
All code must be generated only after completing the specification, plan, and task phases. No manual coding is allowed without proper specifications. Every code change must reference a task ID from the task breakdown.

### II. Natural Language Task Management Using Groq API
The application will leverage the Groq API for natural language processing, enabling users to manage their tasks through conversational commands. Users can speak or type naturally to create, update, delete, and query their tasks using AI-powered understanding.

### III. MCP Tools for Task CRUD Operations
Task management operations (Create, Read, Update, Delete) will be facilitated through MCP (Model-Controller-Presenter) architectural pattern, ensuring clean separation of concerns and maintainable code structure for all task-related functionality.

### IV. Conversation History Stored in Neon DB
All chat interactions and conversation history will be persistently stored in Neon Serverless PostgreSQL database, allowing users to access their historical conversations and maintain continuity across sessions.

### V. AI Chat Interface as Primary Dashboard/Home Page When Logged In
Upon successful authentication, users will be directed to an AI-powered chat interface that serves as the primary dashboard and home page, integrating seamlessly with task management functionality for a conversational experience.

### VI. Footer on Every Page
A consistent footer element will be present on every page of the application, providing navigation aids, copyright information, and other relevant links or disclaimers as needed.

### VII. UI with Neon Gradient, Glassmorphism, Task List and Chat Integration
The user interface will feature modern design elements including neon gradients and glassmorphism effects, with seamless integration between the traditional task list view and the AI chat interface for a cohesive user experience.

### VIII. Responsive Design
The application will be fully responsive, ensuring optimal viewing and interaction experiences across all device types and screen sizes, from mobile devices to desktop computers.

## Additional Constraints

### Technology Stack
- Frontend: Next.js 14+ with App Router
- Backend: FastAPI 0.104+
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel
- AI/ML: Groq API for natural language processing
- Styling: Tailwind CSS
- Design: Neon gradients, glassmorphism effects
- Authentication: JWT tokens with email/password and OAuth (Google, GitHub)

### Code Quality
- Follow Next.js and FastAPI best practices
- Implement proper TypeScript/Python typing
- Include meaningful comments referencing task IDs
- Implement proper separation of concerns between frontend and backend
- Write maintainable, readable code with consistent architecture
- Ensure proper error handling for AI API calls and network requests

### Architecture Requirements
- Clean API design with proper RESTful endpoints
- Secure authentication and authorization middleware
- Proper error handling and validation
- Clear separation between business logic, data access, and presentation layers
- Type-safe data transfer between frontend and backend
- Efficient integration between chat interface and task management systems
- Proper handling of AI API rate limiting and error states

## Development Workflow

### Feature Implementation Process
1. Create specification document (spec.md)
2. Develop implementation plan (plan.md)
3. Define atomic tasks (tasks.md)
4. Implement code based on approved tasks
5. Test functionality against acceptance criteria

### Code Review Requirements
- Verify all code references a valid task ID
- Confirm adherence to technology stack constraints
- Validate authentication and authorization implementation
- Ensure user data isolation is properly implemented
- Check responsive design and UI/UX implementation
- Verify AI API integration and error handling
- Confirm proper database schema for conversation history

## Governance

This constitution supersedes all other development practices for Phase 3 of this project. Any deviations require explicit approval and documentation of an amendment.

**Version**: 1.0.0 | **Ratified**: 2026-01-12 | **Last Amended**: 2026-01-12