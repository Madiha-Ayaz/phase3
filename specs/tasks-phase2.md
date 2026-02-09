# Phase 2 Atomic Tasks

## T1 - User and Task models with provider field

### Description
Implement User and Task models with proper fields, relationships, and constraints using SQLModel.

### Implementation Steps
- [ ] Create User model with fields: id (UUID, PK), email (VARCHAR, unique), hashed_password (VARCHAR, nullable), provider (VARCHAR, enum: email/google/github), created_at (timestamp), last_login (timestamp)
- [ ] Add proper constraints: email unique, provider enum validation
- [ ] Create Task model with fields: id (UUID, PK), user_id (UUID, FK), title (VARCHAR), description (TEXT), completed (boolean), priority (enum: low/medium/high), tags (array), created_at (timestamp)
- [ ] Define relationship between User and Task models
- [ ] Add proper foreign key constraint with cascade delete
- [ ] Implement proper indexing for performance
- [ ] Add validation constraints for all fields
- [ ] Test model creation and basic operations

### Acceptance Criteria
- [ ] User model includes all required fields with proper types
- [ ] Task model includes all required fields with proper types
- [ ] Provider field accepts only 'email', 'google', or 'github' values
- [ ] User and Task models have proper relationship defined
- [ ] Foreign key constraint is properly implemented
- [ ] All constraints and validations work correctly
- [ ] Models can be created and used in database operations

### Dependencies
- Neon Serverless PostgreSQL
- SQLModel

---

## T2 - Email/password signup and login

### Description
Implement email/password authentication including registration and login functionality.

### Implementation Steps
- [ ] Create password hashing utility using bcrypt
- [ ] Implement email validation utility
- [ ] Create register endpoint POST /auth/register
- [ ] Validate email format and password strength
- [ ] Check for existing email before creating user
- [ ] Hash password and create user record with provider='email'
- [ ] Implement login endpoint POST /auth/login
- [ ] Verify email and password match stored hash
- [ ] Update last_login timestamp on successful login
- [ ] Return appropriate error messages for invalid credentials
- [ ] Add rate limiting to prevent brute force attacks
- [ ] Test registration flow with valid and invalid inputs
- [ ] Test login flow with valid and invalid credentials

### Acceptance Criteria
- [ ] Users can register with unique email and password
- [ ] Passwords are securely hashed before storage
- [ ] Duplicate email registration is prevented
- [ ] Users can login with registered email and password
- [ ] Invalid credentials return appropriate error messages
- [ ] Last login timestamp is updated on successful login
- [ ] Password strength requirements are enforced
- [ ] Rate limiting is implemented on auth endpoints

### Dependencies
- User model from T1
- Password hashing library (bcrypt)
- Email validation utility

---

## T3 - Google OAuth endpoints

### Description
Implement Google OAuth2 authentication endpoints for user login.

### Implementation Steps
- [ ] Set up Google OAuth2 client configuration
- [ ] Create Google OAuth initiation endpoint GET /auth/google
- [ ] Generate OAuth authorization URL with proper scopes
- [ ] Create Google OAuth callback endpoint GET /auth/google/callback
- [ ] Exchange authorization code for access token
- [ ] Retrieve user information from Google API
- [ ] Check if user exists by email in database
- [ ] Create new user if not found, update if found
- [ ] Set provider field to 'google' for OAuth users
- [ ] Generate JWT token upon successful authentication
- [ ] Handle OAuth errors gracefully
- [ ] Test Google OAuth flow with real Google account
- [ ] Validate Google user data before creating/updating user

### Acceptance Criteria
- [ ] Google OAuth initiation endpoint redirects to Google login
- [ ] Google OAuth callback endpoint processes authorization code
- [ ] User information is retrieved from Google API
- [ ] Existing users are found by email and updated
- [ ] New users are created with provider='google'
- [ ] JWT token is generated upon successful OAuth
- [ ] OAuth errors are handled gracefully
- [ ] User data is validated before database operations

### Dependencies
- User model from T1
- JWT token implementation from T5
- Google OAuth2 client library
- Google API credentials

---

## T4 - GitHub OAuth endpoints

### Description
Implement GitHub OAuth2 authentication endpoints for user login.

### Implementation Steps
- [ ] Set up GitHub OAuth2 client configuration
- [ ] Create GitHub OAuth initiation endpoint GET /auth/github
- [ ] Generate OAuth authorization URL with proper scopes
- [ ] Create GitHub OAuth callback endpoint GET /auth/github/callback
- [ ] Exchange authorization code for access token
- [ ] Retrieve user information from GitHub API
- [ ] Check if user exists by email in database
- [ ] Create new user if not found, update if found
- [ ] Set provider field to 'github' for OAuth users
- [ ] Generate JWT token upon successful authentication
- [ ] Handle OAuth errors gracefully
- [ ] Test GitHub OAuth flow with real GitHub account
- [ ] Validate GitHub user data before creating/updating user

