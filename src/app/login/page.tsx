'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!username.trim()) {
      showToast.error('نام کاربری الزامی است');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      showToast.error('رمز عبور الزامی است');
      setLoading(false);
      return;
    }

    if (!websiteUrl.trim()) {
      showToast.error('آدرس وب‌سایت الزامی است');
      setLoading(false);
      return;
    }

    // Ensure URL ends with a slash
    const normalizedUrl = websiteUrl.endsWith('/') ? websiteUrl : `${websiteUrl}/`;

    try {
      const result = await login(username, password, normalizedUrl);

      if (result.success) {
        showToast.success('ورود با موفقیت انجام شد');
        router.push('/events');
      } else {
        showToast.error(result.message);
      }
    } catch (err) {
      showToast.error('خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
      console.error('خطای ورود:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-secondary p-4">
      <div className="w-full max-w-md card p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">اسکنر بلیت</h1>
          <p className="text-secondary mt-2">ورود به حساب کاربری</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-foreground mb-2">
              آدرس وب‌سایت
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="input"
              required
            />
            <p className="text-xs text-secondary mt-2">
              آدرس سایت وردپرس خود را وارد کنید
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
              نام کاربری
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 font-medium"
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

        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-secondary">
            ساخته شده با{' '}
            <span className="text-primary font-medium">Next.js PWA</span>
          </p>
        </div>
      </div>
    </div>
  );
}