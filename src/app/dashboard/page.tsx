'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // فرمت ساعت
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      // فرمت تاریخ شمسی (با استفاده از Intl)
      const formatter = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setCurrentDate(formatter.format(now));
    };

    // بلافاصله بعد از لود اجرا شود
    updateDateTime();

    // هر ثانیه آپدیت شود
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] lg:min-h-screen p-6 bg-gray-100 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 md:p-12 max-w-2xl w-full text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          مدیر محترم، خوش آمدید
        </h1>
        
        {user?.name && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {user.name} عزیز، به پنل مدیریت خوش آمدید.
          </p>
        )}

        <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span className="text-xl font-mono tracking-wider">{currentTime}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="text-base">{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}