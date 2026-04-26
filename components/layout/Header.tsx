'use client';

import { type FC } from 'react';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/shadcn';
import { useMobileNav } from './MobileNavContext';
import { createClient } from '@/lib/supabase/client';

interface IHeader {
  user: User;
}

export const Header: FC<IHeader> = ({ user }) => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const { setIsOpen } = useMobileNav();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-14 items-center pl-4 md:pl-8 pr-4">
        <div className="flex items-center gap-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
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
        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleToggleTheme} className="hidden md:inline-flex">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm font-medium">{user?.email}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
