'use client';

import { useEffect, useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { Package, Search, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // استیت‌های فیلتر
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    product_id: "",
    status: ""
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (storedUrl && username && password) {
      setLoading(true);
      wordpressService.getProducts(storedUrl, username, password, {
        ...filters,
        page: page.toString(),
        per_page: perPage.toString(),
      })
        .then((data) => {
          setProducts(data);
          // اگر تعداد محصولات با per_page برابر باشد، احتمالا صفحه بعدی هم وجود دارد
          setHasMore(data.length === perPage);
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
  }, [fetchTrigger, page, perPage]);

  const handleApplyFilters = () => {
    setPage(1);
    setFetchTrigger(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setFilters({
      date_from: "",
      date_to: "",
      product_id: "",
      status: ""
    });
    setPage(1);
    setFetchTrigger(prev => prev + 1);
  };

  const formatPrice = (price: string | number) => {
    try {
      return Number(price).toLocaleString('fa-IR') + ' تومان';
    } catch {
      return String(price);
    }
  };

  const renderStockStatus = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      instock: { text: 'موجود', color: 'bg-green-100 text-green-800' },
      outofstock: { text: 'ناموجود', color: 'bg-red-100 text-red-800' },
      onbackorder: { text: 'پیش‌سفارش', color: 'bg-yellow-100 text-yellow-800' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-pink-50 text-pink-600">
            <Package className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">محصولات و خدمات</h1>
            <p className="text-sm text-gray-500 mt-1">مدیریت موجودی و قیمت محصولات</p>
          </div>
        </div>

        {/* بخش فیلترها */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">فیلتر محصولات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_from">از تاریخ</Label>
                <Input 
                  id="date_from" 
                  type="date" 
                  value={filters.date_from} 
                  onChange={(e) => setFilters({...filters, date_from: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_to">تا تاریخ</Label>
                <Input 
                  id="date_to" 
                  type="date" 
                  value={filters.date_to} 
                  onChange={(e) => setFilters({...filters, date_to: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_id">شناسه محصول</Label>
                <Input 
                  id="product_id" 
                  type="number" 
                  placeholder="مثال: 5" 
                  value={filters.product_id} 
                  onChange={(e) => setFilters({...filters, product_id: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">وضعیت</Label>
                <Select 
                  value={filters.status || "all"} 
                  onValueChange={(val) => setFilters({...filters, status: val === "all" ? "" : val})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="همه وضعیت‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="pending">در انتظار (Pending)</SelectItem>
                    <SelectItem value="processing">در حال انجام (Processing)</SelectItem>
                    <SelectItem value="completed">تکمیل شده (Completed)</SelectItem>
                    <SelectItem value="cancelled">لغو شده (Cancelled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-4 items-end justify-between">
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters}>
                  <Search className="ml-2 h-4 w-4" /> اعمال فیلتر
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  <RotateCcw className="ml-2 h-4 w-4" /> پاک کردن فیلترها
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">تعداد در هر صفحه:</Label>
                <Select 
                  value={String(perPage)} 
                  onValueChange={(val) => {
                    setPerPage(Number(val)); 
                    setPage(1);
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
            </div>
          </CardContent>
        </Card>

        {/* محتوای جدول */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
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
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500">هیچ محصولی یافت نشد</p>
              <p className="text-sm text-gray-400 mt-1">محصولی با این فیلترها وجود ندارد.</p>
            </div>
          ) : (
            <>
              {/* نمای موبایل (کارت‌های زیر هم) */}
              <div className="md:hidden divide-y divide-gray-200">
                {products.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-900 text-sm">{product.name}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${renderStockStatus(product.stock_status).color}`}>
                        {renderStockStatus(product.stock_status).text}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">شناسه: {product.id}</span>
                      <span className="text-xs text-gray-500">موجودی: {product.stock_quantity !== null ? Number(product.stock_quantity).toLocaleString('fa-IR') : 'نامحدود'}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      {product.regular_price !== product.sale_price && Number(product.regular_price) > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400 line-through">{formatPrice(product.regular_price)}</span>
                          <span className="text-sm font-bold text-green-600">{formatPrice(product.sale_price)}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
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
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">شناسه</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">نام محصول</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">قیمت اصلی</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">قیمت با تخفیف</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">موجودی</th>
                      <th className="py-4 px-6 font-medium text-gray-500 text-sm">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-500">
                          #{product.id}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 max-w-xs">
                          {product.name}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                          {Number(product.regular_price) > 0 ? (
                            <span className={product.regular_price !== product.sale_price ? 'line-through' : ''}>
                              {formatPrice(product.regular_price)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold whitespace-nowrap">
                          {Number(product.sale_price) > 0 ? (
                            <span className={product.regular_price !== product.sale_price ? 'text-green-600' : 'text-gray-900'}>
                              {formatPrice(product.sale_price)}
                            </span>
                          ) : <span className="text-green-600">رایگان</span>}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
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

              {/* بخش صفحه‌بندی (Pagination) */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  disabled={page === 1 || loading} 
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronRight className="ml-2 h-4 w-4" /> قبلی
                </Button>
                
                <span className="text-sm text-gray-600">صفحه {page.toLocaleString('fa-IR')}</span>
                
                <Button 
                  variant="outline" 
                  disabled={!hasMore || loading} 
                  onClick={() => setPage(prev => prev + 1)}
                >
                  بعدی <ChevronLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}