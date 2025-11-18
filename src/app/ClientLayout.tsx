'use client';

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { PWAProvider } from '@/context/PWAContext';
import AddToHomeScreenPrompt from '@/components/AddToHomeScreenPrompt';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <PWAProvider>
      <div className="flex flex-col min-h-screen">
        {children}
        <Toaster position="top-right" dir="rtl" />
        <AddToHomeScreenPrompt />
      </div>
    </PWAProvider>
  );
}