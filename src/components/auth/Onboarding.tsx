'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { storageService } from '@/services/storage';
import Link from 'next/link';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Progress indicator */}
        <div className="flex justify-center pt-6">
          <div className="flex space-x-2 space-x-reverse">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index === currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">{onboardingSlides[currentStep].icon}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {onboardingSlides[currentStep].title}
          </h1>
          <p className="text-gray-600 mb-8">
            {onboardingSlides[currentStep].description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t flex-row-reverse">
          {currentStep === 0 ? (
            <button
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              رد کردن
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              بازگشت
            </button>
          )}

          <button
            onClick={handleNext}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors"
          >
            {currentStep === onboardingSlides.length - 1 ? 'شروع کنید' : 'بعدی'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;