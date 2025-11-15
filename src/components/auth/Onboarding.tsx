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
      title: "Welcome to Ticket Scanner",
      description: "The easiest way to validate tickets using QR codes.",
      icon: "🎫",
    },
    {
      title: "Simple Process",
      description: "Just scan the QR code on the ticket to validate it instantly.",
      icon: "🔍",
    },
    {
      title: "Get Started",
      description: "Log in with your credentials and start scanning tickets.",
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
          <div className="flex space-x-2">
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
        <div className="flex justify-between items-center p-6 border-t">
          {currentStep === 0 ? (
            <button
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors"
          >
            {currentStep === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;