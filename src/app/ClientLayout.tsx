'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { PWAProvider } from '@/context/PWAContext';
import AddToHomeScreenPrompt from '@/components/AddToHomeScreenPrompt';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { storageService } from '@/services/storage';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { isLoggedIn, login } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // خواندن اطلاعات کاربر از لوکال استوریج به محض لود شدن اپلیکیشن
  useEffect(() => {
    const storedData = storageService.getAll();
    if (storedData.token && storedData.user) {
      // بازیابی استیت لاگین در zustand
      login(
        storedData.user, 
        storedData.token, 
        storedData.websiteUrl || '', 
        storedData.vendors
      );
    }
    setIsHydrated(true); // اعلام آماده بودن اطلاعات
  }, [login]);

  // مسیرهایی که نیازی به لاگین ندارند
  const isAuthPage = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/onboarding');
  const isCameraPage = pathname.startsWith('/scan/camera');
  
  const showDashboard = !isAuthPage && !isCameraPage;

  // منطق ریدایرکت برای صفحات محافظت شده
  useEffect(() => {
    // اگر اطلاعات از استوریج خوانده شده باشد
    if (isHydrated) {
      // اگر کاربر لاگین نباشد و در صفحه عمومی (مثل / یا /login) نباشد
      if (!isLoggedIn && !isAuthPage) {
        router.replace('/login');
      }
    }
  }, [isHydrated, isLoggedIn, isAuthPage, router]);

  // تا زمانی که اطلاعات کاربر از لوکال استوریج خوانده نشده، یک لودینگ نمایش بده تا فلیکر نخورد
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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