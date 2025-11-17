'use client';

import { useEffect, useState } from 'react';
import { useEventStore, useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { mockWordPressService } from '@/services/mockService';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';

// Define types for events
interface Event {
  event_id: number;
  event_name: string;
}

export default function Events() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);

        // Check if we're in test mode
        const isTestMode = websiteUrl === 'http://test.local' ||
                          websiteUrl.toLowerCase().includes('mock') ||
                          token === 'test_mode_token';

        let response;
        if (isTestMode) {
          // Use mock service for test mode
          response = await mockWordPressService.getEvents(websiteUrl, token, 1); // Use mock user_id
        } else {
          // Use real service for normal operation
          // Get user_id from auth store
          const userId = useAuthStore.getState().user?.id || 0;

          // Debug logging
          console.log('Debug - Website URL:', websiteUrl);
          console.log('Debug - Token:', token ? 'Exists' : 'Missing');
          console.log('Debug - User ID:', userId);

          try {
            response = await wordpressService.getEvents(websiteUrl, token, userId);
            console.log('Debug - API Response:', response);
          } catch (error) {
            console.error('Debug - API Error:', error);
            setError('خطا در اتصال به سرور');
            return;
          }
        }

        if (response.status === 'SUCCESS') {
          console.log('Debug - Setting events:', response.events);
          setEvents(response.events || []);
        } else {
          setError(response.msg || 'دریافت رویدادها ناموفق بود');
          setStoreError(response.msg || 'دریافت رویدادها ناموفق بود');
        }
      } catch (err) {
        console.error('خطا در دریافت رویدادها:', err);
        setError('عدم اتصال به سرور. لطفاً اتصال خود را بررسی کنید و آدرس وب‌سایت را تأیید کنید.');
        setStoreError('عدم اتصال به سرور');
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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Header title="Events" />

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Header title="Events" />

      {/* Content */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {currentEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEvents.map((event: Event) => (
                <div
                  key={event.event_id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleEventSelect(event)}
                >
                  {/* Event Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{event.event_name}</h2>

                    <div className="flex justify-between items-center mt-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        ID: {event.event_id}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
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
              <div className="mt-8 flex justify-center items-center">
                <div className="flex space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    قبلی
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-full ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-indigo-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
              <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-4">There are currently no events available. Please check back later or contact your administrator.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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