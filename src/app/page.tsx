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

  // Normal flow without test mode
  useEffect(() => {
    if (!showOnboarding && isLoggedIn) {
      router.push('/events');
    } else if (!showOnboarding && !isLoggedIn) {
      router.push('/login');
    }

    setIsLoading(false);
  }, [showOnboarding, isLoggedIn, router]);

  if (showOnboarding) {
    return <Onboarding />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Show loading or redirect if not logged in
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-secondary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-secondary">در حال بارگذاری...</p>
      </div>
    </div>
  );
}