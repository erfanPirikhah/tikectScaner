'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { storageService } from '@/services/storage';
import { wordpressService } from '@/services/wordpress';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, CameraOff, X, Loader2, CheckCircle2, XCircle, Ban, User, Mail, Phone, MapPin, Package } from 'lucide-react';
import jsQR from 'jsqr';

// Dynamically import Webcam to avoid SSR issues
const Webcam = dynamic<any>(
  () => import('react-webcam').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="text-white">در حال بارگذاری دوربین...</div> }
);

function ScannerContent() {
  const router = useRouter();
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // States for API and Modals
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const webcamRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const playSound = (success: boolean) => {
    const audio = new Audio(success ? '/ring/ok.mp3' : '/ring/bad.mp3');
    audio.play().catch(e => console.error('Audio error:', e));
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

  // تابع استخراج کد کوپن از لینک یا متن خام اسکن شده
  const extractVoucherCode = (rawString: string): string => {
    let cleanString = rawString.trim().replace(/^["']|["']$/g, '');
    const regexMatch = cleanString.match(/[?&]voucher=([^&]+)/);
    if (regexMatch && regexMatch[1]) {
      return decodeURIComponent(regexMatch[1]).replace(/["']$/g, '');
    }
    return cleanString;
  };

  const validateVoucher = async (code: string) => {
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
      const voucher = await wordpressService.checkVoucher(storedUrl, username, password, code);
      
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // ریست کردن کد اسکن شده برای آماده بودن برای اسکن بعدی
    setTimeout(() => setScannedCode(null), 300);
  };

  // Set up the scanning effect
  useEffect(() => {
    let scanningInterval: NodeJS.Timeout;

    if (cameraActive && !scannedCode && !loading && !isModalOpen) {
      scanningInterval = setInterval(() => {
        if (webcamRef.current && webcamRef.current.video) {
          const video = webcamRef.current.video;

          if (video.readyState === 4) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);

              if (code && !scannedCode) {
                const actualVoucherCode = extractVoucherCode(code.data);
                setScannedCode(actualVoucherCode);
                validateVoucher(actualVoucherCode);
              }
            }
          }
        }
      }, 500);
    }

    return () => {
      if (scanningInterval) clearInterval(scanningInterval);
    };
  }, [cameraActive, scannedCode, loading, isModalOpen]);

  const handleCameraError = (error: any) => {
    console.error('خطای دوربین:', error);
    setCameraError('دسترسی به دوربین رد شد. لطفاً از تنظیمات مرورگر اجازه دسترسی به دوربین را بدهید یا از اتصال HTTPS مطمئن شوید.');
  };

  const requestCameraPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('API دوربین در این مرورگر پشتیبانی نمی‌شود.');
      return;
    }

    try {
      // تلاش برای گرفتن دوربین (ترجیحاً پشت، در غیر این صورت هر دوربینی)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
      } catch (e) {
        // اگر دوربین پشت نبود، دوربین پیش‌فرض را می‌گیرد
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      stream.getTracks().forEach(track => track.stop());
      
      // ریست کردن کامپوننت برای اطمینان از اجرای دوباره دوربین
      setCameraActive(false);
      setCameraError(null);
      setTimeout(() => setCameraActive(true), 100);
      
      showToast.success('دسترسی به دوربین اعطا شد');
    } catch (error) {
      setCameraError('دسترسی به دوربین رد شد. لطفاً تنظیمات مرورگر خود را بررسی کنید.');
    }
  };

  if (cameraError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-xl text-center">دسترسی به دوربین الزامی است</CardTitle>
              <CardDescription className="text-center">برای اسکن کوپن‌ها نیاز به دسترسی به دوربین دارید</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>خطا</AlertTitle>
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            </CardContent>
            <div className="flex flex-col gap-2 p-6 pt-0">
              <Button onClick={requestCameraPermission} className="w-full">
                <Camera className="ml-2 h-4 w-4" />
                درخواست دسترسی مجدد
              </Button>
              <Button variant="outline" onClick={() => router.push('/scan')} className="w-full">
                بازگشت به اسکن دستی
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <Button variant="ghost" size="icon" onClick={() => router.push('/scan')} className="text-white rounded-full bg-black/30 hover:bg-black/50">
          <X className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCameraActive(!cameraActive)} 
          className="text-white rounded-full bg-black/30 hover:bg-black/50"
          disabled={loading}
        >
          {cameraActive ? <CameraOff className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
        </Button>
      </div>

      {/* Webcam Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isClient && cameraActive && (
          <Webcam
            key="webcam-stream" // اضافه شدن کلید برای اطمینان از رندر مجدد
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: { ideal: 'environment' }
            }}
            onUserMedia={() => setCameraActive(true)}
            onUserMediaError={handleCameraError}
            className="w-full h-full object-cover"
            forceScreenshot
          />
        )}

        {/* Scanner Overlay Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 max-w-[80vw] max-h-[80vw]">
            {/* Dark overlay outside the square */}
            <div className="absolute inset-0 -m-[1000%] box-border border-[1000%] border-black/60 rounded-3xl"></div>
            
            {/* Corners */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
            
            {/* Scan Line Animation */}
            {!loading && !isModalOpen && (
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_2px_rgba(59,130,246,0.8)] animate-scan"></div>
            )}
          </div>
        </div>
      </div>

      {/* Central Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none">
          <Loader2 className="h-16 w-16 animate-spin text-blue-400 mb-4" />
          <p className="text-white text-lg font-medium">در حال بررسی کوپن...</p>
        </div>
      )}

      {/* Bottom Info */}
      {!loading && !isModalOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 text-center bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white text-sm sm:text-base mb-4">
            کد QR کوپن را درون کادر قرار دهید
          </p>
        </div>
      )}

      {/* Voucher Result Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
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
            <Button onClick={handleCloseModal} className="w-full" variant="outline">
              اسکن کوپن بعدی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function ScannerClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>در حال بارگذاری اسکنر...</p>
          </div>
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}