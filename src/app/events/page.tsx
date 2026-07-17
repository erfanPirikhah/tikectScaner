'use client';

import { useEffect, useState } from 'react';
import { useEventStore, useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TicketIcon, QrCode, Keyboard, Loader2, Search, BookOpen } from 'lucide-react';
import ManualSearchModal from '@/components/scan/ManualSearchModal';

// Define types for events
interface Event {
  event_id: number;
  event_name: string;
}

export default function Events() {
  const [loading, setLoading] = useState(true);

  const { events: allEvents, setEvents, setError: setStoreError, setLoading: setStoreLoading } = useEventStore();
  const { token, websiteUrl, isLoggedIn } = useAuthStore();
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12; // نمایش ۱۲ رویداد در هر صفحه برای گرید بهتر

  // Manual Search Modal State
  const [isManualSearchOpen, setIsManualSearchOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  let currentEvents = allEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(allEvents.length / eventsPerPage);

  useEffect(() => {
    const currentWebsiteUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');

    if (!isLoggedIn || !token || !currentWebsiteUrl) {
      router.push('/login/');
      return;
    }

    const fetchEvents = async () => {
      try {
        setStoreLoading(true);
        const userId = useAuthStore.getState().user?.id || 0;

        try {
          const response = await wordpressService.getEvents(currentWebsiteUrl, token, userId);

          if (response.status === 'SUCCESS') {
            setEvents(response.events || []);
            if (response.events && response.events.length === 0) {
              showToast.info('هیچ رویدادی یافت نشد');
            }
          } else {
            const errorMsg = response.msg || 'دریافت رویدادها ناموفق بود';
            showToast.error(errorMsg);
            setStoreError(errorMsg);
          }
        } catch (error) {
          console.error('Debug - API Error:', error);
          showToast.error('خطا در اتصال به سرور');
          return;
        }
      } catch (err) {
        console.error('خطا در دریافت رویدادها:', err);
        const errorMsg = 'عدم اتصال به سرور. لطفاً اتصال خود را بررسی کنید و آدرس وب‌سایت را تأیید کنید.';
        showToast.error(errorMsg);
        setStoreError(errorMsg);
      } finally {
        setStoreLoading(false);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isLoggedIn, token, websiteUrl, router, setEvents, setStoreError, setStoreLoading]);

  const [loadingEventId, setLoadingEventId] = useState<number | null>(null);

  const handleEventSelect = (event: Event) => {
    setLoadingEventId(event.event_id);
    router.push(`/scan?eventId=${event.event_id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSearchOpen = (event: Event) => {
    setSelectedEventId(event.event_id.toString());
    setIsManualSearchOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/10">
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
                <CardContent className="pb-3">
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <div className="flex gap-2 w-full">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-10 w-1/2" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary" />
            رویدادهای من
          </h1>
          <p className="text-muted-foreground mt-1">رویداد مورد نظر را برای اسکن، مدیریت بلیت‌ها یا جستجوی دستی انتخاب کنید.</p>
        </div>

        {currentEvents.length > 0 ? (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {currentEvents.map((event: Event) => (
                <Card 
                  key={event.event_id} 
                  className="group flex flex-col justify-between overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50"
                >
                  <CardHeader className="pb-4 relative">
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                      <TicketIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="pr-14">
                      <CardTitle className="text-lg leading-tight h-12 overflow-hidden">
                        {event.event_name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2 w-fit font-normal">
                        شناسه: {event.event_id}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow" />
                  
                  <CardFooter className="flex flex-col gap-2 bg-muted/30 p-4">
                    <Button
                      className="w-full"
                      disabled={loadingEventId === event.event_id}
                      onClick={() => handleEventSelect(event)}
                    >
                      {loadingEventId === event.event_id ? (
                        <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> در حال بارگذاری...</>
                      ) : (
                        <><QrCode className="ml-2 h-4 w-4" /> اسکن بلیت</>
                      )}
                    </Button>
                    <div className="grid grid-cols-3 w-full gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 px-2"
                        onClick={() => router.push(`/tickets?eventId=${event.event_id}`)}
                      >
                        <TicketIcon className="ml-1 h-4 w-4" /> بلیت‌ها
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 px-2"
                        onClick={() => router.push(`/bookings?eventId=${event.event_id}`)}
                      >
                        <BookOpen className="ml-1 h-4 w-4" /> رزروها
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 px-2"
                        onClick={() => handleManualSearchOpen(event)}
                      >
                        <Keyboard className="ml-1 h-4 w-4" /> جستجو
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto">
                  <Button
                    onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="min-w-[80px]"
                  >
                    قبلی
                  </Button>

                  {totalPages <= 7 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        className="w-10 h-10 rounded-lg"
                      >
                        {page}
                      </Button>
                    ))
                  ) : (
                    <>
                      <Button
                        onClick={() => handlePageChange(1)}
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="icon"
                        className="w-10 h-10 rounded-lg"
                      >
                        1
                      </Button>

                      {currentPage > 3 && <span className="flex items-center px-2 text-muted-foreground">...</span>}

                      {currentPage > 2 && currentPage < totalPages - 1 && (
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          variant="outline"
                          size="icon"
                          className="w-10 h-10 rounded-lg"
                        >
                          {currentPage - 1}
                        </Button>
                      )}

                      {currentPage !== 1 && currentPage !== totalPages && (
                        <Button
                          key={currentPage}
                          onClick={() => handlePageChange(currentPage)}
                          variant="default"
                          size="icon"
                          className="w-10 h-10 rounded-lg"
                        >
                          {currentPage}
                        </Button>
                      )}

                      {currentPage < totalPages - 1 && (
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          variant="outline"
                          size="icon"
                          className="w-10 h-10 rounded-lg"
                        >
                          {currentPage + 1}
                        </Button>
                      )}

                      {currentPage < totalPages - 2 && <span className="flex items-center px-2 text-muted-foreground">...</span>}

                      <Button
                        onClick={() => handlePageChange(totalPages)}
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="icon"
                        className="w-10 h-10 rounded-lg"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="min-w-[80px]"
                  >
                    بعدی
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  صفحه {currentPage} از {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <Card className="max-w-md w-full text-center border-dashed">
              <CardHeader>
                <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-xl">رویدادی یافت نشد</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  در حال حاضر هیچ رویدادی به شما اختصاص داده نشده است. لطفاً بعداً دوباره بررسی کنید.
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-center pb-6">
                <Button
                  variant="outline"
                  onClick={() => typeof window !== 'undefined' && window.location.reload()}
                >
                  تازه‌سازی صفحه
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      {/* Manual Search Modal */}
      <ManualSearchModal 
        isOpen={isManualSearchOpen} 
        onClose={() => setIsManualSearchOpen(false)} 
        eventId={selectedEventId} 
      />
    </div>
  );
}