'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      wordpressService.getProducts(storedUrl, username, password)
        .then((data) => {
          setProducts(data);
        })
        .catch((error) => {
          console.error('خطا در دریافت محصولات:', error);
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

  const renderStockStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      instock: { text: 'موجود', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      outofstock: { text: 'ناموجود', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      onbackorder: { text: 'پیش‌سفارش', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-950 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6 mb-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
            <Package className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">محصولات و خدمات</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مدیریت موجودی و قیمت محصولات</p>
          </div>
        </div>

        {/* محتوای جدول */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {loading ? (
            // حالت لودینگ
            <div className="p-4 md:p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            // حالت خالی بودن
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">هیچ محصولی یافت نشد</p>
              <p className="text-sm text-gray-400 mt-1">محصولی برای نمایش وجود ندارد.</p>
            </div>
          ) : (
            <>
              {/* نمای موبایل (کارت‌های زیر هم) */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
                {products.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{product.name}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStockStatus(product.stock_status).color}`}>
                        {renderStockStatus(product.stock_status).text}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">شناسه: {product.id}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">موجودی: {product.stock_quantity !== null ? Number(product.stock_quantity).toLocaleString('fa-IR') : 'نامحدود'}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                      {product.regular_price !== product.sale_price && Number(product.regular_price) > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400 line-through">{formatPrice(product.regular_price)}</span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatPrice(product.sale_price)}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {Number(product.price) > 0 ? formatPrice(product.price) : 'رایگان'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای دسکتاپ (جدول) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">شناسه</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">نام محصول</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">قیمت اصلی</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">قیمت با تخفیف</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">موجودی</th>
                      <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                          #{product.id}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white max-w-xs">
                          {product.name}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {Number(product.regular_price) > 0 ? (
                            <span className={product.regular_price !== product.sale_price ? 'line-through' : ''}>
                              {formatPrice(product.regular_price)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold whitespace-nowrap">
                          {Number(product.sale_price) > 0 ? (
                            <span className={product.regular_price !== product.sale_price ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}>
                              {formatPrice(product.sale_price)}
                            </span>
                          ) : <span className="text-green-600 dark:text-green-400">رایگان</span>}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {product.stock_quantity !== null ? Number(product.stock_quantity).toLocaleString('fa-IR') : 'نامحدود'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStockStatus(product.stock_status).color}`}>
                            {renderStockStatus(product.stock_status).text}
                          </span>
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