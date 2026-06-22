'use client';

import Image from 'next/image';
import Link from 'next/link';
import { routes, siteConfig } from '@/config';
import { type FC } from 'react';

export const LogoLink: FC = () => (
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
      className="logo-hover inline-block font-semibold"
      data-text={siteConfig.name}
      style={{
        color: siteConfig.accentColor,
        fontSize: siteConfig.logoFontSize,
        fontWeight: siteConfig.logoFontWeight,
      }}
    >
      {siteConfig.name}
    </span>
  </Link>
);
