# Hackathon II: In-Memory Python Console Todo App Constitution

## Core Principles

### I. Strictly Spec-Driven Development
All code must be generated only after completing the specification, plan, and task phases. No manual coding is allowed without proper specifications. Every code change must reference a task ID from the task breakdown.

### II. Python Standard Library Only
Use only Python standard library modules. No external packages or dependencies are allowed. This ensures portability and simplicity of the application.

### III. In-Memory Storage
All data must be stored in memory only, with no persistent storage. Data will be lost when the application terminates. This keeps the implementation simple and focused on core functionality.

### IV. Clean CLI Interface
Provide a clean, intuitive command-line interface with a numbered menu system. The interface should be user-friendly and clearly display available options and current state.

### V. Robust Error Handling
Implement comprehensive error handling for all user inputs. The application should gracefully handle invalid commands, incorrect parameters, and edge cases without crashing.

## Additional Constraints

### Technology Stack
- Python 3.x
- Standard library only (no pip packages)
- Console/terminal interface

### Code Quality
- Follow Python PEP 8 style guidelines
- Include meaningful comments referencing task IDs
- Implement proper separation of concerns
- Write maintainable, readable code

### Architecture Requirements
- Object-oriented design with clear class responsibilities
- In-memory data structures for todo management
- Command pattern for handling user input
- Clear separation between business logic and UI

## Development Workflow

### Feature Implementation Process
1. Create specification document (spec.md)
2. Develop implementation plan (plan.md)
3. Define atomic tasks (tasks.md)
4. Implement code based on approved tasks
5. Test functionality against acceptance criteria

### Code Review Requirements
- Verify all code references a valid task ID
- Confirm adherence to standard library constraint
- Validate error handling implementation
- Ensure compliance with CLI interface design

## Governance

This constitution supersedes all other development practices for this project. Any deviations require explicit approval and documentation of an amendment.

**Version**: 1.0.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2025-12-27