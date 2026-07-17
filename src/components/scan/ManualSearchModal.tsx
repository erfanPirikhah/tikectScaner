'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, User, Phone, TicketIcon, Calendar, CheckCircle2 } from 'lucide-react';

interface ManualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onTicketValidated?: (qrCode: string) => void;
}

export default function ManualSearchModal({ isOpen, onClose, eventId, onTicketValidated }: ManualSearchModalProps) {
  const { token, websiteUrl } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showToast.error('لطفاً نام، موبایل یا شناسه بلیت را وارد کنید');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const currentWebsiteUrl = websiteUrl || window.location.origin;
      const response = await wordpressService.manualSearchTicket(currentWebsiteUrl, token ||undefined, parseInt(eventId), searchTerm);
      
      if (response.status === 'SUCCESS') {
        setTickets(response.tickets || []);
        if (response.tickets.length === 0) {
          showToast.info('بلیتی با این مشخصات یافت نشد');
        }
      } else {
        showToast.error(response.msg || 'خطا در جستجو');
        setTickets([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast.error('خطا در ارتباط با سرور');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckin = async (ticket: any) => {
    if (!ticket.qr_code) {
      showToast.error('کد QR برای این بلیت یافت نشد');
      return;
    }

    setLoading(true);
    try {
      const currentWebsiteUrl = websiteUrl || window.location.origin;
      // استفاده از متد اعتبارسنجی اصلی با QR کد دریافتی از جستجو
      const response = await wordpressService.validateTicket(currentWebsiteUrl, {
        event_id: parseInt(eventId),
        qr_code: ticket.qr_code,
        token: token!,
      }, useAuthStore.getState().user?.id);

      // متغیر برای پخش صدا
      let audio: HTMLAudioElement;

      if (response.status === 'SUCCESS') {
        audio = new Audio('/pwa/ring/ok.mp3');
        showToast.success('بلیت با موفقیت تایید شد');
        
        // به‌روزرسانی وضعیت بلیت در لیست جستجو (تا دکمه غیرفعال شود)
        setTickets(prevTickets => prevTickets.map(t => 
          t.ticket_id === ticket.ticket_id 
            ? { ...t, ticket_status: 'checked', times_checked: (t.times_checked || 0) + 1 } 
            : t
        ));

        if (onTicketValidated) {
          onTicketValidated(ticket.qr_code);
        }
        
        // بستن مودال پس از ۱.۵ ثانیه تا صدا کامل پخش شود
        setTimeout(() => handleClose(), 1500);
      } else {
        audio = new Audio('/pwa/ring/bad.mp3');
        showToast.error(response.msg || 'اعتبارسنجی ناموفق بود');
      }

      // پخش صدا
      audio.play().catch(error => console.error('Error playing sound:', error));

    } catch (error) {
      // پخش صدا در صورت خطای کلی
      const audio = new Audio('/pwa/ring/bad.mp3');
      audio.play().catch(e => console.error('Error playing sound:', e));
      
      showToast.error('خطا در اعتبارسنجی');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setTickets([]);
    setHasSearched(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            جستجوی دستی بلیت
          </DialogTitle>
          <DialogDescription>
            در صورت خرابی QR کد، می‌توانید با نام، موبایل یا شناسه بلیت را جستجو کنید.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="نام، موبایل یا شناسه..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              dir="rtl"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* نتایج جستجو */}
          <div className="space-y-3 mt-2">
            {tickets.map((ticket) => (
              <Card key={ticket.ticket_id} className="border-r-4 border-r-primary/60 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {ticket.name_customer || 'نامشخص'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <TicketIcon className="w-3 h-3" />
                        شناسه: #{ticket.ticket_id}
                      </p>
                    </div>
                    <Badge variant={ticket.ticket_status === 'checked' || ticket.times_checked ? 'destructive' : 'secondary'}>
                      {ticket.ticket_status === 'checked' || ticket.times_checked ? 'چک‌شده' : 'برنشکسته'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    {ticket.phone_customer && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span dir="ltr">{ticket.phone_customer}</span>
                      </div>
                    )}
                    {ticket.seat && (
                      <div className="flex items-center gap-2">
                        <TicketIcon className="w-3 h-3 text-muted-foreground" />
                        <span>صندلی: {ticket.seat}</span>
                      </div>
                    )}
                    {ticket.event_date_start && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>تاریخ: {ticket.event_date_start}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-2" 
                    size="sm"
                    onClick={() => handleManualCheckin(ticket)}
                    disabled={loading || ticket.ticket_status === 'checked' || ticket.times_checked > 0}
                  >
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    تایید ورود (Check-in)
                  </Button>
                </CardContent>
              </Card>
            ))}

            {hasSearched && !loading && tickets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>نتیجه‌ای یافت نشد</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>بستن</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}