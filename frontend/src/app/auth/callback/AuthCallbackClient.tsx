// app/auth/callback/AuthCallbackClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // useSearchParams اب Suspense کی وجہ سے safe ہے
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`Authentication failed: ${decodeURIComponent(errorParam)}`);
          return;
        }

        if (!token) {
          setError('No token received from authentication provider');
          return;
        }

        console.log('Received token:', token?.substring(0, 20) + '...');
        console.log('Received provider:', provider);

        // Store token & provider
        localStorage.setItem('token', token);
        if (provider) {
          localStorage.setItem('authProvider', provider);
          console.log('Provider stored:', provider);
        }

        // Update auth context
        login(token);

        // چھوٹا delay (for state updates)
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('Authentication successful, redirecting to dashboard...');
        router.push('/dashboard');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [searchParams, router, login]);

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">✗</div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null; // loading state Suspense fallback سے handle ہو رہا ہے
}