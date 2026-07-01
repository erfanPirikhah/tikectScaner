'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // ایمپورت اسکلتون
import {
    DollarSign, ShoppingBag, Ticket, Users, Package, ScanLine, Loader2
} from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [stats, setStats] = useState({
    total_orders_amount: 0,
    total_orders_count: 0,
    total_vouchers_count: 0,
    total_unique_customers: 0,
    total_products_services: 0
  });
  const [loadingStats, setLoadingStats] = useState(true); // استیت لودینگ آمار

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      const formatter = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      setCurrentDate(formatter.format(now));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();
    
    if (storedUrl && username && password) {
      Promise.all([
        wordpressService.getStats(username, password),
        wordpressService.getOrders(storedUrl, username, password)
      ])
        .then(([statsData, ordersData]) => {
          if (statsData) setStats(statsData);
          if (ordersData) {
            const sortedOrders = ordersData.sort((a, b) => b.order_id - a.order_id).slice(0, 10);
            setOrders(sortedOrders);
          }
        })
        .catch(error => {
          console.error('خطا در دریافت اطلاعات:', error);
        })
        .finally(() => {
          setLoadingStats(false);
          setLoadingOrders(false);
        });
    } else {
      setLoadingStats(false);
      setLoadingOrders(false);
    }
  }, []);

  const formatPrice = (price: number | string) => {
    try {
      return Number(price).toLocaleString('fa-IR') + ' تومان';
    } catch {
      return String(price);
    }
  };

  const formatNumber = (num: number | string) => {
    try {
      return Number(num).toLocaleString('fa-IR');
    } catch {
      return String(num);
    }
  };

  const statsBoxes = [
    { title: 'مجموع سفارشات', value: formatPrice(stats.total_orders_amount), count: 'مجموع ارزش', icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
    { title: 'تعداد کل سفارشات', value: formatNumber(stats.total_orders_count), count: 'سفارش ثبت شده', icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
    { title: 'کوپن های خریداری شده', value: formatNumber(stats.total_vouchers_count), count: 'کوپن فروخته شده', icon: Ticket, color: 'text-green-600 bg-green-50' },
    { title: 'مجموع خریداران', value: formatNumber(stats.total_unique_customers), count: 'مشتری فعال', icon: Users, color: 'text-orange-600 bg-orange-50' },
    { title: 'محصولات و خدمات', value: formatNumber(stats.total_products_services), count: 'آیتم موجود', icon: Package, color: 'text-pink-600 bg-pink-50' },
  ];

  const renderStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      pending: { text: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800' },
      completed: { text: 'تکمیل شده', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'لغو شده', color: 'bg-red-100 text-red-800' },
      processing: { text: 'در حال انجام', color: 'bg-blue-100 text-blue-800' },
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
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

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* بخش خوش آمدید و ساعت */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-8 mb-6 md:mb-8 text-center">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            مدیر محترم، خوش آمدید
          </h1>
          {user?.name && (
            <p className="text-base md:text-lg text-gray-600 mb-5 md:mb-6">
              {user.name} عزیز، به پنل مدیریت خوش آمدید.
            </p>
          )}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mt-5 md:mt-6 pt-5 md:pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-lg md:text-xl font-mono tracking-wider">{currentTime}</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500/80">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="text-sm md:text-base">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* باکس‌های آماری همراه با لودینگ */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          {loadingStats ? (
            // نمایش اسکلتون در حالت لودینگ
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : (
            statsBoxes.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className={`p-2 md:p-2.5 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm text-gray-500">{stat.title}</p>
                    <p className="text-sm md:text-base font-bold text-gray-900 truncate">{stat.value}</p>
                    <p className="text-[10px] md:text-xs text-gray-400 mt-1">{stat.count}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* دکمه بررسی سریع کوپن‌ها */}
        <div className="mt-6 md:mt-8 mb-8 md:mb-10">
          <button
            onClick={() => router.push('/scan')}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-l from-blue-600 to-sky-400 p-1 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3 px-4 md:px-6 py-4 md:py-5 rounded-[10px]">
              <div className="flex items-center gap-2 md:gap-3 animate-pulse group-hover:animate-none">
                <ScanLine className="w-6 h-6 md:w-7 md:h-7 text-white" />
                <span className="text-lg md:text-xl font-bold text-white">بررسی سریع کوپن‌ها</span>
              </div>
              <svg className="absolute left-4 md:left-8 w-5 h-5 md:w-6 md:h-6 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </div>
          </button>
        </div>

        {/* جدول آخرین سفارش‌ها */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">آخرین سفارش‌ها</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">۱۰ سفارش اخیر ثبت شده در سیستم</p>
          </div>
          
          {loadingOrders ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">هیچ سفارشی یافت نشد</div>
          ) : (
            <>
              {/* نمای موبایل (کارت‌های زیر هم) */}
              <div className="md:hidden divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.order_id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-900">#{order.order_id}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStatus(order.status).color}`}>
                        {renderStatus(order.status).text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3 space-y-1">
                      {order.items.slice(0, 2).map((item: any) => (
                        <div key={item.item_id} className="truncate">
                          {item.name} <span className="text-gray-400">({item.qty} عدد)</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-xs text-blue-500">+{order.items.length - 2} مورد دیگر</div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{formatDate(order.date)}</span>
                      <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای دسکتاپ (جدول) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">شماره سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">محصولات</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">مبلغ کل</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">وضعیت</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          #{order.order_id}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            {order.items.slice(0, 2).map((item: any) => (
                              <span key={item.item_id} className="block">
                                {item.name} <span className="text-gray-400">({item.qty} عدد)</span>
                              </span>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-xs text-blue-500">+{order.items.length - 2} مورد دیگر</span>
                            )}
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