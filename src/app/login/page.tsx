'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockWordPressService } from '@/services/mockService';
import { storageService } from '@/services/storage';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!username.trim()) {
      setError('نام کاربری الزامی است');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('رمز عبور الزامی است');
      setLoading(false);
      return;
    }

    if (!websiteUrl.trim()) {
      setError('آدرس وب‌سایت الزامی است');
      setLoading(false);
      return;
    }

    // Ensure URL ends with a slash
    const normalizedUrl = websiteUrl.endsWith('/') ? websiteUrl : `${websiteUrl}/`;

    try {
      const result = await login(username, password, normalizedUrl);

      if (result.success) {
        router.push('/events');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">اسکنر بلیت</h1>
          <p className="text-gray-600 mt-2">ورود به حساب کاربری</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
              آدرس وب‌سایت
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              آدرس سایت وردپرس خود را وارد کنید یا برای حالت تست از "http://test.local" استفاده کنید
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              نام کاربری
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                در حال ورود...
              </div>
            ) : (
              'ورود'
            )}
          </button>

          <div className="mt-4">
            <button
              type="button"
              onClick={async () => {
                try {
                  // Directly use the mock service to login with test credentials
                  const mockResponse = await mockWordPressService.login({
                    username: 'testuser',
                    password: 'password123',
                  }, 'http://test.local');

                  if (mockResponse.status === 'SUCCESS' && mockResponse.token) {
                    // Store the website URL and token
                    storageService.setWebsiteUrl('http://test.local');
                    storageService.setToken(mockResponse.token);

                    // Update the auth store directly
                    const testUser = mockResponse.user || {
                      id: 1,
                      name: 'کاربر تست',
                      email: 'test@example.com'
                    };

                    useAuthStore.getState().login(
                      testUser,
                      mockResponse.token,
                      'http://test.local'
                    );

                    // Redirect to events page
                    router.push('/events');
                  }
                } catch (error) {
                  console.error('Test mode login failed:', error);
                  setError('ورود به حالت تست با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
                }
              }}
              className="w-full py-2 px-4 rounded-lg text-indigo-600 font-medium border border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              استفاده از حالت تست
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ساخته شده با{' '}
            <span className="text-indigo-600 font-medium">Next.js PWA</span>
          </p>
        </div>
      </div>
    </div>
  );
}