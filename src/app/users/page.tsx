'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { Users, Search, RotateCcw, Mail, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersPage() {
  const [customersData, setCustomersData] = useState<{ total: number; customers: any[] }>({ total: 0, customers: [] });
  const [loading, setLoading] = useState(true);
  
  // استیت‌های فیلتر
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    min_orders: "",
    max_orders: "",
    min_total: "",
    max_total: "",
    sort_dir: "DESC" // پیش‌فرض نزولی
  });
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      setLoading(true);
      wordpressService.getCustomers(storedUrl, username, password, filters)
        .then((data) => {
          setCustomersData(data);
        })
        .catch((error) => {
          console.error('خطا در دریافت مشتریان:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [fetchTrigger]);

  const handleApplyFilters = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      email: "",
      min_orders: "",
      max_orders: "",
      min_total: "",
      max_total: "",
      sort_dir: "DESC"
    });
    setFetchTrigger(prev => prev + 1);
  };

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

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* هدر صفحه */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 rounded-xl bg-orange-50 text-orange-600 flex-shrink-0">
            <Users className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">لیست کاربران و مشتریان</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
              مجموع مشتریان: {customersData.total.toLocaleString('fa-IR')} نفر
            </p>
          </div>
        </div>

        {/* بخش فیلترها */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">فیلتر مشتریان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* نام و ایمیل */}
              <div className="space-y-2">
                <Label htmlFor="name">نام مشتری</Label>
                <Input 
                  id="name" 
                  placeholder="مثال: علی" 
                  value={filters.name} 
                  onChange={(e) => setFilters({...filters, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="example@mail.com" 
                  value={filters.email} 
                  onChange={(e) => setFilters({...filters, email: e.target.value})} 
                />
              </div>

              {/* تعداد سفارشات */}
              <div className="space-y-2">
                <Label>تعداد سفارشات</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    placeholder="حداقل" 
                    value={filters.min_orders} 
                    onChange={(e) => setFilters({...filters, min_orders: e.target.value})} 
                  />
                  <span>-</span>
                  <Input 
                    type="number"
                    placeholder="حداکثر" 
                    value={filters.max_orders} 
                    onChange={(e) => setFilters({...filters, max_orders: e.target.value})} 
                  />
                </div>
              </div>

              {/* مجموع خرید */}
              <div className="space-y-2">
                <Label>مجموع خرید (تومان)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    placeholder="حداقل" 
                    value={filters.min_total} 
                    onChange={(e) => setFilters({...filters, min_total: e.target.value})} 
                  />
                  <span>-</span>
                  <Input 
                    type="number"
                    placeholder="حداکثر" 
                    value={filters.max_total} 
                    onChange={(e) => setFilters({...filters, max_total: e.target.value})} 
                  />
                </div>
              </div>

              {/* مرتب سازی */}
              <div className="space-y-2">
                <Label>مرتب‌سازی بر اساس</Label>
                <Select 
                  value={filters.sort_dir} 
                  onValueChange={(val) => setFilters({...filters, sort_dir: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">نزولی (جدیدترین)</SelectItem>
                    <SelectItem value="ASC">صعودی (قدیمی‌ترین)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
                <Search className="ml-2 h-4 w-4" /> اعمال فیلتر
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">
                <RotateCcw className="ml-2 h-4 w-4" /> پاک کردن فیلترها
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* محتوای جدول */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          
          {loading ? (
            <div className="p-4 md:p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : customersData.customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500">کاربری یافت نشد</p>
              <p className="text-sm text-gray-400 mt-1">کاربری با این مشخصات وجود ندارد.</p>
            </div>
          ) : (
            <>
              {/* نمای موبایل و تبلت (کارت‌های زیر هم) */}
              <div className="lg:hidden divide-y divide-gray-200 w-full">
                {customersData.customers.map((customer) => (
                  <div key={customer.customer_id} className="p-4 hover:bg-gray-50 transition-colors w-full">
                    {/* هدر کارت */}
                    <div className="flex justify-between items-start mb-3 gap-2 w-full">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 text-base block truncate">{customer.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        شناسه: {customer.customer_id}
                      </span>
                    </div>
                    
                    {/* آمار کاربر */}
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3" /> تعداد سفارش
                        </div>
                        <span className="font-bold text-gray-800">
                          {Number(customer.orders_count).toLocaleString('fa-IR')}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> مجموع خرید
                        </div>
                        <span className="font-bold text-gray-800 text-xs">
                          {formatPrice(customer.orders_total)}
                        </span>
                      </div>
                    </div>

                    {/* فوتر کارت */}
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100 w-full text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> آخرین سفارش:
                      </span>
                      <span>{formatDate(customer.last_order_date)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای دسکتاپ (جدول) */}
              <div className="hidden lg:block overflow-hidden w-full">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">شناسه</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">نام مشتری</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">ایمیل</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">تعداد سفارش</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">مجموع خرید</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm whitespace-nowrap">آخرین سفارش</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customersData.customers.map((customer) => (
                      <tr key={customer.customer_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap">
                          #{customer.customer_id}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-gray-900">
                          {customer.name}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                          {customer.email}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                          {Number(customer.orders_count).toLocaleString('fa-IR')}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {formatPrice(customer.orders_total)}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(customer.last_order_date)}
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