'use client';

import { useEffect, useState } from 'react';
import { useEventStore, useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { mockWordPressService } from '@/services/mockService';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';

// Define types for events
interface Event {
  ID: number;
  post_title: string;
  post_content: string;
  event_date: string;
  status: string;
  featured_image?: string;
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
          response = await mockWordPressService.getEvents(websiteUrl, token);
        } else {
          // Use real service for normal operation
          response = await wordpressService.getEvents(websiteUrl, token);
        }

        if (response.status === 'SUCCESS') {
          // Add placeholder images to mock events for testing
          const eventsWithImages = response.events?.map((event: Event) => ({
            ...event,
            featured_image: event.featured_image || `/api/placeholder/400/200?text=${encodeURIComponent(event.post_title)}`,
          })) || [];
          setEvents(eventsWithImages);
        } else {
          setError(response.msg || 'Failed to fetch events');
          setStoreError(response.msg || 'Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to connect to server. Please check your connection and website URL.');
        setStoreError('Failed to connect to server');
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
    router.push(`/scan?eventId=${event.ID}`);
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
                  key={event.ID}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleEventSelect(event)}
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.featured_image || `/api/placeholder/400/200?text=${encodeURIComponent(event.post_title)}`}
                      alt={event.post_title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        // Fallback image if the original fails to load
                        (e.target as HTMLImageElement).src = `/api/placeholder/400/200?text=${encodeURIComponent(event.post_title)}`;
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-indigo-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date not specified'}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.post_title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.post_content}</p>

                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    Previous
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
                    Next
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
                Refresh
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}