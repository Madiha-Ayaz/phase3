'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
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
        setFormData(userData);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          location: formData.location,
          timezone: formData.timezone,
          theme_preference: formData.theme_preference,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setSaveStatus({ success: true, message: 'Profile updated successfully!' });
        setTimeout(() => setSaveStatus(null), 3000);
        setEditMode(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setSaveStatus({ success: false, message: 'Failed to update profile' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (profile) {
      setFormData(profile);
    }
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

          {/* Main Profile Area */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

                {saveStatus && (
                  <div className={`mb-6 p-4 rounded-lg ${saveStatus.success ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'} border ${saveStatus.success ? 'border-green-500' : 'border-red-500'}`}>
                    {saveStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Profile Picture and Basic Info */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
                          {profile?.first_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-white">
                          {profile?.first_name && profile?.last_name
                            ? `${profile.first_name} ${profile.last_name}`
                            : profile?.email || 'User'}
                        </h2>
                        <p className="text-gray-300">{profile?.email}</p>
                        <p className="text-gray-400 text-sm mt-1 capitalize">{profile?.provider || 'Email'}</p>
                      </div>

                      {editMode ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name || ''}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name || ''}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Last name"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="mb-4">
                            <p className="text-gray-300">Member Since</p>
                            <p className="text-white font-medium">
                              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-300">Last Login</p>
                            <p className="text-white font-medium">
                              {profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'First login'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Profile Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Personal Information</h2>
                        {!editMode && (
                          <button
                            onClick={() => setEditMode(true)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                          >
                            Edit Profile
                          </button>
                        )}
                      </div>

                      {editMode ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                            <textarea
                              name="bio"
                              value={formData.bio || ''}
                              onChange={handleInputChange}
                              rows={4}
                              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Location</label>
                            <input
                              type="text"
                              name="location"
                              value={formData.location || ''}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Your location"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Timezone</label>
                            <select
                              name="timezone"
                              value={formData.timezone || 'UTC'}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time (US)</option>
                              <option value="America/Chicago">Central Time (US)</option>
                              <option value="America/Denver">Mountain Time (US)</option>
                              <option value="America/Los_Angeles">Pacific Time (US)</option>
                              <option value="Europe/London">London</option>
                              <option value="Europe/Paris">Paris</option>
                              <option value="Asia/Tokyo">Tokyo</option>
                              <option value="Asia/Shanghai">Shanghai</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Theme Preference</label>
                            <select
                              name="theme_preference"
                              value={formData.theme_preference || 'dark'}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="dark">Dark</option>
                              <option value="light">Light</option>
                              <option value="auto">Auto</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white">
                              {profile?.bio || 'No bio provided'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Location</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white">
                              {profile?.location || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Timezone</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white">
                              {profile?.timezone || 'UTC'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Theme Preference</label>
                            <p className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white">
                              {profile?.theme_preference || 'dark'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>               
                    {editMode && (
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveProfile}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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