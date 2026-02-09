'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthToken, removeAuthToken, makeAuthenticatedRequest } from '@/lib/auth';

interface UserProfile {
  id: string;
  email: string;
  provider: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  last_login: string | null;
  profile_picture?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  theme_preference?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user profile');
        // Fallback to basic user data from token if profile fetch fails
        const token = getAuthToken();
        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = parts[1];
              const decodedPayload = JSON.parse(atob(payload));
              setUser({
                id: decodedPayload.sub,
                email: '', // We don't have email from token, will update once profile loads
                provider: decodedPayload.provider || 'email'
              } as UserProfile);
            }
          } catch (error) {
            console.error('Token decode error:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkAuthStatus = async () => {
    if (isAuthenticated()) {
      const token = getAuthToken();
      if (token) {
        try {
          // First decode token to get basic user info
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = parts[1];
            const decodedPayload = JSON.parse(atob(payload));

            // Set initial user data from token
            setUser({
              id: decodedPayload.sub,
              email: '', // Will fetch from profile API
              provider: decodedPayload.provider || 'email'
            } as UserProfile);

            // Then fetch complete user profile
            await fetchUserProfile();
          }
        } catch (error) {
          console.error('Token decode error:', error);
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const refreshUserProfile = async () => {
    if (isAuthenticated()) {
      await fetchUserProfile();
    }
  };

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    await checkAuthStatus(); // Changed to async to ensure profile is loaded
  };

  const logout = async () => {
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
      setUser(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuthStatus, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
