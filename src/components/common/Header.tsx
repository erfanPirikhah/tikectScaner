'use client';

import { useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonAction?: () => void;
  hideLogout?: boolean;
}

export default function Header({ title, showBackButton = false, backButtonAction, hideLogout = false }: HeaderProps) {
  const router = useRouter();
  const { isLoggedIn, logout, websiteUrl } = useAuthStore();

  const handleLogout = async () => {
    const token = useAuthStore.getState().token;
    if (websiteUrl && token) {
      try {
        await wordpressService.logout(websiteUrl, { token });
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
    <header className="header py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={backButtonAction}
                className="btn btn-outline flex items-center"
              >
                <span className="ml-2">→</span> بازگشت
              </button>
            ) : (
              <div></div> // Spacer to maintain alignment
            )}
            <h1 className="text-xl font-bold text-foreground mr-4">{title}</h1>
          </div>
          {!hideLogout && isLoggedIn && (
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleLogout}
                className="btn btn-outline text-sm"
              >
                خروج
              </button>
              <Link href="/profile" className="btn btn-outline text-sm">
                پروفایل
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}