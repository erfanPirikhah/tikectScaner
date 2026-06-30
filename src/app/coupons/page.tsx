'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { Ticket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CouponsPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      wordpressService.getVouchers(storedUrl, username, password)
        .then((data) => {
          setVouchers(data);
        })
        .catch((error) => {
          console.error('خطا در دریافت کوپن‌ها:', error);
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
    if (!dateStr) return '—';
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

  const renderVoucherStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      active: { text: 'فعال', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      redeemed: { text: 'استفاده شده', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400' },
      expired: { text: 'منقضی شده', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const renderOrderStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      'wc-completed': { text: 'تکمیل شده', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      'wc-pending': { text: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      'wc-processing': { text: 'در حال انجام', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      'wc-cancelled': { text: 'لغو شده', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    };
    const cleanStatus = status.replace('wc-', '');
    return statusMap[status] || { text: cleanStatus, color: 'bg-gray-100 text-gray-800' };
  };

  // تفکیک کدهای کوپن اگر بیشتر از یکی بود (با کاما جدا شده‌اند)
  const renderVoucherCodes = (codes: string) => {
    const codeArray = codes.split(',').map(c => c.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1">
        {codeArray.map((code, idx) => (
          <span key={idx} className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-mono">
            {code}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-950 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 mb-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
            <Ticket className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">کوپن‌های خریداری شده</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">لیست تمامی ووچرها و کوپن‌های صادر شده</p>
          </div>
        </div>

        {/* محتوای جدول */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {loading ? (
            <div className="p-4 md:p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">هیچ کوپنی یافت نشد</p>
              <p className="text-sm text-gray-400 mt-1">کوپنی برای نمایش وجود ندارد.</p>
            </div>
          ) : (
            <>
              {/* نمای موبایل (کارت‌های زیر هم) */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
                {vouchers.map((voucher) => (
                  <div key={`${voucher.order_id}-${voucher.order_item_id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-900 dark:text-white text-sm flex-1 ml-2">{voucher.product_name}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderVoucherStatus(voucher.status).color}`}>
                        {renderVoucherStatus(voucher.status).text}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">کد کوپن:</span>
                      {renderVoucherCodes(voucher.voucher_code)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div>سفارش: <span className="font-medium text-gray-700 dark:text-gray-300">#{voucher.order_id}</span></div>
                      <div>تعداد: <span className="font-medium text-gray-700 dark:text-gray-300">{Number(voucher.qty).toLocaleString('fa-IR')}</span></div>
                      <div>وضعیت سفارش: <span className="font-medium text-gray-700 dark:text-gray-300">{renderOrderStatus(voucher.order_status).text}</span></div>
                      <div>قیمت: <span className="font-medium text-gray-700 dark:text-gray-300">{formatPrice(voucher.voucher_price)}</span></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400">تاریخ استفاده: {formatDate(voucher.redeemed_at)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(voucher.order_date)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای دسکتاپ (جدول) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">کد کوپن</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">محصول</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">قیمت</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">وضعیت کوپن</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">وضعیت سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">تاریخ استفاده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {vouchers.map((voucher) => (
                      <tr key={`${voucher.order_id}-${voucher.order_item_id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors align-top">
                        <td className="py-4 px-6 text-sm">
                          {renderVoucherCodes(voucher.voucher_code)}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white max-w-[200px]">
                          {voucher.product_name}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          #{voucher.order_id}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {formatPrice(voucher.voucher_price)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderVoucherStatus(voucher.status).color}`}>
                            {renderVoucherStatus(voucher.status).text}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderOrderStatus(voucher.order_status).color}`}>
                            {renderOrderStatus(voucher.order_status).text}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(voucher.redeemed_at)}
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