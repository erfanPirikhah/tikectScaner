'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import { wordpressService } from '@/services/wordpress';
import { showToast } from '@/lib/toast';

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
        await wordpressService.logout(websiteUrl, { token: useAuthStore.getState().token! });
        showToast.success('با موفقیت خارج شدید');
      } catch (error) {
        console.error('خطای API خروج:', error);
        showToast.error('خطا در خروج از سیستم');
        // Continue with local logout even if API call fails
      }
    } else {
      showToast.success('با موفقیت خارج شدید');
    }
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="پروفایل" />

      {/* Content */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">اطلاعات حساب</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary">نام</label>
                <p className="mt-1 text-sm sm:text-base text-foreground">{user?.name || 'موجود نیست'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary">ایمیل</label>
                <p className="mt-1 text-sm sm:text-base text-foreground">{user?.email || 'موجود نیست'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary">آدرس وب‌سایت</label>
                <p className="mt-1 text-sm sm:text-base text-foreground break-all">{useAuthStore.getState().websiteUrl || 'موجود نیست'}</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="btn btn-danger w-full py-3"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}