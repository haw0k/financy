import Script from 'next/script';
import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider, RoleProvider } from '@/components/providers';
import { SonnerToaster } from '@/lib/shadcn';
import { createClient } from '@/lib/supabase/server';
import { ERole, EProfileStatus } from '@/enums';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';
import './globals.css';

const geist = Geist({ subsets: ['latin', 'cyrillic'] });
const geistMono = Geist_Mono({ subsets: ['latin', 'cyrillic'] });
const robotoHeading = Roboto({ subsets: ['latin', 'cyrillic'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

async function getProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { role: null, status: null };
    }

    // Get role/status from JWT app_metadata (populated by database trigger on signup)
    const appMetadata = user.app_metadata as { role?: string; status?: string } | undefined;
    return {
      role: (appMetadata?.role as ERole) ?? null,
      status: (appMetadata?.status as EProfileStatus) ?? null,
    };
  } catch {
    return { role: null, status: null };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { role, status } = await getProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.className} ${geistMono.className} ${robotoHeading.variable} bg-background font-sans antialiased`}
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
          <RoleProvider role={role} status={status}>
            {children}
          </RoleProvider>
          <SonnerToaster richColors position="bottom-right" />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
