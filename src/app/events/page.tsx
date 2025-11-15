'use client';

import { useEffect, useState } from 'react';
import { useEventStore, useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { mockWordPressService } from '@/services/mockService';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';

export default function Events() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { events, setEvents, setError: setStoreError, setLoading: setStoreLoading } = useEventStore();
  const { token, websiteUrl, isLoggedIn } = useAuthStore();
  const router = useRouter();

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
          setEvents(response.events || []);
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

  const handleEventSelect = (event: any) => {
    // In a real app, you might want to set the selected event in the store
    // For now, we'll just pass the event ID to the scanner
    router.push(`/scan?eventId=${event.ID}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Events" />

      {/* Content */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.ID}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEventSelect(event)}
              >
                <h2 className="font-semibold text-gray-900">{event.post_title}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.post_content}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date not specified'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No events found</div>
              <p className="text-sm text-gray-600">Contact your administrator to create events</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}