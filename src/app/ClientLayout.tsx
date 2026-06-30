'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { PWAProvider } from '@/context/PWAContext';
import AddToHomeScreenPrompt from '@/components/AddToHomeScreenPrompt';
import DashboardLayout from '@/components/DashboardLayout';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // صفحاتی که سایدبار نباید داشته باشند
  const isAuthPage = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/onboarding');
  
  // فقط صفحه دوربین فول اسکرین باشد، نه صفحه /scan اصلی
  const isCameraPage = pathname.startsWith('/scan/camera');
  
  const showDashboard = !isAuthPage && !isCameraPage;

  return (
    <PWAProvider>
      <div className="flex flex-col min-h-screen">
        {showDashboard ? (
          <DashboardLayout>{children}</DashboardLayout>
        ) : (
          children
        )}
        <Toaster position="top-right" dir="rtl" />
        <AddToHomeScreenPrompt />
      </div>
    </PWAProvider>
  );
}