'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { wordpressService } from '@/services/wordpress';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogOut, User } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonAction?: () => void;
  hideLogout?: boolean;
}

export default function Header({ title, showBackButton = false, backButtonAction, hideLogout = false }: HeaderProps) {
  const router = useRouter();
  const { isLoggedIn, logout, websiteUrl, user } = useAuthStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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
    setLogoutDialogOpen(false);
  };

  const handleCancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBackButton ? (
            <Button
              variant="outline"
              size="sm"
              onClick={backButtonAction}
              className="flex items-center"
            >
              <span className="ml-2">→</span> بازگشت
            </Button>
          ) : (
            <div className="text-xl font-bold text-foreground">{title}</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!hideLogout && isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || 'U'}`} alt={user?.name} />
                    <AvatarFallback className="bg-secondary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="ml-2 h-4 w-4" />
                    <span>پروفایل</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLogoutDialogOpen(true)}
                  className="flex items-center text-destructive"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تایید خروج</DialogTitle>
            <DialogDescription>
              آیا از خروج از حساب کاربری خود اطمینان دارید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelLogout}
            >
              لغو
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
            >
              خروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}