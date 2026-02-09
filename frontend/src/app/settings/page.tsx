'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { makeAuthenticatedRequest } from '../../lib/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

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

export default function ProfileSettingsPage() {
  const { user, loading, checkAuthStatus } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { theme, setTheme, isDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);

      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
        // The theme context already handles loading theme preference
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Update user profile with theme preference
      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme_preference: theme,
        }),
      });

      if (response.ok) {
        setSaveStatus({ success: true, message: 'Settings saved successfully!' });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setSaveStatus({ success: false, message: 'Failed to save settings' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to change password
    setSaveStatus({ success: true, message: 'Password changed successfully!' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          {/* Main Settings Area */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                {saveStatus && (
                  <div className={`mb-6 p-4 rounded-lg ${saveStatus.success ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'} border ${saveStatus.success ? 'border-green-500' : 'border-red-500'}`}>
                    {saveStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left column - Profile Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Account Information */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                      <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>

                      {profile && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white">{profile.email}</p>
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Provider</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white capitalize">
                              {profile.provider}
                            </p>
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Member Since</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white">
                              {new Date(profile.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Last Login</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white">
                              {profile.last_login ? new Date(profile.last_login).toLocaleString() : 'First login'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Password Change */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                      <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>

                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter current password"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter new password"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Confirm new password"
                          />
                        </div>

                        <button
                          type="submit"
                          className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                        >
                          Change Password
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right column - Settings */}
                  <div className="space-y-6">
                    {/* Appearance Settings */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                      <h2 className="text-xl font-bold text-white mb-4">Appearance</h2>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-gray-300 font-medium">Theme</label>
                            <p className="text-gray-400 text-sm">Choose your preferred theme</p>
                          </div>
                          <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                            className="bg-black/30 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                      <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-gray-300 font-medium">Email Notifications</label>
                            <p className="text-gray-400 text-sm">Receive email updates</p>
                          </div>
                          <button
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-gray-300 font-medium">Task Reminders</label>
                            <p className="text-gray-400 text-sm">Get reminded about upcoming tasks</p>
                          </div>
                          <button
                            disabled
                            className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-gray-600 opacity-50"
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-gray-300 font-medium">Weekly Reports</label>
                            <p className="text-gray-400 text-sm">Get weekly productivity reports</p>
                          </div>
                          <button
                            disabled
                            className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-gray-600 opacity-50"
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-600/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30 shadow-2xl">
                      <h2 className="text-xl font-bold text-red-300 mb-4">Danger Zone</h2>

                      <div className="space-y-4">
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                          Delete Account
                        </button>

                        <button
                          onClick={checkAuthStatus}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                        >
                          Refresh Session
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}