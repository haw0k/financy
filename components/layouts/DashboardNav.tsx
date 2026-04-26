'use client';

import { type FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems } from '@/config';

export const DashboardNav: FC = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden bg-card md:block md:w-64">
      <div className="flex h-[57px] items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-4 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground">
            <Image src="/icon.svg" alt="Financy" width={32} height={32} className="h-8 w-8" loading="eager" />
          </div>
          <span
            className="inline-block font-semibold"
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
    </nav>
  );
};
