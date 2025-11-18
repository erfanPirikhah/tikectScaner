'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

declare global {
  interface Window {
    deferredPrompt: Event;
  }
}

export default function AddToHomeScreenPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Check if the app is already installed
  const isAppInstalled = () => {
    // Check for standalone mode (iOS)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    // For Android, check if the navigator.standalone property exists and is true
    if ('standalone' in navigator && (navigator as any).standalone === true) {
      return true;
    }
    // Check if the app is running in PWA mode
    return window.matchMedia('(display-mode: standalone)').matches;
  };

  // Check if the user has dismissed the prompt before and if app is installed
  useEffect(() => {
    const dismissed = localStorage.getItem('add-to-home-dismissed');
    if (dismissed) {
      setHasDismissed(true);
    } else if (isAppInstalled()) {
      setHasDismissed(true);
    }
  }, []);

  // Set up the beforeinstallprompt event listener
  useEffect(() => {
    // Check if the beforeinstallprompt event is supported
    const isSupported = 'beforeinstallprompt' in window;

    if (!isSupported) {
      // For browsers that don't support the install prompt, we could show instructions
      // Or just return without enabling the functionality
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the prompt if user hasn't dismissed it before
      if (!hasDismissed) {
        // Show the prompt after a delay to not interfere with initial load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000); // 3 second delay
        return () => clearTimeout(timer);
      }
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [hasDismissed]);

  // Also handle the appinstalled event to detect when the app is installed
  useEffect(() => {
    const handleAppInstalled = () => {
      // App was installed, hide the prompt
      setIsVisible(false);
      localStorage.setItem('add-to-home-dismissed', 'true');
      setHasDismissed(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // Optionally track the result
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Reset the deferred prompt
      setDeferredPrompt(null);
    }

    // Hide the prompt and mark as dismissed
    setIsVisible(false);
    localStorage.setItem('add-to-home-dismissed', 'true');
    setHasDismissed(true);
  }, [deferredPrompt]);

  // Handle dismiss button click
  const handleDismissClick = () => {
    setIsVisible(false);
    localStorage.setItem('add-to-home-dismissed', 'true');
    setHasDismissed(true);
  };

  // If the prompt has been dismissed or is not visible, don't render anything
  if (!isVisible || hasDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <Card className="w-full max-w-md z-10 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">نصب برنامه</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismissClick}
            className="h-8 w-8 p-0 rounded-full"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary">i</span>
          </div>
          <p className="text-foreground">
            برای تجربه بهتر، این برنامه را به صفحه اصلی اضافه کنید.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleInstallClick}
            className="w-full"
          >
            افزودن به صفحه اصلی
          </Button>
          <Button
            variant="outline"
            onClick={handleDismissClick}
            className="w-full"
          >
            بعداً
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}