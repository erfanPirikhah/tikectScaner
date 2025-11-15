'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';

export default function ScanResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('msg') || '';
  const name = searchParams.get('name') || '';
  const seat = searchParams.get('seat') || '';
  const time = searchParams.get('time') || '';
  
  const { isLoggedIn } = useAuthStore();
  const [countdown, setCountdown] = useState(5); // 5 second countdown

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    if (status !== 'SUCCESS' && status !== 'FAIL') {
      router.push('/events');
      return;
    }

    // Start countdown to return to scanner
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/scan?eventId=' + new URLSearchParams(window.location.search).get('eventId'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, isLoggedIn, router]);

  const handleGoBack = () => {
    router.push('/events');
  };

  const handleScanAnother = () => {
    router.push('/scan?eventId=' + new URLSearchParams(window.location.search).get('eventId'));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        title="نتیجه اسکن"
        showBackButton={true}
        backButtonAction={handleGoBack}
      />

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-center">
          {/* Status icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <span className={`text-4xl ${status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
              {status === 'SUCCESS' ? '✓' : '✕'}
            </span>
          </div>

          {/* Status text */}
          <h2 className={`text-2xl font-bold mb-2 ${
            status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
          }`}>
            {status === 'SUCCESS' ? 'بلیت معتبر' : 'بلیت نامعتبر'}
          </h2>

          <p className="text-gray-700 mb-6">{message}</p>

          {/* Ticket details */}
          {(name || seat || time) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
              {name && (
                <div className="mb-2">
                  <span className="font-medium text-gray-600">نام:</span>
                  <span className="mr-2 text-gray-800">{name}</span>
                </div>
              )}
              {seat && (
                <div className="mb-2">
                  <span className="font-medium text-gray-600">صندلی:</span>
                  <span className="mr-2 text-gray-800">{seat}</span>
                </div>
              )}
              {time && (
                <div className="mb-2">
                  <span className="font-medium text-gray-600">زمان چک‌این:</span>
                  <span className="mr-2 text-gray-800">{new Date(time).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Countdown and actions */}
          <div className="mb-6">
            <p className="text-gray-600">اسکن بلیت بعدی در {countdown} ثانیه...</p>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleScanAnother}
              className="py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              اسکن بلیت دیگر
            </button>
            <button
              onClick={handleGoBack}
              className="py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              بازگشت به رویدادها
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}