'use client';

import { useEffect, useState } from 'react';
import { useEventStore, useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { mockWordPressService } from '@/services/mockService';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import { showToast } from '@/lib/toast';

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
  const eventsPerPage = 6; // Number of events to show per page

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = allEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(allEvents.length / eventsPerPage);

  useEffect(() => {
    if (!isLoggedIn || !token || !websiteUrl) {
      router.push('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        setStoreLoading(true);

        // Use real service for normal operation
        // Get user_id from auth store
        const userId = useAuthStore.getState().user?.id || 0;

        // Debug logging
        console.log('Debug - Website URL:', websiteUrl);
        console.log('Debug - Token:', token ? 'Exists' : 'Missing');
        console.log('Debug - User ID:', userId);

        try {
          const response = await wordpressService.getEvents(websiteUrl, token, userId);
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

  const handleEventSelect = (event: Event) => {
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
      <div className="flex flex-col min-h-screen bg-gradient-secondary">
        <Header title="رویدادها" />

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-secondary">در حال بارگذاری رویدادها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="رویدادها" />

      {/* Content */}
      <main className="flex-1 py-6 px-4">
        {currentEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEvents.map((event: Event) => (
                <div
                  key={event.event_id}
                  className="card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                  onClick={() => handleEventSelect(event)}
                >
                  {/* Event Content */}
                  <div className="p-5 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 line-clamp-2">{event.event_name}</h2>

                    <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
                      <span className="badge badge-info text-xs">
                        شناسه: {event.event_id}
                      </span>
                      <button
                        className="btn btn-outline text-xs sm:text-sm flex items-center py-2 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventSelect(event);
                        }}
                      >
                        مشاهده جزئیات
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`btn ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} min-w-[80px]`}
                    aria-label="صفحه قبلی"
                  >
                    قبلی
                  </button>

                  {/* Page numbers with ellipsis for large number of pages */}
                  {totalPages <= 7 ? (
                    // Show all pages if there are 7 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'btn-outline'
                        }`}
                        aria-label={`صفحه ${page}`}
                      >
                        {page}
                      </button>
                    ))
                  ) : (
                    // Show ellipsis for large number of pages
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentPage === 1
                            ? 'bg-primary text-white'
                            : 'btn-outline'
                        }`}
                        aria-label="صفحه 1"
                      >
                        1
                      </button>

                      {currentPage > 3 && <span className="flex items-center px-2 text-foreground">...</span>}

                      {currentPage > 2 && currentPage < totalPages - 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center btn-outline flex-shrink-0"
                          aria-label={`صفحه ${currentPage - 1}`}
                        >
                          {currentPage - 1}
                        </button>
                      )}

                      {currentPage !== 1 && currentPage !== totalPages && (
                        <button
                          key={currentPage}
                          onClick={() => handlePageChange(currentPage)}
                          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"
                          aria-label={`صفحه ${currentPage}`}
                        >
                          {currentPage}
                        </button>
                      )}

                      {currentPage < totalPages - 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center btn-outline flex-shrink-0"
                          aria-label={`صفحه ${currentPage + 1}`}
                        >
                          {currentPage + 1}
                        </button>
                      )}

                      {currentPage < totalPages - 2 && <span className="flex items-center px-2 text-foreground">...</span>}

                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentPage === totalPages
                            ? 'bg-primary text-white'
                            : 'btn-outline'
                        }`}
                        aria-label={`صفحه ${totalPages}`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`btn ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} min-w-[80px]`}
                    aria-label="صفحه بعدی"
                  >
                    بعدی
                  </button>
                </div>

                {/* Page info */}
                <div className="mt-4 text-sm text-secondary">
                  صفحه {currentPage} از {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="card p-8 max-w-md w-full text-center">
              <div className="mx-auto bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">هیچ رویدادی یافت نشد</h3>
              <p className="text-secondary mb-4">در حال حاضر هیچ رویدادی در دسترس نیست. لطفاً بعداً دوباره بررسی کنید یا با مدیر سیستم تماس بگیرید.</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                تازه‌سازی
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}