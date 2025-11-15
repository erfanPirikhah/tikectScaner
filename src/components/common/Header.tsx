'use client';

import { useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with local logout even if API call fails
      }
    }
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {showBackButton ? (
            <button
              onClick={backButtonAction}
              className="text-indigo-600 hover:text-indigo-900 font-medium ml-4"
            >
              → بازگشت
            </button>
          ) : (
            <div></div> // Spacer to maintain alignment
          )}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        {!hideLogout && isLoggedIn && (
          <Link href="/profile" className="text-sm text-indigo-600 hover:text-indigo-900">
            پروفایل
          </Link>
        )}
      </div>
    </header>
  );
}