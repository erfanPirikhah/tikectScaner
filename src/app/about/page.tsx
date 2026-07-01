'use client';

import { Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* هدر صفحه */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6 flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
            <Info className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">درباره ما</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">آشنایی با وب اپلیکیشن تخفیفان</p>
          </div>
        </div>

        {/* محتوای صفحه */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6 md:p-8 text-gray-700 leading-8 space-y-6 text-justify">
            
            <p className="text-base">
              <strong className="text-gray-900">وب اپلیکیشن اختصاصی تخفیفان</strong> یک بستر ویژه برای مدیریت و بررسی محصولات / خدمات و کوپن های خریداران برای کسب و کارها و پذیرندگان است.
            </p>
            
            <div>
              <strong className="text-gray-900 block mb-4 text-base">در این وب اپلیکیشن میتوانید:</strong>
              <ul className="space-y-3 md:space-y-4 pr-2">
                <li className="flex items-start gap-3 text-sm md:text-base">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>بدون محدودیت در هر دیوایس فرآیند چک این را انجام دهید.</span>
                </li>
                <li className="flex items-start gap-3 text-sm md:text-base">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>بی وقفه و در کمترین زمان ممکن کوپن مشتریان را چک کنید.</span>
                </li>
                <li className="flex items-start gap-3 text-sm md:text-base">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>با دسترسی خود به سامانه وارد شوید و چک‌این را آغاز کنید.</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-500 text-sm md:text-base pt-4 border-t border-gray-100">
              درصورت نیاز به بخش های توسعه ای میتوانید با تیم توسعه در ارتباط باشید.
            </p>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}