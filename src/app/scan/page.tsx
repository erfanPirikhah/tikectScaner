'use client';

import { useState } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Keyboard, Loader2, Search, CheckCircle2, XCircle } from 'lucide-react';

export default function ScanPage() {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleManualCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      showToast.error('کد کوپن را وارد کنید');
      return;
    }

    setLoading(true);
    setResult(null);

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
      setResult({ success: true, message: response?.data?.message || 'کوپن با موفقیت تایید شد!' });
      showToast.success('کوپن معتبر است');
      
      // پخش صدای موفقیت (اختیاری)
      const audio = new Audio('/ring/ok.mp3');
      audio.play().catch(e => console.error('Audio error:', e));

    } catch (error: any) {
      const errorMsg = error.message || 'کوپن نامعتبر است';
      setResult({ success: false, message: errorMsg });
      showToast.error(errorMsg);
      
      // پخش صدای خطا (اختیاری)
      const audio = new Audio('/ring/bad.mp3');
      audio.play().catch(e => console.error('Audio error:', e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-950 min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* بخش اسکن دستی */}
        <Card className="shadow-sm border dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
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

          {result && (
            <CardFooter className="flex flex-col items-stretch">
              <div className={`flex items-center gap-3 p-4 rounded-lg w-full ${result.success ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'}`}>
                {result.success ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <XCircle className="w-6 h-6 flex-shrink-0" />}
                <p className="font-medium">{result.message}</p>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* بخش اسکن با دوربین */}
        <Card className="shadow-sm border dark:bg-gray-900 dark:border-gray-800 opacity-70">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
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
              disabled={true} // دکمه فعلا غیرفعال است
              variant="outline"
            >
              <Camera className="ml-2 h-5 w-5" />
              فعال‌سازی دوربین
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3 dark:text-gray-500">
              این بخش به زودی در دسترس قرار خواهد گرفت
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}