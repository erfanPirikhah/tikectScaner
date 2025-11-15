'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import { wordpressService } from '@/services/wordpress';
import { mockWordPressService } from '@/services/mockService';

export default function Profile() {
  const { user, isLoggedIn, logout, websiteUrl } = useAuthStore();
  const router = useRouter();

  if (!isLoggedIn) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    if (websiteUrl && useAuthStore.getState().token) {
      try {
        // Check if we're in test mode
        const isTestMode = websiteUrl === 'http://test.local' ||
                          websiteUrl.toLowerCase().includes('mock') ||
                          useAuthStore.getState().token === 'test_mode_token';

        if (isTestMode) {
          // Use mock service for test mode
          await mockWordPressService.logout(websiteUrl, { token: useAuthStore.getState().token! });
        } else {
          // Use real service for normal operation
          await wordpressService.logout(websiteUrl, { token: useAuthStore.getState().token! });
        }
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with local logout even if API call fails
      }
    }
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Profile" />

      {/* Content */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                <p className="mt-1 text-sm text-gray-900 break-all">{useAuthStore.getState().websiteUrl || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}