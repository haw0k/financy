'use client';

import { type FC } from 'react';

import { User } from '@supabase/supabase-js';
import { LogOut, Menu } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/shadcn';

import { useMobileNav } from '@/components/providers';
import { LogoLink, showError } from '@/components/ui';

import { siteConfig } from '@/config';
import { AUTH_MSGS } from '@/messages';

import { signOutAction } from '@/app/actions/auth';

interface IHeader {
  user: User;
}

export const Header: FC<IHeader> = ({ user }) => {
  const { setIsOpen } = useMobileNav();

  const handleLogout = async () => {
    try {
      await signOutAction();
    } catch (error) {
      if (isRedirectError(error)) throw error;
      showError('Logout', AUTH_MSGS.TIMEOUT);
    }
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
          <LogoLink />
        </div>
        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full px-0">
                <div
                  className="shine h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white border flex items-center justify-center text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                  style={{ borderColor: siteConfig.accentColor }}
                >
                  <span className="relative">{user?.email?.[0]?.toUpperCase()}</span>
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
