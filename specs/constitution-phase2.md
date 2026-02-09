# Hackathon II: Full-Stack Web Application Constitution - Phase 2

## Core Principles

### I. Strictly Spec-Driven Development
All code must be generated only after completing the specification, plan, and task phases. No manual coding is allowed without proper specifications. Every code change must reference a task ID from the task breakdown.

### II. Monorepo with Next.js frontend and FastAPI backend
The application will be structured as a monorepo with a Next.js frontend and FastAPI backend. This provides a unified development experience with shared code where appropriate, while maintaining the separation of concerns between frontend and backend concerns.

### III. Neon Serverless PostgreSQL with SQLModel
Database storage will use Neon Serverless PostgreSQL with SQLModel for ORM operations. This provides serverless scaling, automatic branching capabilities, and type-safe database operations with Python.

### IV. Authentication with email/password, Google OAuth, GitHub OAuth
Authentication system will support multiple methods: traditional email/password authentication as well as OAuth integration with Google and GitHub. This provides users with flexible authentication options while maintaining security.

### V. JWT tokens for session
User sessions will be managed using JWT (JSON Web Tokens) for stateless authentication across the application. This enables scalable session management without server-side session storage.

### VI. User isolation in tasks
Each user's tasks will be isolated from other users, ensuring data privacy and security. Users will only have access to their own tasks and data.

### VII. Responsive UI with Tailwind, neon gradient, glassmorphism
The user interface will be fully responsive and designed with Tailwind CSS, incorporating modern design elements including neon gradients and glassmorphism effects for an engaging user experience.

## Additional Constraints

### Technology Stack
- Frontend: Next.js 14+ with App Router
- Backend: FastAPI 0.104+
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel
- Styling: Tailwind CSS
- Authentication: JWT tokens with email/password and OAuth (Google, GitHub)
- Design: Neon gradients, glassmorphism effects

### Code Quality
- Follow Next.js and FastAPI best practices
- Implement proper TypeScript/Python typing
- Include meaningful comments referencing task IDs
- Implement proper separation of concerns between frontend and backend
- Write maintainable, readable code with consistent architecture

### Architecture Requirements
- Clean API design with proper RESTful endpoints
- Secure authentication and authorization middleware
- Proper error handling and validation
- Clear separation between business logic, data access, and presentation layers
- Type-safe data transfer between frontend and backend

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

## Governance

This constitution supersedes all other development practices for Phase 2 of this project. Any deviations require explicit approval and documentation of an amendment.

**Version**: 1.0.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2025-12-30