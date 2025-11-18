'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { storageService } from '@/services/storage';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const setShowOnboarding = useUIStore(state => state.setShowOnboarding);

  const onboardingSlides = [
    {
      title: "به اسکنر بلیت خوش آمدید",
      description: "آسان‌ترین راه برای اعتبارسنجی بلیت‌ها با استفاده از کدهای QR.",
      icon: "🎫",
    },
    {
      title: "فرآیند ساده",
      description: "فقط کد QR روی بلیت را اسکن کنید تا فوراً معتبرسنجی شود.",
      icon: "🔍",
    },
    {
      title: "شروع کنید",
      description: "با اطلاعات کاربری خود وارد شوید و اسکن بلیت‌ها را آغاز کنید.",
      icon: "✅",
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSlides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish onboarding
      storageService.setShowOnboarding(false);
      setShowOnboarding(false);
    }
  };

  const handleSkip = () => {
    storageService.setShowOnboarding(false);
    setShowOnboarding(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md overflow-hidden">
        {/* Progress indicator */}
        <div className="flex justify-center pt-6">
          <div className="flex space-x-2 space-x-reverse">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index === currentStep ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-6">{onboardingSlides[currentStep].icon}</div>
          <h1 className="text-2xl font-bold mb-3">
            {onboardingSlides[currentStep].title}
          </h1>
          <p className="text-muted-foreground mb-8">
            {onboardingSlides[currentStep].description}
          </p>
        </CardContent>

        {/* Navigation */}
        <div className="p-6 border-t flex justify-between">
          {currentStep === 0 ? (
            <Button
              variant="link"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground p-0 h-auto"
            >
              رد کردن
            </Button>
          ) : (
            <Button
              variant="link"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-primary hover:text-primary p-0 h-auto"
            >
              بازگشت
            </Button>
          )}

          <Button
            onClick={handleNext}
          >
            {currentStep === onboardingSlides.length - 1 ? 'شروع کنید' : 'بعدی'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;