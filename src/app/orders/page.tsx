'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { ShoppingBag, Eye, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { showToast } from '@/lib/toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // استیت‌های صفحه‌بندی
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [maxPageReached, setMaxPageReached] = useState<number | null>(null);

  // استیت‌های مودال جزئیات
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      setLoading(true);
      wordpressService.getOrders(storedUrl, username, password, {
        page: page.toString(),
        per_page: perPage.toString(),
      })
        .then((data) => {
          // اگر API آرایه خالی برگرداند یعنی به آخر صفحه رسیده‌ایم
          if (data.length === 0 && page > 1) {
            setMaxPageReached(page - 1); // ثبت صفحه فعلی به عنوان آخرین صفحه مجاز
            setPage(page - 1); // بازگشت به صفحه قبلی
          } else {
            setOrders(data);
            // اگر تعداد آیتم‌های دریافت شده کمتر از per_page باشد، قطعا صفحه آخر است
            if (data.length < perPage) {
              setMaxPageReached(page);
              setHasMore(false);
            } else {
              setHasMore(true);
            }
          }
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
  }, [page, perPage]);

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

  const renderStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      pending: { text: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800' },
      completed: { text: 'تکمیل شده', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'لغو شده', color: 'bg-red-100 text-red-800' },
      processing: { text: 'در حال انجام', color: 'bg-blue-100 text-blue-800' },
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const handleViewDetails = async (orderId: number) => {
    setIsModalOpen(true);
    setDetailsLoading(true);
    setOrderDetails(null);

    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      try {
        const details = await wordpressService.getOrderDetails(storedUrl, username, password, orderId);
        setOrderDetails(details);
      } catch (error) {
        console.error('خطا در دریافت جزئیات:', error);
        showToast.error('خطا در دریافت اطلاعات سفارش');
        setIsModalOpen(false);
      } finally {
        setDetailsLoading(false);
      }
    } else {
      showToast.error('اطلاعات کاربری یافت نشد');
      setIsModalOpen(false);
      setDetailsLoading(false);
    }
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
                    <div className="flex justify-between items-center mb-3 gap-2 w-full">
                      <span className="font-bold text-gray-900 text-base flex-shrink-0">
                        #{order.order_id}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${renderStatus(order.status).color}`}>
                        {renderStatus(order.status).text}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4 space-y-2 bg-gray-50 p-3 rounded-lg w-full overflow-hidden">
                      {order.items.map((item: any) => (
                        <div key={item.item_id} className="flex justify-between items-start gap-2 w-full min-w-0">
                          <span className="flex-1 min-w-0 break-words leading-relaxed">{item.name}</span>
                          <span className="text-gray-400 text-xs flex-shrink-0 mt-1">{item.qty} عدد</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col gap-1 text-xs text-gray-500 break-words">
                        <span>{formatDate(order.date)}</span>
                        <span className="text-sm font-bold text-gray-900 break-words">{formatPrice(order.total)}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(order.order_id)}
                        className="flex-shrink-0"
                      >
                        <Eye className="h-4 w-4 ml-1" /> جزئیات
                      </Button>
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
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap text-center">عملیات</th>
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
                        <td className="py-4 px-6 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(order.order_id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* بخش صفحه‌بندی (Pagination) */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">تعداد در هر صفحه:</Label>
                  <Select 
                    value={String(perPage)} 
                    onValueChange={(val) => {
                      setPerPage(Number(val)); 
                      setPage(1);
                      setMaxPageReached(null); // ریست کردن محدودیت صفحه در صورت تغییر تعداد
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    disabled={page === 1 || loading} 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronRight className="ml-2 h-4 w-4" /> قبلی
                  </Button>
                  
                  <span className="text-sm text-gray-600 font-medium">
                    صفحه {page.toLocaleString('fa-IR')}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    // غیرفعال کردن دکمه بعدی اگر به صفحه آخر رسیده باشیم یا در حال لود باشد
                    disabled={loading || (maxPageReached !== null && page >= maxPageReached) || !hasMore} 
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    بعدی <ChevronLeft className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* مودال نمایش جزئیات سفارش */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
              جزئیات سفارش
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
              <p className="text-sm text-gray-500">در حال بارگذاری اطلاعات سفارش...</p>
            </div>
          ) : orderDetails ? (
            <div className="space-y-6 mt-4">
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">شماره سفارش</p>
                  <p className="font-bold text-gray-900">#{orderDetails.order_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">تاریخ ثبت</p>
                  <p className="font-medium text-gray-800 text-sm">{formatDate(orderDetails.date_created)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">روش پرداخت</p>
                  <p className="font-medium text-gray-800 text-sm capitalize">{orderDetails.payment_method || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">وضعیت</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStatus(orderDetails.status).color}`}>
                    {renderStatus(orderDetails.status).text}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-2">اطلاعات مشتری</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">نام:</span> <span className="font-medium text-gray-800">{orderDetails.billing?.first_name} {orderDetails.billing?.last_name}</span></div>
                  <div><span className="text-gray-500">ایمیل:</span> <span className="font-medium text-gray-800 break-all">{orderDetails.billing?.email || '—'}</span></div>
                  <div><span className="text-gray-500">تلفن:</span> <span className="font-medium text-gray-800">{orderDetails.billing?.phone || '—'}</span></div>
                  <div><span className="text-gray-500">استان/شهر:</span> <span className="font-medium text-gray-800">{orderDetails.billing?.state} - {orderDetails.billing?.city}</span></div>
                  <div className="md:col-span-2"><span className="text-gray-500">آدرس:</span> <span className="font-medium text-gray-800">{orderDetails.billing?.address_1} {orderDetails.billing?.address_2}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-2">اقلام خریداری شده</h4>
                <div className="space-y-2">
                  {orderDetails.items?.map((item: any) => (
                    <div key={item.item_id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 ml-3">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-500 mt-1">تعداد: {Number(item.quantity).toLocaleString('fa-IR')}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{formatPrice(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>جمع کل (بدون تخفیف):</span>
                  <span>{formatPrice(orderDetails.totals?.subtotal || 0)}</span>
                </div>
                {Number(orderDetails.totals?.discount_total) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>تخفیف:</span>
                    <span>- {formatPrice(orderDetails.totals?.discount_total || 0)}</span>
                  </div>
                )}
                {Number(orderDetails.totals?.shipping_total) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>هزینه ارسال:</span>
                    <span>{formatPrice(orderDetails.totals?.shipping_total || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t mt-2">
                  <span>مبلغ نهایی پرداخت:</span>
                  <span>{formatPrice(orderDetails.totals?.total || 0)}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">اطلاعاتی یافت نشد.</div>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={() => setIsModalOpen(false)} className="w-full">
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}