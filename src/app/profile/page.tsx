'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { wordpressService } from '@/services/wordpress';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getBaseUrlWithoutSubdomain } from '@/lib/utils';

export default function Profile() {
  const { user, isLoggedIn, logout, websiteUrl } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login/');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const handleLogout = async () => {
    // Use current domain if websiteUrl is not available in store
    let currentWebsiteUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    // Remove subdomain from websiteUrl
    currentWebsiteUrl = getBaseUrlWithoutSubdomain(currentWebsiteUrl);
    const token = useAuthStore.getState().token;

    if (currentWebsiteUrl && token) {
      try {
        await wordpressService.logout(currentWebsiteUrl, { token: token! });
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
    router.push('/login/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header title="پروفایل" /> */}

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
                  <p className="mt-1 sm:mt-0 text-sm sm:text-base text-foreground break-all">{typeof window !== 'undefined' ? window.location.origin : useAuthStore.getState().websiteUrl || 'موجود نیست'}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="mt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                    >
                      خروج
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تایید خروج</DialogTitle>
                      <DialogDescription>
                        آیا از خروج از حساب کاربری خود اطمینان دارید؟
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={(e) => {
                        e.stopPropagation();
                      }} className="mr-2">لغو</Button>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}>
                        خروج
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}