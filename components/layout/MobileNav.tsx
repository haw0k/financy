'use client';

import { useState, type FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, TrendingUp, TrendingDown, Settings, Moon, Sun } from 'lucide-react';
import { Button, Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/lib/shadcn';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: TrendingUp },
  { href: '/dashboard/categories', label: 'Categories', icon: TrendingDown },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const MobileNav: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed left-4 top-3 z-50 flex items-center gap-4 md:hidden">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <Link href="/dashboard" className="flex items-center gap-4 font-semibold">
          <Image src="/icon.svg" alt="Financy" width={32} height={32} className="h-8 w-8" />
          <span
            className="font-semibold"
            style={{ color: '#00A541', fontSize: '26px', fontWeight: 700 }}
          >
            Financy
          </span>
        </Link>
      </div>
      <SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-[57px] items-center border-b border-border px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-4 font-semibold"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/icon.svg"
              alt="Financy"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span
              className="font-semibold"
              style={{ color: '#00A541', fontSize: '26px', fontWeight: 700 }}
            >
              Financy
            </span>
          </Link>
        </div>
        <div className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto border-t border-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="mx-auto flex"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
