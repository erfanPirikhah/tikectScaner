'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { useRouter, useSearchParams } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, BookOpen, Eye } from 'lucide-react';
import BookingDetailsModal from '@/components/bookings/BookingDetailsModal';

interface Booking {
  booking_id: number;
  event_id: string;
  title: string;
  status: string;
  customer_id: string;
  phone: string;
  email: string;
  meta: {
    ova_mb_event_name?: string[];
    ova_mb_event_first_name?: string[];
    ova_mb_event_last_name?: string[];
  };
}

export default function BookingsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const { token, websiteUrl, isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State for Modal
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token || !eventId) {
      router.push('/login/');
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const currentWebsiteUrl = websiteUrl || window.location.origin;
        const response = await wordpressService.getBookings(currentWebsiteUrl, token, parseInt(eventId), currentPage, 20);
        
        if (response.status === 'SUCCESS') {
          setBookings(response.bookings || []);
          setTotalPages(response.total_pages || 1);
          setTotalItems(response.total_items || 0);
        } else {
          showToast.error(response.msg || 'دریافت رزروها ناموفق بود');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        showToast.error('خطا در اتصال به سرور');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isLoggedIn, token, eventId, websiteUrl, router, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* هدر صفحه + دکمه بازگشت بالا */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.push('/events')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                لیست رزروهای رویداد
              </h1>
              <p className="text-sm text-muted-foreground mt-1">شناسه رویداد: {eventId} | مجموع رزروها: {totalItems}</p>
            </div>
          </div>
        </div>

        {/* لیست رزروها */}
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
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking) => (
              <Card key={booking.booking_id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 border-r-4 border-r-indigo-500/70">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.meta?.ova_mb_event_name?.[0] || 'نامشخص'}
                      </CardTitle>
                      <CardDescription>شناسه رزرو: #{booking.booking_id}</CardDescription>
                    </div>
                    <Badge variant={booking.status === 'Completed' ? 'secondary' : 'destructive'}>
                      {booking.status === 'Completed' ? 'تکمیل شده' : booking.status || 'نامشخص'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm flex-grow">
                  {booking.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">موبایل:</span>
                      <span className="font-medium" dir="ltr">{booking.phone}</span>
                    </div>
                  )}
                  {booking.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ایمیل:</span>
                      <span className="font-medium truncate max-w-[150px]" dir="ltr">{booking.email}</span>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewDetails(booking.booking_id)}
                  >
                    <Eye className="ml-2 h-4 w-4" />
                    مشاهده جزئیات
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/30 p-6 rounded-full mb-4">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">رزروی یافت نشد</h3>
            <p className="text-muted-foreground mb-6">برای این رویداد رزروی ثبت نشده است.</p>
          </div>
        )}

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
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

      {/* Booking Details Modal */}
      <BookingDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        bookingId={selectedBookingId} 
      />
    </div>
  );
}