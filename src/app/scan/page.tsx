'use client';

import { useState, useEffect, useRef } from 'react';
import { useScannerStore, useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { mockWordPressService } from '@/services/mockService';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/common/Header';

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

    // Request camera permissions when the component loads with fallbacks
    const requestCameraPermissionOnLoad = async () => {
      // First, check if the required APIs are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not supported in this browser.');
        return;
      }

      try {
        // Check if enumerateDevices is supported
        if (navigator.mediaDevices.enumerateDevices) {
          // Try to get a list of available video devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');

          if (videoDevices.length === 0) {
            setCameraError('No camera devices found on this device.');
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
          setCameraError(null); // Clear any previous error
          setCameraActive(true); // Enable the camera
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
            setCameraError(null); // Clear any previous error
            setCameraActive(true); // Enable the camera
            return;
          } catch (defaultError) {
            console.error('Camera permission request failed:', defaultError);
            setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
          }
        }
      } catch (error) {
        console.error('Camera permission request failed:', error);
        setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
      }
    };

    // Only try to request permissions if we're in a valid state and on the client
    if (isClient && isLoggedIn && token && websiteUrl && eventId) {
      requestCameraPermissionOnLoad();
    }

    return () => {
      stopScanning();
      reset();
    };
  }, [reset, startScanning, stopScanning, isLoggedIn, token, websiteUrl, eventId, isClient]);

  // Set up the scanning effect
  useEffect(() => {
    let scanningInterval: NodeJS.Timeout;
    
    if (cameraActive && !scannedCode) {
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
                setScannedCode(code.data);
                validateTicket(code.data);
              }
            }
          }
        }
      }, 500); // Scan every 500ms
    }
    
    return () => {
      if (scanningInterval) clearInterval(scanningInterval);
    };
  }, [cameraActive, scannedCode, eventId, token]);

  const validateTicket = async (qrCode: string) => {
    if (!eventId || !token || !websiteUrl) {
      setError('Missing event ID, website URL or authentication token');
      return;
    }

    try {
      // Check if we're in test mode
      const isTestMode = websiteUrl === 'http://test.local' ||
                        websiteUrl.toLowerCase().includes('mock') ||
                        token === 'test_mode_token';

      let response;
      if (isTestMode) {
        // Use mock service for test mode
        response = await mockWordPressService.validateTicket(websiteUrl, {
          event_id: parseInt(eventId),
          qr_code: qrCode,
          token: token,
        });
      } else {
        // Use real service for normal operation
        response = await wordpressService.validateTicket(websiteUrl, {
          event_id: parseInt(eventId),
          qr_code: qrCode,
          token: token,
        });
      }

      setScanResult(response);

      // Navigate to results after a short delay
      setTimeout(() => {
        router.push(`/scan/result?status=${response.status}&msg=${encodeURIComponent(response.msg || '')}&name=${encodeURIComponent(response.name_customer || '')}&seat=${encodeURIComponent(response.seat || '')}&time=${encodeURIComponent(response.checkin_time || '')}`);
      }, 1500);
    } catch (error) {
      console.error('Ticket validation error:', error);
      setError('Failed to validate ticket. Please try again.');
      // Reset so we can scan again
      setScannedCode(null);
    }
  };

  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
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
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with local logout even if API call fails
      }
    }
    logout();
    router.push('/login');
  };

  // Function to request camera permissions explicitly with fallbacks
  const requestCameraPermission = async () => {
    // First check if we're on the client
    if (!isClient) {
      setCameraError('Please try again in a supported browser.');
      return;
    }

    // Then check if the required APIs are available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not supported in this browser.');
      return;
    }

    try {
      // Check if enumerateDevices is supported
      if (navigator.mediaDevices.enumerateDevices) {
        // Try to get a list of available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
          setCameraError('No camera devices found on this device.');
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
          return;
        } catch (defaultError) {
          console.error('Camera permission request failed:', defaultError);
          setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
        }
      }
    } catch (error) {
      console.error('Camera permission request failed:', error);
      setCameraError('Camera access denied. Please allow camera permissions to scan QR codes.');
    }
  };

  if (cameraError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header
          title="Scanner"
          showBackButton={true}
          backButtonAction={handleGoBack}
        />

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">دسترسی به دوربین الزامی است</h2>
            <p className="text-gray-600 mb-4">{cameraError}</p>
            <p className="text-sm text-gray-500 mb-4">لطفاً مجوز دسترسی به دوربین را برای ادامه اعطا کنید.</p>
            <button
              onClick={requestCameraPermission}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors mb-3"
            >
              درخواست دسترسی به دوربین
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              تازه‌سازی صفحه
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Custom header for scanner with different styling */}
      <header className="bg-black bg-opacity-50 text-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="text-indigo-300 hover:text-white font-medium"
          >
            → بازگشت
          </button>
          <h1 className="text-xl font-semibold">اسکن بلیت</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-indigo-300 hover:text-white"
          >
            خروج
          </button>
        </div>
      </header>

      {/* Show loading state initially, then check for client-side capabilities */}
      {!isClient ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری اسکنر...</p>
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
                <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
                  <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">دوربین پشتیبانی نمی‌شود</h2>
                  <p className="text-gray-600 mb-4">مرورگر شما از عملکرد دوربین پشتیبانی نمی‌کند.</p>
                  <p className="text-sm text-gray-500">از یک مرورگر مدرن مانند Chrome، Firefox یا Safari روی دستگاهی با دسترسی به دوربین استفاده کنید.</p>
                  <button
                    onClick={handleGoBack}
                    className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
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
                    torchOn ? 'bg-yellow-400' : 'bg-gray-800 bg-opacity-50'
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
                      className="px-4 py-2 bg-gray-800 bg-opacity-50 rounded-lg"
                    >
                      {cameraActive ? 'مکث' : 'ادامه'}
                    </button>
                  )}
                  <button
                    onClick={handleGoBack}
                    className="px-4 py-2 bg-indigo-600 rounded-lg"
                  >
                    بازگشت به رویدادها
                  </button>
                </div>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
}