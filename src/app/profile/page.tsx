'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import { wordpressService } from '@/services/wordpress';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات حساب</CardTitle>
              <CardDescription>اطلاعات شخصی و حساب کاربری شما</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b">
                  <div>
                    <h3 className="font-medium">نام</h3>
                    <p className="text-sm text-muted-foreground">نام کاربری</p>
                  </div>
                  <p className="mt-1 sm:mt-0 text-sm sm:text-base text-foreground">{user?.name || 'موجود نیست'}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b">
                  <div>
                    <h3 className="font-medium">ایمیل</h3>
                    <p className="text-sm text-muted-foreground">آدرس ایمیل ثبت شده</p>
                  </div>
                  <p className="mt-1 sm:mt-0 text-sm sm:text-base text-foreground">{user?.email || 'موجود نیست'}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
                  <div>
                    <h3 className="font-medium">آدرس وب‌سایت</h3>
                    <p className="text-sm text-muted-foreground">سایت متصل به حساب</p>
                  </div>
                  <p className="mt-1 sm:mt-0 text-sm sm:text-base text-foreground break-all">{useAuthStore.getState().websiteUrl || 'موجود نیست'}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="mt-6">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  خروج
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}