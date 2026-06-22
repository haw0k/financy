'use client';

import { type FC } from 'react';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export const ThemeProvider: FC<ThemeProviderProps> = ({ children, ...props }) => (
  <NextThemesProvider {...props}>{children}</NextThemesProvider>
);
