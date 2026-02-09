// app/auth/callback/page.tsx
// یہ فائل 'use client' کے بغیر رہے گی (Server Component)

import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient';
import { FaSpinner } from 'react-icons/fa';

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center">
            <FaSpinner className="animate-spin mx-auto text-4xl text-white mb-4" />
            <p className="text-xl text-white">Completing authentication...</p>
          </div>
        }
      >
        <AuthCallbackClient />
      </Suspense>
    </div>
  );
}