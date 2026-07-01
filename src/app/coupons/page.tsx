'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { Ticket, ChevronRight, ChevronLeft, Search, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';

// تابع تبدیل اعداد فارسی و عربی به انگلیسی
const toEnglishDigits = (str: string) => {
  if (!str) return str;
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return str
    .replace(/[۰-۹]/g, d => persianDigits.indexOf(d).toString())
    .replace(/[٠-٩]/g, d => arabicDigits.indexOf(d).toString());
};

export default function CouponsPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [maxPageReached, setMaxPageReached] = useState<number | null>(null);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      setLoading(true);
      
      const apiFilters: any = { page: page.toString(), per_page: perPage.toString() };
         if (dateFrom) apiFilters.date_from = toEnglishDigits(dateFrom.convert(gregorian).format("YYYY-MM-DD"));
         if (dateTo) apiFilters.date_to = toEnglishDigits(dateTo.convert(gregorian).format("YYYY-MM-DD"));

      wordpressService.getVouchers(storedUrl, username, password, apiFilters)
        .then((data) => {
          if (data.length === 0 && page > 1) {
            setMaxPageReached(page - 1);
            setPage(page - 1);
          } else {
            setVouchers(data);
            if (data.length < perPage) setMaxPageReached(page);
            else setMaxPageReached(null);
          }
        })
        .catch((error) => console.error('خطا در دریافت کوپن‌ها:', error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [page, perPage, fetchTrigger]);

  const handleApplyFilters = () => { setPage(1); setMaxPageReached(null); setFetchTrigger(prev => prev + 1); };
  const handleClearFilters = () => { setDateFrom(null); setDateTo(null); setPage(1); setMaxPageReached(null); setFetchTrigger(prev => prev + 1); };

  const formatPrice = (price: string | number) => Number(price).toLocaleString('fa-IR') + ' تومان';
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
    } catch { return dateStr; }
  };

  const renderVoucherStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      active: { text: 'فعال', color: 'bg-green-100 text-green-800' },
      redeemed: { text: 'استفاده شده', color: 'bg-gray-100 text-gray-800' },
      expired: { text: 'منقضی شده', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const renderOrderStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      'wc-completed': { text: 'تکمیل شده', color: 'bg-green-100 text-green-800' },
      'wc-pending': { text: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800' },
      'wc-processing': { text: 'در حال انجام', color: 'bg-blue-100 text-blue-800' },
      'wc-cancelled': { text: 'لغو شده', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || { text: status.replace('wc-', ''), color: 'bg-gray-100 text-gray-800' };
  };

  const renderVoucherCodes = (codes: string) => {
    return (
      <div className="flex flex-wrap gap-1">
        {codes.split(',').map(c => c.trim()).filter(Boolean).map((code, idx) => (
          <span key={idx} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">{code}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 text-green-600"><Ticket className="w-6 h-6 md:w-7 md:h-7" /></div>
          <div><h1 className="text-xl md:text-2xl font-bold text-gray-900">کوپن‌های خریداری شده</h1><p className="text-sm text-gray-500 mt-1">لیست تمامی ووچرها و کوپن‌های صادر شده</p></div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3"><CardTitle className="text-base">فیلتر بر اساس تاریخ</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>از تاریخ</Label>
                <DatePicker value={dateFrom} onChange={setDateFrom} calendar={persian} locale={persian_fa} calendarPosition="bottom-right" inputClass="w-full p-2 border border-gray-200 rounded-md text-sm h-9" placeholder="انتخاب تاریخ" />
              </div>
              <div className="space-y-2">
                <Label>تا تاریخ</Label>
                <DatePicker value={dateTo} onChange={setDateTo} calendar={persian} locale={persian_fa} calendarPosition="bottom-right" inputClass="w-full p-2 border border-gray-200 rounded-md text-sm h-9" placeholder="انتخاب تاریخ" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters}><Search className="ml-2 h-4 w-4" /> اعمال فیلتر</Button>
              <Button variant="outline" onClick={handleClearFilters}><RotateCcw className="ml-2 h-4 w-4" /> پاک کردن</Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4"><Skeleton className="h-10 w-full" />{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center"><Ticket className="w-12 h-12 text-gray-300 mb-4" /><p className="text-lg font-medium text-gray-500">کوپنی یافت نشد</p></div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">کد کوپن</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">محصول</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">قیمت</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">وضعیت کوپن</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">وضعیت سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">تاریخ استفاده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vouchers.map((voucher) => (
                      <tr key={`${voucher.order_id}-${voucher.order_item_id}`} className="hover:bg-gray-50 align-top">
                        <td className="py-4 px-6 text-sm">{renderVoucherCodes(voucher.voucher_code)}</td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 max-w-[200px]">{voucher.product_name}</td>
                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">#{voucher.order_id}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{formatPrice(voucher.voucher_price)}</td>
                        <td className="py-4 px-6"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderVoucherStatus(voucher.status).color}`}>{renderVoucherStatus(voucher.status).text}</span></td>
                        <td className="py-4 px-6"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderOrderStatus(voucher.order_status).color}`}>{renderOrderStatus(voucher.order_status).text}</span></td>
                        <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">{formatDate(voucher.redeemed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-gray-200">
                {vouchers.map((voucher) => (
                  <div key={`${voucher.order_id}-${voucher.order_item_id}`} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-900 text-sm flex-1 ml-2">{voucher.product_name}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderVoucherStatus(voucher.status).color}`}>{renderVoucherStatus(voucher.status).text}</span>
                    </div>
                    <div className="mb-3"><span className="text-xs text-gray-500 block mb-1">کد کوپن:</span>{renderVoucherCodes(voucher.voucher_code)}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3 bg-gray-50 p-3 rounded-lg">
                      <div>سفارش: <span className="font-medium text-gray-700">#{voucher.order_id}</span></div>
                      <div>تعداد: <span className="font-medium text-gray-700">{Number(voucher.qty).toLocaleString('fa-IR')}</span></div>
                      <div>قیمت: <span className="font-medium text-gray-700">{formatPrice(voucher.voucher_price)}</span></div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">تاریخ: {formatDate(voucher.redeemed_at)}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderOrderStatus(voucher.order_status).color}`}>{renderOrderStatus(voucher.order_status).text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">تعداد در هر صفحه:</Label>
                  <Select value={String(perPage)} onValueChange={(val) => { setPerPage(Number(val)); setPage(1); setMaxPageReached(null); }}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage(prev => Math.max(1, prev - 1))}><ChevronRight className="ml-2 h-4 w-4" /> قبلی</Button>
                  <span className="text-sm text-gray-600">صفحه {page.toLocaleString('fa-IR')}</span>
                  <Button variant="outline" disabled={loading || (maxPageReached !== null && page >= maxPageReached)} onClick={() => setPage(prev => prev + 1)}>بعدی <ChevronLeft className="mr-2 h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}