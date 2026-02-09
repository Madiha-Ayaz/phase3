// Authentication utilities for the Todo App

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get the authentication token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set the authentication token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove the authentication token (logout)
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('authProvider');
};

// Get the authentication provider
export const getAuthProvider = (): string | null => {
  return localStorage.getItem('authProvider');
};

// Get user info from token (decode JWT payload)
export const getUserFromToken = (): { sub: string; provider: string } | null => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Split the token to get the payload part (middle part of JWT)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload);
    const parsedPayload = JSON.parse(decodedPayload);

    return {
      sub: parsedPayload.sub,
      provider: parsedPayload.provider || 'email'
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Make authenticated API request
export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const authenticatedOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, authenticatedOptions);

  // If token is expired or invalid, redirect to login
  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
  }

  return response;
};

// Login with email and password
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data.access_token);
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.detail || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

// Register with email and password
export const registerWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data.access_token);
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.detail || 'Registration failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint to notify server of logout
    const token = getAuthToken();
    if (token) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.warn('Backend logout failed, proceeding with local logout:', error);
    // Even if backend logout fails, we should still clear local storage
  } finally {
    // Always clear local storage regardless of backend response
    removeAuthToken();
    window.location.href = '/login';
  }
};

// Initiate Google OAuth flow
export const initiateGoogleAuth = (): void => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
};

// Initiate GitHub OAuth flow
export const initiateGitHubAuth = (): void => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;
};