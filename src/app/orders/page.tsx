'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      wordpressService.getOrders(storedUrl, username, password)
        .then((data) => {
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
      pending: { text: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800' },
      completed: { text: 'تکمیل شده', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'لغو شده', color: 'bg-red-100 text-red-800' },
      processing: { text: 'در حال انجام', color: 'bg-blue-100 text-blue-800' },
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* هدر صفحه */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
            <ShoppingBag className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">لیست سفارش‌ها</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">مشاهده و مدیریت تمامی سفارش‌های ثبت شده</p>
          </div>
        </div>

        {/* محتوای جدول */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          
          {loading ? (
            <div className="p-4 md:p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500">هیچ سفارشی یافت نشد</p>
              <p className="text-sm text-gray-400 mt-1">در حال حاضر سفارشی برای نمایش وجود ندارد.</p>
            </div>
          ) : (
            <>
              {/* نمای موبایل و تبلت (کارت‌های زیر هم) */}
              <div className="lg:hidden divide-y divide-gray-200 w-full">
                {orders.map((order) => (
                  <div key={order.order_id} className="p-4 hover:bg-gray-50 transition-colors w-full overflow-hidden">
                    {/* هدر کارت */}
                    <div className="flex justify-between items-center mb-3 gap-2 w-full">
                      <span className="font-bold text-gray-900 text-base flex-shrink-0">
                        #{order.order_id}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${renderStatus(order.status).color}`}>
                        {renderStatus(order.status).text}
                      </span>
                    </div>
                    
                    {/* لیست محصولات */}
                    <div className="text-sm text-gray-600 mb-4 space-y-2 bg-gray-50 p-3 rounded-lg w-full overflow-hidden">
                      {order.items.map((item: any) => (
                        <div key={item.item_id} className="flex justify-between items-start gap-2 w-full min-w-0">
                          <span className="flex-1 min-w-0 break-words leading-relaxed">{item.name}</span>
                          <span className="text-gray-400 text-xs flex-shrink-0 mt-1">{item.qty} عدد</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* فوتر کارت */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 w-full">
                      <span className="text-xs text-gray-500 break-words">
                        {formatDate(order.date)}
                      </span>
                      <span className="text-sm font-bold text-gray-900 break-words">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای دسکتاپ (جدول) */}
              <div className="hidden lg:block overflow-hidden w-full">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">شماره سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">محصولات</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">مبلغ کل</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">وضعیت</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                          #{order.order_id}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 max-w-xs md:max-w-md">
                          <div className="flex flex-col gap-1">
                            {order.items.map((item: any) => (
                              <span key={item.item_id} className="block break-words">
                                • {item.name} <span className="text-gray-400">({item.qty} عدد)</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-gray-900 whitespace-nowrap">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStatus(order.status).color}`}>
                            {renderStatus(order.status).text}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
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