'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { storageService } from '@/services/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Scan, QrCode, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // 0: next, 1: previous
  const setShowOnboarding = useUIStore(state => state.setShowOnboarding);

  const onboardingSlides = [
    {
      title: "اپراتور گرامی، خوش آمدید.",
      description: "بدون محدودیت در هر دیوایس فرآیند چک این را انجام دهید.",
      icon: <QrCode className="w-16 h-16" />,
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-50 to-purple-50"
    },
    {
      title: "عملکرد سریع و هوشمند",
      description: "بی وقفه و در کمترین زمان ممکن بلیت ها بررسی کنید.",
      icon: <Scan className="w-16 h-16" />,
      gradient: "from-green-500 to-teal-600",
      bgGradient: "from-green-50 to-teal-50"
    },
    {
      title: "یک قدم فاصله دارید",
      description: "با دسترسی خود به سامانه وارد شوید و چک‌این را آغاز کنید.",
      icon: <CheckCircle2 className="w-16 h-16" />,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50"
    },
  ];

  const handleNext = () => {
    setDirection(0);
    if (currentStep < onboardingSlides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    setDirection(1);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    storageService.setShowOnboarding(false);
    setShowOnboarding(false);
  };

  const handleSkip = () => {
    storageService.setShowOnboarding(false);
    setShowOnboarding(false);
  };

  const progress = (currentStep / (onboardingSlides.length - 1)) * 100;

  return (
    <div className={cn(
      "fixed inset-0 bg-background z-50 flex items-center justify-center p-4 transition-colors duration-300",
      `bg-gradient-to-br ${onboardingSlides[currentStep].bgGradient}`
    )}>
      {/* Mobile Full Screen Card */}
      <div className="sm:hidden w-full h-full">
        <Card className="w-full h-full rounded-none border-none shadow-2xl flex flex-col">
          <CardHeader className="flex-shrink-0 pt-12 pb-8 px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Logo size="lg" showText={false} />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  نرم افزار اختصاصی CheckIn بلیت
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                رد کردن
              </Button>
            </div>

            {/* Progress Bar */}
            <Progress value={progress} className="h-2 bg-muted" />
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-8">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
              {/* Animated Icon Container */}
              <div className={cn(
                "p-6 rounded-2xl mb-8 transform transition-all duration-500",
                `bg-gradient-to-br ${onboardingSlides[currentStep].gradient} shadow-lg`,
                direction === 0 ? "animate-in slide-in-from-right-10" : "animate-in slide-in-from-left-10"
              )}>
                <div className="text-white">
                  {onboardingSlides[currentStep].icon}
                </div>
              </div>

              {/* Content with Animation */}
              <div className={cn(
                "space-y-4 transform transition-all duration-500",
                direction === 0 ? "animate-in slide-in-from-right-10" : "animate-in slide-in-from-left-10"
              )}>
                <CardTitle className="text-2xl lg:text-3xl font-bold leading-tight">
                  {onboardingSlides[currentStep].title}
                </CardTitle>
                <CardDescription className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                  {onboardingSlides[currentStep].description}
                </CardDescription>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-shrink-0 pb-8 px-6">
            <div className="w-full space-y-4">
              <Button
                onClick={handleNext}
                className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                {currentStep === onboardingSlides.length - 1 ? (
                  <span className="flex items-center gap-2">
                    شروع کنید
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    ادامه
                    <ChevronLeft className="w-5 h-5" />
                  </span>
                )}
              </Button>

              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="w-full h-11 text-base border-2 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5" />
                    بازگشت
                  </span>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Desktop Card */}
      <Card className="hidden sm:flex w-full max-w-2xl mx-auto shadow-2xl border-0 overflow-hidden">
        <div className={cn(
          "flex-1 p-8 transition-all duration-500",
          `bg-gradient-to-br ${onboardingSlides[currentStep].bgGradient}`
        )}>
          <CardHeader className="px-0 pt-4 pb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Logo size="lg" showText={false} />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  نرم افزار اختصاصی CheckIn بلیت
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                رد کردن
              </Button>
            </div>

            <Progress value={progress} className="h-2 bg-white/50" />
          </CardHeader>

          <CardContent className="px-0 pb-8">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Animated Icon */}
              <div className={cn(
                "p-8 rounded-2xl transform transition-all duration-500",
                `bg-gradient-to-br ${onboardingSlides[currentStep].gradient} shadow-xl`,
                direction === 0 ? "animate-in slide-in-from-right-10" : "animate-in slide-in-from-left-10"
              )}>
                <div className="text-white">
                  {onboardingSlides[currentStep].icon}
                </div>
              </div>

              {/* Content */}
              <div className={cn(
                "space-y-4 max-w-md transform transition-all duration-500",
                direction === 0 ? "animate-in slide-in-from-right-10" : "animate-in slide-in-from-left-10"
              )}>
                <CardTitle className="text-3xl font-bold leading-tight">
                  {onboardingSlides[currentStep].title}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  {onboardingSlides[currentStep].description}
                </CardDescription>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-0 pb-4">
            <div className="w-full flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 h-12 text-base border-2 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5" />
                    بازگشت
                  </span>
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className={cn(
                  "h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                  currentStep > 0 ? "flex-1" : "w-full"
                )}
              >
                {currentStep === onboardingSlides.length - 1 ? (
                  <span className="flex items-center gap-2">
                    شروع کنید
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    ادامه
                    <ChevronLeft className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;