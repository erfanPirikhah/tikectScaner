'use client';

import { useEffect, useState } from 'react';
import { useUIStore, useAuthStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import Onboarding from '@/components/auth/Onboarding';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { showOnboarding, setShowOnboarding } = useUIStore();
  const { isLoggedIn, login } = useAuth();
  const authStore = useAuthStore(); // Direct access to auth store
  const [isLoading, setIsLoading] = useState(true);

  // Check for test mode on initial load
  useEffect(() => {
    // Check if we should enter test mode directly
    const params = new URLSearchParams(window.location.search);
    const testMode = params.get('testMode');

    if (testMode === 'true') {
      // Force login with test user
      const testUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      };
      const testToken = 'test_mode_token';
      const testWebsiteUrl = 'http://test.local';

      // Directly set the auth state
      authStore.login(testUser, testToken, testWebsiteUrl);

      // Skip onboarding
      setShowOnboarding(false);

      // Redirect to events page
      router.push('/events');
      return;
    }

    // Normal flow
    if (!showOnboarding && isLoggedIn) {
      router.push('/events');
    } else if (!showOnboarding && !isLoggedIn) {
      router.push('/login');
    }

    setIsLoading(false);
  }, [showOnboarding, isLoggedIn, router, authStore, setShowOnboarding]);

  if (showOnboarding) {
    return <Onboarding />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show a test mode button if not logged in
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Ticket Scanner PWA</h1>
        <p className="text-gray-600 mb-6">Access the app directly in test mode</p>

        <button
          onClick={() => {
            // Set test mode params and reload
            window.location.search = '?testMode=true';
          }}
          className="py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Enter Test Mode
        </button>
      </div>
    </div>
  );
}