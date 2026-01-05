'use client';

import api from '@/lib/api-simple';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    console.log('[Callback] Effect triggered:', { code, state, errorParam });

    if (errorParam) {
      console.log('[Callback] Error param found:', errorParam);
      setError(errorParam);
      setIsProcessing(false);
      return;
    }

    if (!code || !state) {
      console.log('[Callback] Missing code or state');
      setError('Missing authorization code or state parameter');
      setIsProcessing(false);
      return;
    }

    // Exchange code for tokens via backend
    const exchangeCode = async () => {
      try {
        console.log('[Callback] Calling /auth/exchange with:', { code, state });
        const response = await api.post('/auth/exchange', { code, state });

        console.log('[Callback] Exchange response:', response);

        if (response.data?.success && response.data?.user) {
          console.log('[Callback] Success, redirecting to dashboard');
          // Cookies are set by backend, redirect to dashboard
          router.push('/dashboard');
        } else {
          console.log('[Callback] Exchange failed:', response.data);
          setError(response.data?.message || 'Authentication failed');
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error('[Callback] Code exchange error:', err);
        const errorMessage =
          err.response?.data?.message || 'Failed to complete authentication';
        setError(errorMessage);
        setIsProcessing(false);
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Completing Sign In
          </h1>
          <p className="text-gray-700">
            Please wait while we complete your authentication...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
