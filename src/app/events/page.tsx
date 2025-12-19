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
import { CalendarIcon } from 'lucide-react';
import Image from 'next/image';

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
  const eventsPerPage = 15; // Updated to show 15 events per page

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  let currentEvents = allEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(allEvents.length / eventsPerPage);

  useEffect(() => {
    // Use current domain if websiteUrl is not available in store
    const currentWebsiteUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');

    if (!isLoggedIn || !token || !currentWebsiteUrl) {
      router.push('/login/');
      return;
    }

    const fetchEvents = async () => {
      try {
        setStoreLoading(true);

        // Use real service for normal operation
        // Get user_id from auth store
        const userId = useAuthStore.getState().user?.id || 0;

        // Debug logging
        console.log('Debug - Website URL:', currentWebsiteUrl);
        console.log('Debug - Token:', token ? 'Exists' : 'Missing');
        console.log('Debug - User ID:', userId);

        try {
          const response = await wordpressService.getEvents(currentWebsiteUrl, token, userId);
          console.log('Debug - API Response:', response);

          if (response.status === 'SUCCESS') {
            console.log('Debug - Setting events:', response.events);
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
    // Set loading state
    setLoadingEventId(event.event_id);

    // In a real app, you might want to set the selected event in the store
    // For now, we'll just pass the event ID to the scanner
    router.push(`/scan?eventId=${event.event_id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="w-5 h-5 rounded-sm" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Content */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {currentEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentEvents.map((event: Event) => (
                <Card
                  key={event.event_id}
                  className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${loadingEventId === event.event_id ? 'opacity-70' : ''}`}
                  onClick={() => handleEventSelect(event)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl line-clamp-2">{event.event_name}</CardTitle>
                      <div className="w-5 h-5 relative">
                        <Image
                          src="/ALogo.png"
                          alt="Event Logo"
                          fill
                          style={{ objectFit: 'contain' }}
                          className="rounded-sm"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        شناسه: {event.event_id}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingEventId === event.event_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventSelect(event);
                      }}
                    >
                      {loadingEventId === event.event_id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          در حال بارگذاری...
                        </>
                      ) : 'بررسی بلیت'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto">
                  {/* Previous button */}
                  <Button
                    onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className={`min-w-[80px] ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="صفحه قبلی"
                  >
                    قبلی
                  </Button>

                  {/* Page numbers with ellipsis for large number of pages */}
                  {totalPages <= 7 ? (
                    // Show all pages if there are 7 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-10 h-10 rounded-full"
                        aria-label={`صفحه ${page}`}
                      >
                        {page}
                      </Button>
                    ))
                  ) : (
                    // Show ellipsis for large number of pages
                    <>
                      <Button
                        onClick={() => handlePageChange(1)}
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        className="w-10 h-10 rounded-full"
                        aria-label="صفحه 1"
                      >
                        1
                      </Button>

                      {currentPage > 3 && <span className="flex items-center px-2 text-foreground">...</span>}

                      {currentPage > 2 && currentPage < totalPages - 1 && (
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          variant="outline"
                          size="sm"
                          className="w-10 h-10 rounded-full"
                          aria-label={`صفحه ${currentPage - 1}`}
                        >
                          {currentPage - 1}
                        </Button>
                      )}

                      {currentPage !== 1 && currentPage !== totalPages && (
                        <Button
                          key={currentPage}
                          onClick={() => handlePageChange(currentPage)}
                          variant="default"
                          size="sm"
                          className="w-10 h-10 rounded-full"
                          aria-label={`صفحه ${currentPage}`}
                        >
                          {currentPage}
                        </Button>
                      )}

                      {currentPage < totalPages - 1 && (
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          variant="outline"
                          size="sm"
                          className="w-10 h-10 rounded-full"
                          aria-label={`صفحه ${currentPage + 1}`}
                        >
                          {currentPage + 1}
                        </Button>
                      )}

                      {currentPage < totalPages - 2 && <span className="flex items-center px-2 text-foreground">...</span>}

                      <Button
                        onClick={() => handlePageChange(totalPages)}
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        className="w-10 h-10 rounded-full"
                        aria-label={`صفحه ${totalPages}`}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}

                  {/* Next button */}
                  <Button
                    onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className={`min-w-[80px] ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="صفحه بعدی"
                  >
                    بعدی
                  </Button>
                </div>

                {/* Page info */}
                <div className="mt-4 text-sm text-muted-foreground">
                  صفحه {currentPage} از {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Card className="max-w-md w-full text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg">هیچ رویدادی یافت نشد</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  در حال حاضر هیچ رویدادی در دسترس نیست. لطفاً بعداً دوباره بررسی کنید یا با مدیر سیستم تماس بگیرید.
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  onClick={() => typeof window !== 'undefined' && window.location.reload()}
                >
                  تازه‌سازی
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}