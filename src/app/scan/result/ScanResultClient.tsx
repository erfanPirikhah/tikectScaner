'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toJalaali } from 'jalaali-js';

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

// Function to format date and time strings to Persian (Shamsi) format
const formatDate = (dateStr: string): string => {
  try {
    if (!dateStr) return '';
    // Normalize digits first
    const cleanStr = normalizeDigits(dateStr);

    // Handle ISO format (YYYY-MM-DDTHH:mm:ss)
    if (cleanStr.includes('T')) {

      const date = new Date(cleanStr);
      console.log('===>',date)

      if (isNaN(date.getTime())) return dateStr; // If parsing fails, return original string

      // Add 3.5 hours to the time
      const adjustedDate = new Date(date.getTime() + (3.5 * 3600000)); // Add 3.5 hours

      // Convert to Jalaali (Persian) calendar
      const jalaaliDate = toJalaali(adjustedDate);

      const year = jalaaliDate.jy;
      const month = jalaaliDate.jm;
      const day = jalaaliDate.jd;
      const hours = String(adjustedDate.getHours()).padStart(2, '0');
      const minutes = String(adjustedDate.getMinutes()).padStart(2, '0');

      // Month names in Persian
      const persianMonths = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
      ];

      const monthName = persianMonths[month - 1];

      return `${day} ${monthName} ${year} ${hours}:${minutes}`;
    }

    // Handle the Persian date format "Month dd, yyyy h:mm a" and ranges like "Month dd, yyyy h:mm a-h:mm a"
    // Example: "نوامبر 17, 2025 7:28 ب.ظ" or "سپتامبر 28, 2028 6:45 ب.ظ-8:00 ب.ظ"
    const persianDateRegex = /([^\d\s]+) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2})/;
    const match = cleanStr.match(persianDateRegex);

    if (match) {
      const [, monthStr, day, year, hour, minute] = match;
      const hourNum = parseInt(hour);
      let hour24 = hourNum;

      // Handle AM/PM
      if (cleanStr.includes('PM') && hourNum < 12) {
        hour24 = hourNum + 12;
      } else if (cleanStr.includes('AM') && hourNum === 12) {
        hour24 = 0;
      } else if (cleanStr.includes('ب.ظ') && hourNum < 12) {
        hour24 = hourNum + 12;
      } else if (cleanStr.includes('ق.ظ') && hourNum === 12) {
        hour24 = 0;
      }

      // Map Persian month names to indices
      const persianMonthMap: { [key: string]: number } = {
        'ژانویه': 0, 'فوریه': 1, 'مارس': 2, 'آوریل': 3,
        'می': 4, 'ژوئن': 5, 'جولای': 6, 'آگوست': 7,
        'سپتامبر': 8, 'اکتبر': 9, 'نوامبر': 10, 'دسامبر': 11,
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
      };

      const monthIndex = persianMonthMap[monthStr.trim()];
      if (monthIndex !== undefined) {
        const date = new Date(parseInt(year), monthIndex, parseInt(day), hour24, parseInt(minute));

        // Add 3.5 hours to the time
        const adjustedDate = new Date(date.getTime() + (3.5 * 3600000)); // Add 3.5 hours

        // Convert to Jalaali (Persian) calendar
        const jalaaliDate = toJalaali(adjustedDate);

        const jYear = jalaaliDate.jy;
        const jMonth = jalaaliDate.jm;
        const jDay = jalaaliDate.jd;

        // Month names in Persian
        const persianMonths = [
          'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
          'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];

        const monthName = persianMonths[jMonth - 1];

        // Check if it's a time range (like "6:45 PM-8:00 PM" or "6:45 ب.ظ-8:00 ب.ظ")
        const timeRangeMatch = cleanStr.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
        if (timeRangeMatch && timeRangeMatch[1] && timeRangeMatch[2] && timeRangeMatch[3] && timeRangeMatch[4]) {
          // Full time range like "h:mm-h:mm"
          return `${jDay} ${monthName} ${jYear} ${timeRangeMatch[1]}:${timeRangeMatch[2]}-${timeRangeMatch[3]}:${timeRangeMatch[4]}`;
        }

        return `${jDay} ${monthName} ${jYear} ${String(adjustedDate.getHours()).padStart(2, '0')}:${minute}`;
      }
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
      {/* <Header
        title="نتیجه اسکن"
        showBackButton={true}
        backButtonAction={handleGoBack}
      /> */}

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center">
            {/* Status icon */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${status === 'SUCCESS' ? 'bg-green-600' : 'bg-red-600'}`}>
              {status === 'SUCCESS' ? (
                <img
                  src="/icons/scan/Ok.png"
                  alt="تایید"
                  width={80}
                  height={80}
                  className="w-20 h-20"
                />
              ) : (
                <img
                  src="/icons/scan/Not.png"
                  alt="رد"
                  width={80}
                  height={80}
                  className="w-20 h-20"
                />
              )}
            </div>

            {/* Status text */}
            <CardTitle className={`${status === 'SUCCESS' ? 'text-success' : 'text-error'}`}>
              {status === 'SUCCESS' ? 'تایید شد، بلیت معتبر است.' : 'بلیت نامعتبر'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            {/* <p className="text-foreground mb-6">{message}</p> */}

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