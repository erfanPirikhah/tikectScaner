'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { storageService } from '@/services/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/Logo';

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <div className="text-2xl font-bold mb-1">iticket</div>
          <CardDescription>{onboardingSlides[currentStep].title}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center text-center pb-2">
          <div className="text-5xl mb-4">{onboardingSlides[currentStep].icon}</div>
          <p className="text-muted-foreground">
            {onboardingSlides[currentStep].description}
          </p>

          {/* Progress indicator */}
          <div className="flex justify-center mt-6 mb-4">
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
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleNext}
            className="w-full"
          >
            {currentStep === onboardingSlides.length - 1 ? 'شروع کنید' : 'بعدی'}
          </Button>

          {currentStep !== 0 && (
            <Button
              variant="link"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-primary hover:text-primary p-0 h-auto w-full"
            >
              بازگشت
            </Button>
          )}

          {currentStep === 0 && (
            <Button
              variant="link"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground p-0 h-auto w-full"
            >
              رد کردن
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;