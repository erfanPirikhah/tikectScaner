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
import { Camera, Keyboard, Loader2, Search, CheckCircle2, XCircle } from 'lucide-react';

export default function ScanPage() {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // استیت‌های مربوط به مدال
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

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

    const username = storageService.getUsername();
    const password = storageService.getPassword();
    const storedUrl = storageService.getWebsiteUrl();

    if (!storedUrl || !username || !password) {
      showToast.error('اطلاعات کاربری یافت نشد. لطفاً دوباره وارد شوید.');
      setLoading(false);
      return;
    }

    try {
      const response = await wordpressService.checkVoucher(storedUrl, username, password, voucherCode);
      
      // اگر اینجا رسید یعنی success=true است
      setIsSuccess(true);
      setResultData(response.data.voucher); // ذخیره اطلاعات کوپن
      setIsModalOpen(true); // باز کردن مدال
      playSound(true); // پخش صدای موفقیت
      
      setVoucherCode(''); // پاک کردن اینپوت
      
    } catch (error: any) {
      const errorMsg = error.message || 'کوپن نامعتبر است';
      
      // تنظیمات برای مدال خطا
      setIsSuccess(false);
      setResultData({ message: errorMsg });
      setIsModalOpen(true); // باز کردن مدال
      playSound(false); // پخش صدای خطا
    } finally {
      setLoading(false);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className={`mx-auto mb-4 p-3 rounded-full ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isSuccess ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            <DialogTitle className="text-xl">
              {isSuccess ? 'کوپن با موفقیت تایید شد' : 'خطا در بررسی کوپن'}
            </DialogTitle>
            <DialogDescription>
              {isSuccess ? 'جزئیات کوپن در زیر نمایش داده شده است.' : 'کوپن وارد شده معتبر نیست یا متعلق به شما نیست.'}
            </DialogDescription>
          </DialogHeader>
          
          {isSuccess && resultData ? (
            <div className="border-t border-b border-gray-100 py-4 my-2 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">نام محصول:</span>
                <span className="font-medium text-gray-900 text-left">{resultData.product_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">کد کوپن:</span>
                <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {resultData.voucher_code}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">مبلغ:</span>
                <span className="font-medium text-gray-900">{formatPrice(resultData.voucher_price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">شناسه سفارش:</span>
                <span className="font-medium text-gray-900">#{resultData.order_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">تعداد:</span>
                <span className="font-medium text-gray-900">{resultData.qty}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-600 font-medium py-4">
              {resultData?.message}
            </div>
          )}
          
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setIsModalOpen(false)} className="w-full">
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}