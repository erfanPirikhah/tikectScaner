'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
      router.push('/login');
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
    router.push('/scan?eventId=' + new URLSearchParams(window.location.search).get('eventId'));
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
                    <span className="mr-2 text-foreground">{time}</span>
                  </div>
                )}
                {eCal && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">تاریخ رویداد:</span>
                    <span className="mr-2 text-foreground">{eCal}</span>
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