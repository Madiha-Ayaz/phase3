'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthToken, getUserFromToken, logout } from '@/lib/auth';

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      const userData = getUserFromToken();
      setUser(userData);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Test</h1>
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-gray-300 mb-2">User ID: <span className="text-white font-mono">{user?.sub || 'N/A'}</span></p>
            <p className="text-gray-300">Provider: <span className="text-white font-mono">{user?.provider || 'N/A'}</span></p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all mr-3"
          >
            Go to Dashboard
          </button>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}