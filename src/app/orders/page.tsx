'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      wordpressService.getOrders(storedUrl, username, password)
        .then((data) => {
          // مرتب‌سازی سفارش‌ها از جدیدترین به قدیمی‌ترین
          const sorted = data.sort((a, b) => b.order_id - a.order_id);
          setOrders(sorted);
        })
        .catch((error) => {
          console.error('خطا در دریافت سفارش‌ها:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const formatPrice = (price: string | number) => {
    try {
      return Number(price).toLocaleString('fa-IR') + ' تومان';
    } catch {
      return String(price);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const renderStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      pending: { text: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      completed: { text: 'تکمیل شده', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      cancelled: { text: 'لغو شده', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      processing: { text: 'در حال انجام', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-950 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 mb-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
            <ShoppingBag className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">لیست سفارش‌ها</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مشاهده و مدیریت تمامی سفارش‌های ثبت شده</p>
          </div>
        </div>

        {/* محتوای جدول */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {loading ? (
            // حالت لودینگ (اسکلتون)
            <div className="p-4 md:p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            // حالت خالی بودن
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">هیچ سفارشی یافت نشد</p>
              <p className="text-sm text-gray-400 mt-1">در حال حاضر سفارشی برای نمایش وجود ندارد.</p>
            </div>
          ) : (
            <>
              {/* نمای موبایل (کارت‌های زیر هم) */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map((order) => (
                  <div key={order.order_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-900 dark:text-white">#{order.order_id}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStatus(order.status).color}`}>
                        {renderStatus(order.status).text}
                      </span>
                    </div>
                    
                    {/* نمایش تمامی آیتم‌ها */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 space-y-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      {order.items.map((item: any) => (
                        <div key={item.item_id} className="flex justify-between items-center">
                          <span className="truncate ml-2">{item.name}</span>
                          <span className="text-gray-400 whitespace-nowrap">{item.qty} عدد</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.date)}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای دسکتاپ (جدول) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">شماره سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">محصولات</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">مبلغ کل</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">وضعیت</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {orders.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                          #{order.order_id}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 max-w-md">
                          <div className="flex flex-col gap-1">
                            {order.items.map((item: any) => (
                              <span key={item.item_id} className="block">
                                • {item.name} <span className="text-gray-400">({item.qty} عدد)</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStatus(order.status).color}`}>
                            {renderStatus(order.status).text}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(order.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}