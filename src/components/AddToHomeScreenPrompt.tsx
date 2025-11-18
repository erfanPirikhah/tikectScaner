'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { X } from 'lucide-react';

declare global {
  interface Window {
    deferredPrompt: Event | null;
  }
}

export default function AddToHomeScreenPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if the app is already installed
  const isAppInstalled = () => {
    // Check for standalone mode (PWA installed)
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true;
    }
    return false;
  };

  // Check if the app is installable (using beforeinstallprompt event or manual detection)
  const isAppInstallable = (): boolean => {
    // Check if we're in a browser context
    if (typeof window === 'undefined' || !isClient) {
      return false;
    }

    // Check if the app is already installed
    if (isAppInstalled()) {
      return false;
    }

    // Check if we're in a browser that supports install prompts
    // For browsers that don't support beforeinstallprompt, we offer the manual installation hint
    return true;
  };

  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);

    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also handle the appinstalled event
    const handleAppInstalled = () => {
      // App was installed, hide any prompts
      setIsVisible(false);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('add-to-home-dismissed', 'true');
      }
      setHasDismissed(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if the user has dismissed the prompt before and if app is installed
    if (typeof localStorage !== 'undefined') {
      const dismissed = localStorage.getItem('add-to-home-dismissed');
      if (dismissed === 'true') {
        setHasDismissed(true);
      } else if (isAppInstalled()) {
        setHasDismissed(true);
        localStorage.setItem('add-to-home-dismissed', 'true');
      } else {
        // Show the prompt after a delay if the user hasn't dismissed it
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000); // 3 second delay

        return () => clearTimeout(timer);
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // If we have the deferred prompt (browser supports it), use it
    if (deferredPrompt) {
      const promptEvent = deferredPrompt as any;

      // Show the install prompt
      promptEvent.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await promptEvent.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Reset the deferred prompt
      setDeferredPrompt(null);
    } else {
      // Manual installation instructions for browsers that don't support install prompts
      if (typeof alert !== 'undefined') {
        alert('برای نصب برنامه:\n\n1. در گوشه بالا سمت راست صفحه (یا در نوار آدرس) روی دکمه منو کلیک کنید\n2. گزینه "افزودن به صفحه اصلی" یا "Install" را انتخاب کنید\n\n(روی دستگاه موبایل باید این گزینه نمایان شود)');
      }
    }

    // Hide the prompt and mark as dismissed
    setIsVisible(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('add-to-home-dismissed', 'true');
    }
    setHasDismissed(true);
  }, [deferredPrompt]);

  // Handle dismiss button click
  const handleDismissClick = () => {
    if (typeof window === 'undefined') return;

    setIsVisible(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('add-to-home-dismissed', 'true');
    }
    setHasDismissed(true);
  };

  // Don't render anything on the server
  if (!isClient) {
    return null;
  }

  // If the prompt has been dismissed or is not visible, don't render anything
  if (!isVisible || hasDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleDismissClick} />
      <Card className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
        <CardContent className="text-center pb-2">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary">i</span>
          </div>
          <p className="text-foreground mb-2">
            برای تجربه بهتر، لطفاً گزینه Add to Home Screen را بزنید.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
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