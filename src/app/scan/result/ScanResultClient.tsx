'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Function to convert Arabic/Persian digits to English digits
const normalizeDigits = (str: string): string => {
  if (!str) return str;
  return str.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (char) => {
    const arabicDigit = '\u0660-\u0669';
    const persianDigit = '\u06F0-\u06F9';
    const codePoint = char.codePointAt(0);
    if (codePoint && codePoint >= 0x0660 && codePoint <= 0x0669) {
      // Arabic digits (U+0660 to U+0669)
      return String.fromCharCode(codePoint - 0x0660 + 0x0030);
    } else if (codePoint && codePoint >= 0x06F0 && codePoint <= 0x06F9) {
      // Persian digits (U+06F0 to U+06F9)
      return String.fromCharCode(codePoint - 0x06F0 + 0x0030);
    }
    return char;
  });
};

// Function to format date and time strings to Persian format
const formatDate = (dateStr: string): string => {
  try {
    if (!dateStr) return '';

    // Normalize digits first
    const cleanStr = normalizeDigits(dateStr);

    // For ISO strings, parse and format them
    if (cleanStr.includes('T')) {
      const date = new Date(cleanStr);
      if (isNaN(date.getTime())) return dateStr; // If parsing fails, return original string

      // Format to YYYY/MM/DD HH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    // If it's already in a known format, return as is
    return cleanStr;
  } catch (error) {
    return dateStr;
  }
};

export default function ScanResultClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('msg') || '';
  const name = searchParams.get('name') || '';
  const seat = searchParams.get('seat') || '';
  const time = searchParams.get('time') || '';
  const eventId = searchParams.get('eventId') || '';
  const ticketId = searchParams.get('ticket_id') || '';
  const eCal = searchParams.get('e_cal') || '';
  const ticketStatus = searchParams.get('ticket_status') || '';
  const msgShow = searchParams.get('msg_show') || '';
  const nameEvent = searchParams.get('name_event') || '';
  const extraService = searchParams.get('extra_service') || '';
  const ticketType = searchParams.get('ticket_type') || '';
  const betweenDate = searchParams.get('between_date') || '';
  const timesChecked = searchParams.get('times_checked') || '';
  const checksRemaining = searchParams.get('checks_remaining') || '';

  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login/');
      return;
    }

    if (status !== 'SUCCESS' && status !== 'FAIL') {
      router.push('/events');
      return;
    }
  }, [status, isLoggedIn, router]);

  const handleGoBack = () => {
    router.push('/events');
  };

  const handleScanAnother = () => {
    if (typeof window !== 'undefined') {
      router.push('/scan?eventId=' + new URLSearchParams(window.location.search).get('eventId'));
    } else {
      // Fallback behavior if window is not available
      router.push('/scan');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="نتیجه اسکن"
        showBackButton={true}
        backButtonAction={handleGoBack}
      />

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center">
            {/* Status icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className={`text-4xl ${status === 'SUCCESS' ? 'text-success' : 'text-error'}`}>
                {status === 'SUCCESS' ? '✓' : '✕'}
              </span>
            </div>

            {/* Status text */}
            <CardTitle className={`${status === 'SUCCESS' ? 'text-success' : 'text-error'}`}>
              {status === 'SUCCESS' ?
                (msgShow ? msgShow : (ticketStatus === 'checked' ? 'بلیت با موفقیت چک شد' : 'بلیت معتبر')) :
                'بلیت نامعتبر'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-foreground mb-6">{message}</p>

            {/* Ticket details */}
            {(name || seat || time || ticketId || nameEvent || ticketType || extraService || eCal || ticketStatus || timesChecked || checksRemaining || betweenDate) && (
              <div className="space-y-2 text-right mb-6">
                {nameEvent && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">نام رویداد:</span>
                    <span className="mr-2 text-foreground">{nameEvent}</span>
                  </div>
                )}
                {ticketType && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">نوع بلیت:</span>
                    <span className="mr-2 text-foreground">{ticketType}</span>
                  </div>
                )}
                {name && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">نام:</span>
                    <span className="mr-2 text-foreground">{name}</span>
                  </div>
                )}
                {seat && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">صندلی:</span>
                    <span className="mr-2 text-foreground">{seat}</span>
                  </div>
                )}
                {ticketId && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">شماره بلیت:</span>
                    <span className="mr-2 text-foreground">#{ticketId}</span>
                  </div>
                )}
                {time && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">زمان چک‌این:</span>
                    <span className="mr-2 text-foreground">{formatDate(time)}</span>
                  </div>
                )}
                {eCal && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">تاریخ رویداد:</span>
                    <span className="mr-2 text-foreground">{formatDate(eCal)}</span>
                  </div>
                )}
                {ticketStatus && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">وضعیت بلیت:</span>
                    <span className="mr-2 text-foreground">{ticketStatus}</span>
                  </div>
                )}
                {timesChecked && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">دفعات چک شده:</span>
                    <span className="mr-2 text-foreground">{timesChecked}</span>
                  </div>
                )}
                {checksRemaining && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">تعداد باقی‌مانده چک:</span>
                    <span className="mr-2 text-foreground">{checksRemaining}</span>
                  </div>
                )}
                {betweenDate && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">تعداد روزهای باقی مانده:</span>
                    <span className="mr-2 text-foreground">{betweenDate}</span>
                  </div>
                )}
                {extraService && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">سرویس اضافی:</span>
                    <span className="mr-2 text-foreground">{extraService}</span>
                  </div>
                )}
                {msgShow && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">پیام:</span>
                    <span className="mr-2 text-foreground">{msgShow}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={handleScanAnother}
              className="w-full"
            >
              اسکن بلیت دیگر
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full"
            >
              بازگشت به رویدادها
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}