'use client';

import { useState } from 'react';
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
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  
  // استیت‌های مربوط به مدال
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

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
    setOrderDetails(null); // ریست جزئیات سفارش قبلی

    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (!storedUrl || !username || !password) {
      showToast.error('اطلاعات کاربری یافت نشد. لطفاً دوباره وارد شوید.');
      setLoading(false);
      return;
    }

    try {
      // ۱. بررسی کوپن
      const voucher = await wordpressService.checkVoucher(storedUrl, username, password, voucherCode);
      
      setIsSuccess(true);
      setVoucherData(voucher);
      playSound(true); 
      
      // ۲. گرفتن جزئیات سفارش با استفاده از order_id
      if (voucher.order_id) {
        try {
          const details = await wordpressService.getOrderDetails(storedUrl, username, password, voucher.order_id);
          setOrderDetails(details);
        } catch (orderError) {
          console.error('خطا در دریافت جزئیات سفارش:', orderError);
          // نیازی نیست کل فرآیند را شکست دهیم، فقط جزئیات سفارش خالی می‌ماند
        }
      }

      setIsModalOpen(true); // باز کردن مدال
      setVoucherCode(''); // پاک کردن اینپوت
      
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

  // تابع ابطال کوپن
  // تابع ابطال کوپن
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
      
      // آپدیت اطلاعات کوپن در مودال
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

  // تابع فرمت قیمت
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
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* بخش اسکن دستی */}
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
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

        {/* بخش اسکن با دوربین */}
        <Card className="shadow-sm border opacity-70">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gray-100 text-gray-500">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">اسکن با دوربین</CardTitle>
                <CardDescription>برای اسکن سریع کد QR با دوربین دستگاه</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full h-12 text-base" 
              disabled={true} 
              variant="outline"
            >
              <Camera className="ml-2 h-5 w-5" />
              فعال‌سازی دوربین
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3">
              این بخش به زودی در دسترس قرار خواهد گرفت
            </p>
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
              
              {/* بخش دکمه ابطال (فقط اگر کوپن فعال باشد) */}
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

              {/* اطلاعات کوپن */}
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

              {/* اطلاعات سفارش (در صورت وجود) */}
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