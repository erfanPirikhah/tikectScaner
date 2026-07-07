"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { wordpressService } from "@/services/wordpress";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { API_BASE_URL } from "@/config/api";
import {
  Home,
  ScanLine,
  ShoppingBag,
  Ticket,
  Users,
  Package,
  Phone,
  Info,
  Menu,
  LogOut,
} from "lucide-react";
import { storageService } from "@/services/storage";

const navItems = [
  { href: "/dashboard", label: "صفحه اصلی", icon: Home },
  { href: "/scan", label: "بررسی کوپن", icon: ScanLine },
  { href: "/orders", label: "سفارش ها", icon: ShoppingBag },
  { href: "/coupons", label: "کوپن ها", icon: Ticket },
  { href: "/users", label: "کاربران", icon: Users },
  { href: "/products", label: "محصولات خدمات", icon: Package },
  { href: "/contact", label: "تماس با ما", icon: Phone },
  { href: "/about", label: "درباره ما", icon: Info },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout, websiteUrl, token } = useAuthStore();

  const handleLogout = async () => {
    const currentWebsiteUrl = websiteUrl || API_BASE_URL;
    if (currentWebsiteUrl && token) {
      try {
        await wordpressService.logout(currentWebsiteUrl, { token });
      } catch (error) {
        console.error("خطای خروج:", error);
      }
    }

    // پاک کردن فقط اطلاعات کاربر از لوکال استوریج
    storageService.clearUserData();

    // پاک کردن استیت های Zustand
    logout();

    showToast.success("با موفقیت خارج شدید");
    router.push("/login/");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gray-50 border-l border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          پنل مدیریت
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-gray-900">
            {user?.name || "کاربر"}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 ml-2" />
          خروج از حساب
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar for Desktop (Right Side in RTL) */}
      <aside className="hidden lg:block w-64 fixed right-0 top-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm">
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          پنل مدیریت
        </span>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">باز کردن منو</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-72 max-w-full">
            <SheetTitle className="sr-only">منوی اصلی</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:mr-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
