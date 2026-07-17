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
import { User, Phone, Mail, CreditCard, Calendar, TicketIcon } from 'lucide-react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number | null;
}

export default function BookingDetailsModal({ isOpen, onClose, bookingId }: BookingDetailsModalProps) {
  const { token, websiteUrl } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      const fetchDetails = async () => {
        setLoading(true);
        setBooking(null);
        try {
          const currentWebsiteUrl = websiteUrl || window.location.origin;
          const response = await wordpressService.getBookingDetails(currentWebsiteUrl, token || undefined, bookingId);
          
          if (response.status === 'SUCCESS') {
            setBooking(response.booking);
          } else {
            showToast.error(response.msg || 'خطا در دریافت جزئیات رزرو');
          }
        } catch (error) {
          console.error('Error fetching booking details:', error);
          showToast.error('خطا در ارتباط با سرور');
        } finally {
          setLoading(false);
        }
      };

      fetchDetails();
    }
  }, [isOpen, bookingId, token, websiteUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-primary" />
            جزئیات رزرو
          </DialogTitle>
          <DialogDescription>
            شناسه رزرو: #{bookingId}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : booking ? (
          <div className="space-y-6 py-4">
            {/* اطلاعات مشتری */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">اطلاعات مشتری</h3>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">نام و نام خانوادگی</p>
                  {/* استخراج از متا */}
                  <p className="font-medium">{booking.meta?.ova_mb_event_name?.[0] || 'نامشخص'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">شماره موبایل</p>
                  {/* استخراج از متا */}
                  <p className="font-medium" dir="ltr">{booking.meta?.ova_mb_event_phone?.[0] || 'نامشخص'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ایمیل</p>
                  {/* استخراج از متا */}
                  <p className="font-medium truncate max-w-[300px]" dir="ltr">{booking.meta?.ova_mb_event_email?.[0] || 'نامشخص'}</p>
                </div>
              </div>
            </div>

            {/* اطلاعات رویداد و پرداخت */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">اطلاعات رویداد و پرداخت</h3>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">نام رویداد</p>
                  {/* استخراج از متا */}
                  <p className="font-medium">{booking.meta?.ova_mb_event_title_event?.[0] || 'نامشخص'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاریخ رویداد</p>
                  {/* استخراج از متا */}
                  <p className="font-medium">{booking.meta?.ova_mb_event_date_cal?.[0] || 'نامشخص'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">روش پرداخت</p>
                  {/* استخراج از متا */}
                  <p className="font-medium">{booking.meta?.ova_mb_event_payment_method?.[0] || 'نامشخص'}</p>
                </div>
              </div>
            </div>

            {/* وضعیت رزرو */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm font-medium">وضعیت رزرو:</span>
              <Badge variant={booking.status === 'Completed' ? 'secondary' : 'destructive'}>
                {booking.status === 'Completed' ? 'تکمیل شده' : booking.status || 'نامشخص'}
              </Badge>
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