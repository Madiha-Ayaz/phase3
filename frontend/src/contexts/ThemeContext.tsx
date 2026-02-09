'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { makeAuthenticatedRequest } from '../lib/auth';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('dark');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from user profile
  useEffect(() => {
    const loadThemePreference = async () => {
      if (user?.id) {
        try {
          const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);

          if (response.ok) {
            const userData = await response.json();
            const userTheme = userData.theme_preference || 'dark';
            setThemeState(userTheme);

            // Apply the theme
            applyTheme(userTheme);
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
          // Fallback to system preference or dark mode
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const fallbackTheme = systemPrefersDark ? 'dark' : 'light';
          setThemeState(fallbackTheme);
          applyTheme(fallbackTheme);
        }
      }
    };

    loadThemePreference();
  }, [user?.id]);

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const html = document.documentElement;

    // Remove existing theme classes
    html.classList.remove('light', 'dark');

    let isDark: boolean;

    if (theme === 'auto') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark = systemPrefersDark;
    } else {
      isDark = theme === 'dark';
    }

    // Apply the appropriate class
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }

    setIsDarkMode(isDark);
  };

  const setTheme = async (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    // Save theme preference to user profile
    if (user?.id) {
      try {
        await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            theme_preference: newTheme,
          }),
        });
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}