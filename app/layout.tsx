import { RoleProvider, ThemeProvider } from '@/components/providers';
import { Analytics } from '@vercel/analytics/next';
import { Geist_Mono, Roboto } from 'next/font/google';
import Script from 'next/script';
import { SonnerToaster } from '@/lib/shadcn';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config';
import { EProfileStatus, ERole } from '@/enums';
import type { Metadata } from 'next';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});
const geistMono = Geist_Mono({ subsets: ['latin', 'cyrillic'], variable: '--font-mono' });
const robotoHeading = Roboto({ subsets: ['latin', 'cyrillic'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

type TProfileResult =
  | { role: ERole | null; status: EProfileStatus | null; isError: false }
  | { role: null; status: null; isError: true };

async function getProfile(): Promise<TProfileResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { role: null, status: null, isError: false };
    }

    // Prefer role/status from JWT app_metadata (populated by database trigger on signup).
    // If they are missing or invalid, fall back to the profiles table so the client
    // UI matches the server-side middleware checks even after email confirmation.
    const appMetadata = user.app_metadata as { role?: string; status?: string } | undefined;
    const rawRole = appMetadata?.role;
    const rawStatus = appMetadata?.status;

    const roleFromJwt = Object.values(ERole).includes(rawRole as ERole) ? (rawRole as ERole) : null;
    const statusFromJwt = Object.values(EProfileStatus).includes(rawStatus as EProfileStatus)
      ? (rawStatus as EProfileStatus)
      : null;

    if (roleFromJwt && statusFromJwt) {
      return { role: roleFromJwt, status: statusFromJwt, isError: false };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    const role =
      roleFromJwt ??
      (Object.values(ERole).includes(profile?.role as ERole) ? (profile?.role as ERole) : null);
    const status =
      statusFromJwt ??
      (Object.values(EProfileStatus).includes(profile?.status as EProfileStatus)
        ? (profile?.status as EProfileStatus)
        : null);

    return { role, status, isError: false };
  } catch {
    return { role: null, status: null, isError: true };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { role, status, isError } = await getProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.className} ${roboto.variable} ${geistMono.variable} ${robotoHeading.variable} bg-background font-sans antialiased`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              var mq = window.matchMedia('(prefers-color-scheme: dark)');
              document.documentElement.classList.toggle('dark', mq.matches);
              document.documentElement.style.colorScheme = mq.matches ? 'dark' : 'light';
            })();
          `}
        </Script>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <RoleProvider role={role} status={status} isError={isError}>
            {children}
          </RoleProvider>
          <SonnerToaster richColors position="bottom-right" />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
