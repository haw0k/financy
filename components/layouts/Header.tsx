'use client';

import { useMobileNav } from '@/components/providers';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Menu } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/shadcn';
import { routes, siteConfig } from '@/config';
import { signOutAction } from '@/app/actions/auth';
import { showError } from '@/components/ui';
import { type FC } from 'react';

interface IHeader {
  user: User;
}

export const Header: FC<IHeader> = ({ user }) => {
  const { setIsOpen } = useMobileNav();

  const handleLogout = async () => {
    const result = await signOutAction();
    // signOutAction redirects on success; we only reach here on error
    showError('Logout', result.error || 'Failed to log out');
  };

  return (
    <header className="bg-card">
      <div className="flex h-14 items-center justify-end pl-4 md:pl-8 pr-4 border-b border-border">
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href={routes.dashboard} className="flex items-center gap-4 font-semibold">
            <Image
              src="/icon.svg"
              alt={siteConfig.name}
              width={32}
              height={32}
              className="h-8 w-8"
              loading="eager"
            />
            <span
              className="font-semibold"
              style={{
                color: siteConfig.accentColor,
                fontSize: siteConfig.logoFontSize,
                fontWeight: siteConfig.logoFontWeight,
              }}
            >
              {siteConfig.name}
            </span>
          </Link>
        </div>
        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-2">
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