### Acceptance Criteria
- [ ] GitHub OAuth initiation endpoint redirects to GitHub login
- [ ] GitHub OAuth callback endpoint processes authorization code
- [ ] User information is retrieved from GitHub API
- [ ] Existing users are found by email and updated
- [ ] New users are created with provider='github'
- [ ] JWT token is generated upon successful OAuth
- [ ] OAuth errors are handled gracefully
- [ ] User data is validated before database operations

### Dependencies
- User model from T1
- JWT token implementation from T5
- GitHub OAuth2 client library
- GitHub API credentials

---

## T5 - JWT token creation on all auth methods

### Description
Implement JWT token generation and validation for all authentication methods (email, Google, GitHub).

### Implementation Steps
- [ ] Set up JWT configuration with secret key and expiration time
- [ ] Create JWT token generation utility function
- [ ] Include user_id and provider in token payload
- [ ] Implement JWT token validation middleware
- [ ] Add token expiration handling
- [ ] Create refresh token mechanism (optional)
- [ ] Integrate JWT creation with email auth (T2)
- [ ] Integrate JWT creation with Google OAuth (T3)
- [ ] Integrate JWT creation with GitHub OAuth (T4)
- [ ] Implement token validation on protected endpoints
- [ ] Add proper error handling for invalid tokens
- [ ] Test token generation for all auth methods
- [ ] Test token validation on protected endpoints

### Acceptance Criteria
- [ ] JWT tokens are generated upon successful email authentication
- [ ] JWT tokens are generated upon successful Google OAuth
- [ ] JWT tokens are generated upon successful GitHub OAuth
- [ ] Tokens contain user_id and provider information
- [ ] Tokens expire after configured time
- [ ] Protected endpoints validate JWT tokens correctly
- [ ] Invalid tokens return 401 Unauthorized
- [ ] Token refresh mechanism works if implemented

### Dependencies
- User model from T1
- Email auth from T2
- Google OAuth from T3
- GitHub OAuth from T4
- JWT library

---

## T6 - Frontend login page with Google/GitHub buttons

### Description
Create a responsive login page with email/password form and social login buttons for Google and GitHub.

### Implementation Steps
- [ ] Set up Next.js project with Tailwind CSS
- [ ] Create authentication context for user state management
- [ ] Create login page component at /login route
- [ ] Implement email/password login form with validation
- [ ] Create Google OAuth login button with proper styling
- [ ] Create GitHub OAuth login button with proper styling
- [ ] Implement form submission handlers
- [ ] Add loading states for form submissions
- [ ] Add error message display for auth failures
- [ ] Implement responsive design with Tailwind
- [ ] Apply neon gradient and glassmorphism styling
- [ ] Add navigation to signup page
- [ ] Add navigation from login to dashboard after auth
- [ ] Test login form with valid and invalid inputs
- [ ] Test social login buttons redirect to backend endpoints

### Acceptance Criteria
- [ ] Login page displays email/password form correctly
- [ ] Google OAuth button is present and styled properly
- [ ] GitHub OAuth button is present and styled properly
- [ ] Form validation works for email and password
- [ ] Social login buttons redirect to backend OAuth endpoints
- [ ] Error messages are displayed for failed login attempts
- [ ] Loading states are shown during auth requests
- [ ] Page is responsive on different screen sizes
- [ ] Neon gradient and glassmorphism styling is applied
- [ ] Successful login navigates to dashboard

### Dependencies
- Backend auth endpoints (T2, T3, T4)
- JWT token handling
- Tailwind CSS
- Next.js routing

---

## T7 - Dashboard with task CRUD

### Description
Create a dashboard page with task management functionality including create, read, update, and delete operations.

### Implementation Steps
- [ ] Create dashboard layout component
- [ ] Implement protected route that requires authentication
- [ ] Create task list component to display user's tasks
- [ ] Implement task creation form with title, description, priority, tags
- [ ] Create task editing functionality
- [ ] Implement task deletion with confirmation
- [ ] Add task completion toggle functionality
- [ ] Add filtering and sorting options for tasks
- [ ] Implement pagination for task list
- [ ] Add API service to communicate with backend
- [ ] Implement JWT token attachment to API requests
- [ ] Add loading states for API operations
- [ ] Add error handling for API failures
- [ ] Implement responsive design for dashboard
- [ ] Apply neon gradient and glassmorphism styling
- [ ] Test all CRUD operations with valid and invalid inputs
- [ ] Test user isolation (users only see their tasks)

### Acceptance Criteria
- [ ] Dashboard requires authentication to access
- [ ] Task list displays user's tasks correctly
- [ ] Users can create new tasks with all required fields
- [ ] Users can edit existing tasks
- [ ] Users can delete tasks with confirmation
- [ ] Users can toggle task completion status
- [ ] Task filtering and sorting work correctly
- [ ] Pagination works for large task lists
- [ ] JWT tokens are properly attached to API requests
- [ ] Loading states are shown during API operations
- [ ] Error messages are displayed for API failures
- [ ] Page is responsive on different screen sizes
- [ ] Neon gradient and glassmorphism styling is applied
- [ ] Users only see their own tasks (user isolation)