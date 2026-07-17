'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { showToast } from '@/lib/toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, TicketIcon, Clock, MapPin, Hash, Armchair, BookOpen } from 'lucide-react';
import { toJalaali } from 'jalaali-js';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number | null;
}

const formatCustomDate = (timestamp: string) => {
  if (!timestamp) return 'نامشخص';
  const ts = parseInt(timestamp);
  if (isNaN(ts)) return 'نامشخص';
  
  try {
    const date = new Date(ts * 1000);
    const adjustedDate = new Date(date.getTime() + (3.5 * 3600000));
    const jalaaliDate = toJalaali(adjustedDate);
    const hours = String(adjustedDate.getUTCHours()).padStart(2, '0');
    const minutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
    
    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    const monthName = persianMonths[jalaaliDate.jm - 1];
    
    return `${jalaaliDate.jd} ${monthName} ${jalaaliDate.jy} - ${hours}:${minutes}`;
  } catch (e) {
    return 'نامشخص';
  }
};

export default function TicketDetailsModal({ isOpen, onClose, ticketId }: TicketDetailsModalProps) {
  const { token, websiteUrl } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && ticketId) {
      const fetchDetails = async () => {
        setLoading(true);
        setTicketData(null);
        try {
          const currentWebsiteUrl = websiteUrl || window.location.origin;
          const response = await wordpressService.getTicketDetails(currentWebsiteUrl, token, ticketId);
          
          if (response.status === 'SUCCESS') {
            setTicketData(response.ticket);
          } else {
            showToast.error(response.msg || 'خطا در دریافت جزئیات بلیت');
          }
        } catch (error) {
          console.error('Error fetching ticket details:', error);
          showToast.error('خطا در ارتباط با سرور');
        } finally {
          setLoading(false);
        }
      };

      fetchDetails();
    }
  }, [isOpen, ticketId, token, websiteUrl]);

  const meta = ticketData?.meta || {};
  const details = ticketData?.details || {};

  const venueRaw = meta.ova_mb_event_venue?.[0];
  const addressRaw = meta.ova_mb_event_address?.[0];
  const venue = venueRaw && !venueRaw.startsWith('a:') ? venueRaw : (addressRaw || 'نامشخص');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-primary" />
            جزئیات بلیت
          </DialogTitle>
          <DialogDescription>
            شناسه بلیت: #{ticketId}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : ticketData ? (
          <div className="space-y-6 py-4">
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">اطلاعات مشتری</h3>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">نام و نام خانوادگی</p>
                  <p className="font-medium">{details.name_customer || meta.ova_mb_event_name_customer?.[0] || 'نامشخص'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">اطلاعات بلیت و رزرو</h3>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">شماره بلیت</p>
                  <p className="font-medium">{meta.ova_mb_event_ticket_id?.[0] || ticketData.ticket_id || 'نامشخص'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">شماره رزرو</p>
                  <p className="font-medium">{meta.ova_mb_event_booking_id?.[0] || 'نامشخص'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Armchair className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">شماره صندلی</p>
                  <p className="font-medium">{meta.ova_mb_event_seat?.[0] || details.seat || 'بدون صندلی'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">زمان و مکان برگزاری</h3>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاریخ شروع برنامه</p>
                  <p className="font-medium text-sm">{formatCustomDate(meta.ova_mb_event_date_start?.[0])}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاریخ پایان برنامه</p>
                  <p className="font-medium text-sm">{formatCustomDate(meta.ova_mb_event_date_end?.[0])}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">آدرس برگزاری</p>
                  <p className="font-medium text-sm">{venue}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">وضعیت چک‌این</h3>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">وضعیت:</span>
                  <Badge variant={details.times_checked > 0 ? 'destructive' : 'secondary'}>
                    {details.times_checked > 0 ? `چک‌شده (${details.times_checked} بار)` : 'بررسی نشده'}
                  </Badge>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            اطلاعاتی برای نمایش یافت نشد.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}