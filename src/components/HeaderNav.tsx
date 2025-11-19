'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const HeaderNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/events',
      icon: Calendar,
      label: 'لیست رویدادها',
    },
    {
      href: '/profile',
      icon: User,
      label: 'پروفایل',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/events" className="flex items-center gap-2">
            <img
              src="/ALogo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-sm"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              نرم افزار اختصاصی CheckIn بلیت
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default HeaderNav;