'use client';

import { useState, useEffect, useRef } from 'react';
import { useScannerStore, useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { mockWordPressService } from '@/services/mockService';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/common/Header';
import DebugOverlay from '@/components/common/DebugOverlay';
import { showToast } from '@/lib/toast';

// Dynamically import Webcam to avoid SSR issues
const Webcam = dynamic(() => import('react-webcam'), { ssr: false });
import jsQR from 'jsqr';

export default function QRScanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const { startScanning, stopScanning, setScanResult, setError, reset } = useScannerStore();
  const { token, websiteUrl, isLoggedIn, logout } = useAuthStore();

  const webcamRef = useRef<any>(null);

  // Validate we have required params
  useEffect(() => {
    if (!isLoggedIn || !token || !websiteUrl || !eventId) {
      router.push('/login');
    }
  }, [isLoggedIn, token, websiteUrl, eventId, router]);

  // Set isClient to true on mount to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    reset();
    startScanning();

    // Enhanced logging for debugging
    console.log('[DEBUG] Initializing scanner component:', {
      isClient: isClient,
      isLoggedIn: isLoggedIn,
      token: token ? '***' : null,
      websiteUrl: websiteUrl,
      eventId: eventId
    });

    // Request camera permissions when the component loads with fallbacks
    const requestCameraPermissionOnLoad = async () => {
      console.log('[DEBUG] Attempting to request camera permissions');

      // First, check if the required APIs are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('[DEBUG] Camera API not supported by browser');
        setCameraError('API دوربین در این مرورگر پشتیبانی نمی‌شود.');
        return;
      }

      try {
        // Check if enumerateDevices is supported
        if (navigator.mediaDevices.enumerateDevices) {
          console.log('[DEBUG] Enumerating available video devices');
          // Try to get a list of available video devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');

          console.log('[DEBUG] Available video devices:', {
            totalDevices: devices.length,
            videoDevices: videoDevices.length
          });

          if (videoDevices.length === 0) {
            console.log('[DEBUG] No video devices found');
            setCameraError('هیچ دستگاه دوربینی روی این دستگاه یافت نشد.');
            return;
          }
        }
        // If enumerateDevices is not supported but getUserMedia is, proceed with camera access attempt

        // Try environment camera first (rear camera)
        try {
          console.log('[DEBUG] Attempting to access environment camera (rear camera)');
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment', // Use rear camera
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          });
          console.log('[DEBUG] Successfully accessed environment camera');
          // Stop the stream immediately after getting permission
          stream.getTracks().forEach(track => track.stop());
          setCameraError(null); // Clear any previous error
          setCameraActive(true); // Enable the camera
          return;
        } catch (envError) {
          console.warn('[DEBUG] Failed to access environment camera, trying default camera:', envError);

          // If environment camera fails, try default camera
          try {
            console.log('[DEBUG] Attempting to access default camera');
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            });
            console.log('[DEBUG] Successfully accessed default camera');
            // Stop the stream immediately after getting permission
            stream.getTracks().forEach(track => track.stop());
            setCameraError(null); // Clear any previous error
            setCameraActive(true); // Enable the camera
            return;
          } catch (defaultError) {
            console.error('[DEBUG] Failed to access default camera:', defaultError);
            setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
          }
        }
      } catch (error) {
        console.error('[DEBUG] Error requesting camera permissions:', error);
        setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
      }
    };

    // Only try to request permissions if we're in a valid state and on the client
    if (isClient && isLoggedIn && token && websiteUrl && eventId) {
      console.log('[DEBUG] Conditions met, requesting camera permissions');
      requestCameraPermissionOnLoad();
    } else {
      console.log('[DEBUG] Conditions not met for requesting camera permissions:', {
        isClient: isClient,
        isLoggedIn: isLoggedIn,
        hasToken: !!token,
        hasWebsiteUrl: !!websiteUrl,
        hasEventId: !!eventId
      });
    }

    return () => {
      console.log('[DEBUG] Scanner component unmounting, stopping scanning and reseting state');
      stopScanning();
      reset();
    };
  }, [reset, startScanning, stopScanning, isLoggedIn, token, websiteUrl, eventId, isClient]);

  // Set up the scanning effect
  useEffect(() => {
    let scanningInterval: NodeJS.Timeout;

    if (cameraActive && !scannedCode) {
      console.log('[DEBUG] Starting QR scanning loop');
      scanningInterval = setInterval(() => {
        if (webcamRef.current && webcamRef.current.video) {
          const video = webcamRef.current.video;

          // Only scan if the video is ready
          if (video.readyState === 4) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);

              if (code && !scannedCode) {
                console.log('[DEBUG] QR code detected:', code.data);
                setScannedCode(code.data);
                validateTicket(code.data);
              } else if (!code) {
                console.log('[DEBUG] No QR code detected in current frame');
              }
            } else {
              console.error('[DEBUG] Could not get canvas context');
            }
          } else {
            console.log('[DEBUG] Video not ready, readyState:', video.readyState);
          }
        } else {
          console.log('[DEBUG] Webcam reference not ready or scanned code already exists');
        }
      }, 500); // Scan every 500ms
    } else {
      console.log('[DEBUG] QR scanning loop not started, conditions:', {
        cameraActive: cameraActive,
        scannedCode: scannedCode
      });
    }

    return () => {
      console.log('[DEBUG] Clearing scanning interval');
      if (scanningInterval) clearInterval(scanningInterval);
    };
  }, [cameraActive, scannedCode, eventId, token]);

  const validateTicket = async (qrCode: string) => {
    // Enhanced logging for debugging
    console.log('[DEBUG] Starting ticket validation:', {
      qrCode: qrCode,
      eventId: eventId,
      userId: useAuthStore.getState().user?.id,
      token: token ? '***' : null, // Don't log actual token
      websiteUrl: websiteUrl
    });

    if (!token || !websiteUrl || !useAuthStore.getState().user?.id) {
      console.log('[DEBUG] Missing required parameters for validation:', {
        token: token ? '***' : null,
        websiteUrl: websiteUrl,
        userId: useAuthStore.getState().user?.id
      });
      setError('Missing website URL, user ID or authentication token');
      showToast.error('URL وب‌سایت، شناسه کاربر یا توکن احراز هویت موجود نیست');
      return;
    }

    try {
      console.log('[DEBUG] Preparing API request for ticket validation:', {
        url: websiteUrl,
        endpoint: 'wp-json/itiket-api/v1/check-qr-code',
        payload: {
          qr_code: qrCode,
          user_id: useAuthStore.getState().user?.id,
          token: '***' // Don't log actual token
        }
      });

      // Use real service for normal operation
      // According to API spec, we need to send user_id as well
      const response = await wordpressService.validateTicket(websiteUrl, {
        event_id: parseInt(eventId || '0'), // Still using for compatibility but may not send in body
        qr_code: qrCode,
        token: token,
      }, useAuthStore.getState().user?.id);

      console.log('[DEBUG] API response received:', {
        status: response.status,
        message: response.msg,
        response: response
      });

      setScanResult(response);

      // Show appropriate toast based on result
      if (response.status === 'SUCCESS') {
        console.log('[DEBUG] Ticket validation successful:', response);
        showToast.success(response.msg || 'بلیت با موفقیت تأیید شد');
      } else {
        console.log('[DEBUG] Ticket validation failed:', response);
        showToast.error(response.msg || 'خطا در تأیید بلیت');
      }

      // Always navigate to results after a short delay, regardless of validity status
      setTimeout(() => {
        console.log('[DEBUG] Navigating to scan result page:', {
          status: response.status,
          msg: response.msg,
          name_customer: response.name_customer,
          seat: response.seat,
          time: response.checkin_time,
          ticket_id: response.ticket_id,
          event_calendar: response.e_cal
        });

        // Build query parameters with all available fields
        const params = new URLSearchParams({
          status: response.status,
          msg: response.msg || '',
          name: response.name_customer || '',
          seat: response.seat || '',
          time: response.checkin_time || '',
          ticket_id: response.ticket_id?.toString() || '',
          e_cal: response.e_cal || '',
        });

        // Add eventId if available
        if (eventId) {
          params.append('eventId', eventId);
        }

        router.push(`/scan/result?${params.toString()}`);
      }, 1500);
    } catch (error: any) {
      console.error('[DEBUG] Error during ticket validation:', error);
      console.error('[DEBUG] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        error: error
      });
      showToast.error('اعتبارسنجی بلیت ناموفق بود. لطفاً دوباره تلاش کنید.');
      setError('اعتبارسنجی بلیت ناموفق بود. لطفاً دوباره تلاش کنید.');

      // Set the scan result as a failure and navigate to results
      const errorResult = {
        status: 'FAIL' as const,
        msg: 'اعتبارسنجی بلیت ناموفق بود. لطفاً دوباره تلاش کنید.',
      };
      setScanResult(errorResult);

      // Navigate to results page even for errors
      setTimeout(() => {
        const params = new URLSearchParams({
          status: errorResult.status,
          msg: errorResult.msg,
        });
        // Add eventId if available
        if (eventId) {
          params.append('eventId', eventId);
        }
        router.push(`/scan/result?${params.toString()}`);
      }, 1500);
    }
  };

  const handleCameraError = (error: any) => {
    console.error('خطای دوربین:', error);
    setCameraError('دسترسی به دوربین رد شد. لطفاً مجوزهای دوربین را برای اسکن کدهای QR فعال کنید.');
    showToast.error('دسترسی به دوربین ناموفق بود');
  };

  const toggleTorch = () => {
    // Torch functionality is limited in browsers, especially on iOS
    // This is mainly for indication to the user
    setTorchOn(!torchOn);
  };

  const handleGoBack = () => {
    router.push('/events');
  };

  const handleLogout = async () => {
    if (websiteUrl && token) {
      try {
        await wordpressService.logout(websiteUrl, { token });
        showToast.success('با موفقیت خارج شدید');
      } catch (error) {
        console.error('خطای API خروج:', error);
        showToast.error('خطا در خروج از سیستم');
        // Continue with local logout even if API call fails
      }
    } else {
      showToast.success('با موفقیت خارج شدید');
    }
    logout();
    router.push('/login');
  };

  // Function to request camera permissions explicitly with fallbacks
  const requestCameraPermission = async () => {
    // First check if we're on the client
    if (!isClient) {
      setCameraError('لطفاً در یک مرورگر پشتیبانی شده دوباره تلاش کنید.');
      return;
    }

    // Then check if the required APIs are available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('API دوربین در این مرورگر پشتیبانی نمی‌شود.');
      return;
    }

    try {
      // Check if enumerateDevices is supported
      if (navigator.mediaDevices.enumerateDevices) {
        // Try to get a list of available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
          setCameraError('هیچ دستگاه دوربینی روی این دستگاه یافت نشد.');
          return;
        }
      }
      // If enumerateDevices is not supported but getUserMedia is, proceed with camera access attempt

      // Try environment camera first (rear camera)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        });
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
        setCameraError(null); // Clear the error to allow camera access
        setCameraActive(true); // Enable the camera
        showToast.success('دسترسی به دوربین با موفقیت اعطا شد');
        return;
      } catch (envError) {
        console.warn('Failed to access environment camera, trying default camera:', envError);

        // If environment camera fails, try default camera
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          });
          // Stop the stream immediately after getting permission
          stream.getTracks().forEach(track => track.stop());
          setCameraError(null); // Clear the error to allow camera access
          setCameraActive(true); // Enable the camera
          showToast.success('دسترسی به دوربین با موفقیت اعطا شد');
          return;
        } catch (defaultError) {
          console.error('درخواست مجوز دوربین ناموفق بود:', defaultError);
          setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
        }
      }
    } catch (error) {
      console.error('درخواست مجوز دوربین ناموفق بود:', error);
      setCameraError('دسترسی به دوربین رد شد. لطفاً مجوزهای دوربین را برای اسکن کدهای QR فعال کنید.');
    }
  };

  if (cameraError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header
          title="اسکنر"
          showBackButton={true}
          backButtonAction={handleGoBack}
        />

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="card p-6 max-w-md w-full text-center">
            <div className="text-error text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">دسترسی به دوربین الزامی است</h2>
            <p className="text-secondary mb-4">{cameraError}</p>
            <p className="text-sm text-secondary mb-4">لطفاً مجوز دسترسی به دوربین را برای ادامه اعطا کنید.</p>
            <button
              onClick={requestCameraPermission}
              className="btn btn-primary w-full mb-3"
            >
              درخواست دسترسی به دوربین
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline w-full"
            >
              تازه‌سازی صفحه
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Custom header for scanner with different styling */}
      <Header
        title="اسکن بلیت"
        showBackButton={true}
        backButtonAction={handleGoBack}
        hideLogout={false}
      />

      {/* Show loading state initially, then check for client-side capabilities */}
      {!isClient ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-secondary">در حال بارگذاری اسکنر...</p>
          </div>
        </div>
      ) : (
        // Check if camera API is supported
        (() => {
          const cameraApiSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

          // If camera API is not supported, show an appropriate message
          if (!cameraApiSupported) {
            return (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="card p-6 max-w-md w-full text-center">
                  <div className="text-warning text-4xl mb-4">⚠️</div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">دوربین پشتیبانی نمی‌شود</h2>
                  <p className="text-secondary mb-4">مرورگر شما از عملکرد دوربین پشتیبانی نمی‌کند.</p>
                  <p className="text-sm text-secondary">از یک مرورگر مدرن مانند Chrome، Firefox یا Safari روی دستگاهی با دسترسی به دوربین استفاده کنید.</p>
                  <button
                    onClick={handleGoBack}
                    className="btn btn-primary w-full mt-4"
                  >
                    بازگشت به رویدادها
                  </button>
                </div>
              </div>
            );
          }

          return (
            <>
              {/* Camera Preview */}
              <div className="flex-1 relative flex items-center justify-center">
                {cameraActive && cameraApiSupported && (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'environment', // Use rear camera
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                    }}
                    onUserMedia={() => setCameraActive(true)}
                    onUserMediaError={handleCameraError}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanner Frame */}
                    <div className="relative border-4 border-green-500 rounded-lg w-64 h-64 flex items-center justify-center">
                      {/* Animated scan line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-scan"></div>

                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
                    </div>

                    {/* Instructions */}
                    <div className="absolute -bottom-12 left-0 right-0 text-center text-white text-sm">
                      کد QR را در چارچوب قرار دهید تا اسکن شود
                    </div>
                  </div>
                </div>

                {/* Torch Button (for indication) */}
                <button
                  onClick={toggleTorch}
                  className={`absolute bottom-24 right-4 p-3 rounded-full ${
                    torchOn ? 'bg-accent' : 'bg-gray-800 bg-opacity-50'
                  } text-white`}
                >
                  {torchOn ? '💡' : '🔦'}
                </button>
              </div>

              {/* Controls */}
              <div className="p-4 bg-black bg-opacity-50 text-white">
                <div className="max-w-7xl mx-auto flex justify-center space-x-4">
                  {cameraApiSupported && (
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className="btn btn-outline"
                    >
                      {cameraActive ? 'مکث' : 'ادامه'}
                    </button>
                  )}
                  <button
                    onClick={handleGoBack}
                    className="btn btn-primary"
                  >
                    بازگشت به رویدادها
                  </button>
                </div>
              </div>

              {/* Debug Overlay */}
              <DebugOverlay />
            </>
          );
        })()
      )}
    </div>
  );
}