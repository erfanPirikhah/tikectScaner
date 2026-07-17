'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { useRouter, useSearchParams } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, TicketIcon, QrCode, CheckCircle2, Clock, Users, Eye, MapPin, Hash, BookOpen, Armchair, Calendar } from 'lucide-react';
import { toJalaali } from 'jalaali-js';
import TicketDetailsModal from '@/components/tickets/TicketDetailsModal';

interface Ticket {
  ticket_id: number;
  name_customer?: string;
  phone_customer?: string;
  seat?: string;
  ticket_type?: string;
  ticket_status?: string;
  checkin_time?: string;
  times_checked?: number;
  meta?: any;
}

// تابع تبدیل تایم‌استمپ به تاریخ و زمان شمسی
const formatCustomDate = (timestamp: string) => {
  if (!timestamp) return '-';
  const ts = parseInt(timestamp);
  if (isNaN(ts)) return '-';
  
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
    return '-';
  }
};

// کامپوننت اصلی که از useSearchParams استفاده می‌کند
function TicketsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const { token, websiteUrl, isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [stats, setStats] = useState({ total: 0, checked: 0, active: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token || !eventId) {
      router.push('/login/');
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const currentWebsiteUrl = websiteUrl || window.location.origin;
        const response = await wordpressService.getTickets(currentWebsiteUrl, token || undefined, parseInt(eventId), currentPage, 20);
        
        if (response.status === 'SUCCESS') {
          setTickets(response.tickets || []);
          setStats({
            total: response.total_items || 0,
            checked: response.total_checked || 0,
            active: response.total_active || 0
          });
          setTotalPages(response.total_pages || 1);
        } else {
          showToast.error(response.msg || 'دریافت بلیت‌ها ناموفق بود');
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        showToast.error('خطا در اتصال به سرور');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isLoggedIn, token, eventId, websiteUrl, router, currentPage]);

  const filteredTickets = tickets.filter(ticket => 
    ticket.name_customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_id?.toString().includes(searchTerm) ||
    ticket.phone_customer?.includes(searchTerm)
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* هدر صفحه */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.push('/events')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <TicketIcon className="w-6 h-6 text-primary" />
                لیست بلیت‌های رویداد
              </h1>
              <p className="text-sm text-muted-foreground mt-1">شناسه رویداد: {eventId}</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در این صفحه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button 
              variant="default" 
              onClick={() => router.push(`/scan?eventId=${eventId}`)}
              className="flex-shrink-0"
            >
              <QrCode className="ml-2 h-4 w-4" />
              اسکن QR
            </Button>
          </div>
        </div>

        {/* کارت‌های آماری */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="border-r-4 border-r-blue-500 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">کل بلیت‌ها</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/10 rounded-full">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-r-4 border-r-green-500 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">چک‌شده</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.checked}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-500/10 rounded-full">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-r-4 border-r-orange-500 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">فعال (باقی‌مانده)</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-500/10 rounded-full">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* لیست بلیت‌ها */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => {
              const meta = ticket.meta || {};
              const ticketId = meta.ova_mb_event_ticket_id?.[0] || ticket.ticket_id;
              const bookingId = meta.ova_mb_event_booking_id?.[0] || '-';
              const seat = meta.ova_mb_event_seat?.[0] || ticket.seat || 'ظرفیت آزاد';
              const dateStart = meta.ova_mb_event_date_start?.[0] ? formatCustomDate(meta.ova_mb_event_date_start[0]) : '-';
              const dateEnd = meta.ova_mb_event_date_end?.[0] ? formatCustomDate(meta.ova_mb_event_date_end[0]) : '-';
              
              const venueRaw = meta.ova_mb_event_venue?.[0];
              const addressRaw = meta.ova_mb_event_address?.[0];
              const venue = venueRaw && !venueRaw.startsWith('a:') ? venueRaw : (addressRaw || '-');

              return (
                <Card key={ticket.ticket_id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 border-r-4 border-r-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ticket.name_customer || 'نامشخص'}</CardTitle>
                        <CardDescription>شناسه: #{ticket.ticket_id}</CardDescription>
                      </div>
                      <Badge variant={ticket.ticket_status === 'checked' || ticket.times_checked ? 'destructive' : 'secondary'}>
                        {ticket.ticket_status === 'checked' || ticket.times_checked ? 'چک‌شده' : 'بررسی نشده'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm flex-grow">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> شماره بلیت:</span>
                      <span className="font-medium">{ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><BookOpen className="w-3 h-3" /> شماره رزرو:</span>
                      <span className="font-medium">{bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Armchair className="w-3 h-3" /> صندلی:</span>
                      <span className="font-medium">{seat}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-1 flex-shrink-0"><Calendar className="w-3 h-3" /> شروع:</span>
                      <span className="font-medium text-left text-xs">{dateStart}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-1 flex-shrink-0"><Calendar className="w-3 h-3" /> پایان:</span>
                      <span className="font-medium text-left text-xs">{dateEnd}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-1 flex-shrink-0"><MapPin className="w-3 h-3" /> مکان:</span>
                      <span className="font-medium text-left text-xs truncate">{venue}</span>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDetails(ticket.ticket_id)}
                    >
                      <Eye className="ml-2 h-4 w-4" />
                      مشاهده جزئیات
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/30 p-6 rounded-full mb-4">
              <TicketIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">بلیتی یافت نشد</h3>
            <p className="text-muted-foreground mb-6">برای این رویداد بلیتی ثبت نشده یا نتیجه جستجوی شما خالی است.</p>
          </div>
        )}

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto">
              <Button
                onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                variant="outline"
                className="min-w-[80px]"
              >
                قبلی
              </Button>

              <span className="flex items-center px-4 text-sm font-medium">
                صفحه {currentPage} از {totalPages}
              </span>

              <Button
                onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                variant="outline"
                className="min-w-[80px]"
              >
                بعدی
              </Button>
            </div>
          </div>
        )}
      </main>

      <TicketDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        ticketId={selectedTicketId} 
      />
    </div>
  );
}

// کامپوننت پیش‌فرض که در Suspense پیچیده شده است
export default function TicketsListPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">در حال بارگذاری...</div>}>
      <TicketsListContent />
    </Suspense>
  );
}