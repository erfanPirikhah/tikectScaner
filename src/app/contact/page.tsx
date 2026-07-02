'use client';

import { PhoneCall } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* هدر صفحه */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6 flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 rounded-xl bg-green-50 text-green-600 flex-shrink-0">
            <PhoneCall className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">تماس با ما</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">راه‌های ارتباطی با تیم توسعه</p>
          </div>
        </div>

        {/* محتوای صفحه */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6 md:p-8 text-gray-700 leading-8 space-y-6 text-justify">
            
            <p className="text-base">
              <strong className="text-gray-900"></strong> تیم توسعه تخفیفان یک مجموعه، کوچک اما خلاق و نوآور است که همیشه تلاش خود را بر این موضوع متمرکز کرده که با تکنولوژی های روز بهترین راهکارها را برای کسب و کارها تولید و توسعه دهد.
            </p>

            <p className="text-base">
              <strong className="text-gray-900">جهت ارتباط با ما ، از طریق منابع مستقیم دسترسی در بستر سایت اقدام نمایید.</strong>
            </p>

            <div className="text-center pt-6 mt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm md:text-base inline-block">
                &nbsp;باتشکر از شما
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}