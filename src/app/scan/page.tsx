'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store'; // برای گرفتن نام کاربر
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Keyboard, Loader2, Search, CheckCircle2, XCircle, Ban, User, Mail, Phone, MapPin, Package } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const { user } = useAuthStore(); // گرفتن اطلاعات کاربر
  
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  
  // استیت‌های مربوط به ساعت و تاریخ
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // استیت‌های مربوط به مدال
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // افکت آپدیت ساعت (دقیقا مثل داشبورد)
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateParts = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      }).formatToParts(now);
      
      const getPart = (type: string) => dateParts.find(p => p.type === type)?.value || '';
      const dateStr = `${getPart('weekday')} ${getPart('day')} ${getPart('month')} ${getPart('year')}`;
      
      const timeStr = new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(now);
      
      setCurrentDate(dateStr);
      setCurrentTime(timeStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // تابع پخش صدا
  const playSound = (success: boolean) => {
    const audio = new Audio(success ? '/ring/ok.mp3' : '/ring/bad.mp3');
    audio.play().catch(e => console.error('Audio error:', e));
  };

  const handleManualCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      showToast.error('کد کوپن را وارد کنید');
      return;
    }

    setLoading(true);
    setOrderDetails(null);

    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (!storedUrl || !username || !password) {
      showToast.error('اطلاعات کاربری یافت نشد. لطفاً دوباره وارد شوید.');
      setLoading(false);
      return;
    }

    try {
      const voucher = await wordpressService.checkVoucher(storedUrl, username, password, voucherCode);
      
      setIsSuccess(true);
      setVoucherData(voucher);
      playSound(true); 
      
      if (voucher.order_id) {
        try {
          const details = await wordpressService.getOrderDetails(storedUrl, username, password, voucher.order_id);
          setOrderDetails(details);
        } catch (orderError) {
          console.error('خطا در دریافت جزئیات سفارش:', orderError);
        }
      }

      setIsModalOpen(true); 
      setVoucherCode(''); 
      
    } catch (error: any) {
      const errorMsg = error.message || 'کوپن نامعتبر است';
      
      setIsSuccess(false);
      setVoucherData({ message: errorMsg });
      setIsModalOpen(true); 
      playSound(false); 
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemVoucher = async () => {
    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();
    const vCode = voucherData?.voucher_code;

    if (!storedUrl || !username || !password || !vCode) {
      showToast.error('اطلاعات کاربری یا کد کوپن یافت نشد');
      return;
    }

    setRedeeming(true);

    try {
      const updatedVoucher = await wordpressService.redeemVoucher(storedUrl, username, password, vCode);
      setVoucherData(updatedVoucher);
      playSound(true);
      showToast.success('کوپن با موفقیت ابطال شد');
    } catch (error: any) {
      playSound(false);
      showToast.error(error.message || 'خطا در ابطال کوپن');
    } finally {
      setRedeeming(false);
    }
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
    <div className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        
        {/* بخش خوش‌آمدگویی و ساعت */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-8 text-center">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            مدیر محترم، خوش آمدید
          </h1>
          {user?.name && (
            <p className="text-base md:text-lg text-gray-600 mb-5 md:mb-6">
              {user.name} عزیز، به بخش بررسی کوپن‌ها خوش آمدید.
            </p>
          )}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mt-5 md:mt-6 pt-5 md:pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-sm md:text-base font-medium tracking-wide">
                {currentDate} | <span className="text-sm md:text-base font-medium tracking-wide">{currentTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* بخش اسکن با دوربین - طراحی جدید با انیمیشن ملایم */}
        <button 
          onClick={() => router.push('/scan/camera')}
          className="group w-full animate-gentle-float focus:outline-none"
        >
          <div className="relative w-full flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-l from-blue-600 to-indigo-600 p-1 shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40">
            
            {/* لایه درونی دکمه */}
            <div className="flex items-center justify-between w-full gap-4 rounded-[15px] bg-gradient-to-l from-blue-600 to-indigo-600 px-5 sm:px-8 py-5 sm:py-6">
              
              <div className="flex items-center gap-4 sm:gap-5 z-10">
                {/* باکس آیکون */}
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 transition-colors duration-300 group-hover:bg-white/25">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                
                {/* متن‌ها */}
                <div className="text-right text-white">
                  <h3 className="text-lg sm:text-xl font-bold">اسکن با دوربین</h3>
                  <p className="text-xs sm:text-sm text-blue-50 opacity-90 mt-1">
                    برای بررسی سریع‌تر، QR Code را اسکن کنید
                  </p>
                </div>
              </div>

              {/* فلش راهنما */}
              <div className="flex items-center text-white transition-all duration-300 group-hover:-translate-x-2 z-10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>

            </div>
          </div>
        </button>

        {/* بخش اسکن دستی */}
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">اسکن دستی کوپن</CardTitle>
                <CardDescription>کد کوپن را در کادر زیر وارد کرده و بررسی را بزنید</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleManualCheck} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voucher_code">کد کوپن</Label>
                <Input
                  id="voucher_code"
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="مثال: 753"
                  className="h-12 text-lg tracking-wider"
                  disabled={loading}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    در حال بررسی...
                  </>
                ) : (
                  <>
                    <Search className="ml-2 h-5 w-5" />
                    بررسی کوپن
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* مدال نمایش نتیجه */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="items-center text-center">
            <div className={`mx-auto mb-4 p-3 rounded-full ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isSuccess ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            <DialogTitle className="text-xl">
              {isSuccess ? 'تبریک! اطلاعات کوپن بررسی شده معتبر است' : 'خطا در بررسی کوپن'}
            </DialogTitle>
            <DialogDescription>
              {isSuccess ? 'جزئیات کوپن و سفارش در زیر نمایش داده شده است.' : 'کوپن وارد شده معتبر نیست.'}
            </DialogDescription>
          </DialogHeader>
          
          {isSuccess && voucherData ? (
            <div className="space-y-4 text-sm">
              
              {voucherData.status === 'active' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-orange-800">آماده برای ابطال</p>
                    <p className="text-xs text-orange-600">برای استفاده نهایی، دکمه ابطال را بزنید</p>
                  </div>
                  <Button 
                    onClick={handleRedeemVoucher} 
                    disabled={redeeming}
                    variant="destructive"
                    size="sm"
                  >
                    {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4 ml-1" />}
                    ابطال کوپن
                  </Button>
                </div>
              )}

              {voucherData.status === 'redeemed' && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-center text-red-700 font-medium">
                  این کوپن پیش‌تر در تاریخ {formatDate(voucherData.redeemed_at)} ابطال شده است.
                </div>
              )}

              <div className="border-t border-b border-gray-100 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">نام محصول:</span>
                  <span className="font-medium text-gray-900 text-left max-w-[60%]">{voucherData.product_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">کد کوپن:</span>
                  <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {voucherData.voucher_code}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">مبلغ:</span>
                  <span className="font-medium text-gray-900">{formatPrice(voucherData.voucher_price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">تعداد:</span>
                  <span className="font-medium text-gray-900">{voucherData.qty}</span>
                </div>
              </div>

              {orderDetails && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b pb-2 mb-2">
                    <Package className="h-4 w-4" /> اطلاعات سفارش (#{orderDetails.order_id})
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500 block text-xs">مشتری:</span>
                        <span className="font-medium text-gray-800">{orderDetails.billing?.first_name} {orderDetails.billing?.last_name}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500 block text-xs">تلفن:</span>
                        <span className="font-medium text-gray-800">{orderDetails.billing?.phone || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500 block text-xs">ایمیل:</span>
                        <span className="font-medium text-gray-800 break-all">{orderDetails.billing?.email || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500 block text-xs">آدرس:</span>
                        <span className="font-medium text-gray-800">{orderDetails.billing?.state} - {orderDetails.billing?.city}، {orderDetails.billing?.address_1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <span className="text-gray-500">مبلغ کل سفارش:</span>
                    <span className="font-bold text-gray-900">{formatPrice(orderDetails.totals?.total || 0)}</span>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center text-red-600 font-medium py-4">
              {voucherData?.message}
            </div>
          )}
          
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setIsModalOpen(false)} className="w-full" variant="outline">
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}