'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { PWAProvider } from '@/context/PWAContext';
import AddToHomeScreenPrompt from '@/components/AddToHomeScreenPrompt';
import HeaderNav from '@/components/HeaderNav';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Don't show header nav on intro/onboarding or login pages
  const showHeaderNav = !(pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/onboarding'));

  return (
    <PWAProvider>
      <div className="flex flex-col min-h-screen">
        {showHeaderNav && <HeaderNav />}
        {children}
        <Toaster position="top-right" dir="rtl" />
        <AddToHomeScreenPrompt />
      </div>
    </PWAProvider>
  );
}