import Script from 'next/script';
import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/providers';
import type { Metadata } from 'next';
import './globals.css';

const geist = Geist({ subsets: ['latin', 'cyrillic'] });
const geistMono = Geist_Mono({ subsets: ['latin', 'cyrillic'] });

const robotoHeading = Roboto({ subsets: ['latin', 'cyrillic'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Track your income and expenses with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              var mq = window.matchMedia('(prefers-color-scheme: dark)');
              document.documentElement.classList.toggle('dark', mq.matches);
              document.documentElement.style.colorScheme = mq.matches ? 'dark' : 'light';
            })();
          `}
        </Script>
      </head>
      <body
        className={`${geist.className} ${geistMono.className} ${robotoHeading.variable} bg-background font-sans antialiased`}
      >
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
