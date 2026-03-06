import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Scruffs – Extraordinary Pet Groomers Dubai',
  description: "Dubai's premium mobile pet grooming service. Professional certified groomers come to your door. Book in under 2 minutes.",
  keywords: 'pet grooming Dubai, mobile pet grooming, dog grooming Dubai, cat grooming Dubai, scruffs',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Scruffs',
  },
  openGraph: {
    title: 'Scruffs – Extraordinary Pet Groomers',
    description: 'Premium mobile pet grooming across all Dubai areas.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'Scruffs',
  },
  icons: {
    icon:  [{ url: '/logo-icon-green.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/logo-icon-green.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#181A1B' },
    { media: '(prefers-color-scheme: light)', color: '#F5F7F7' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo-icon-green.png" />
        {/* Apply dark mode before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('scruffs_theme');if(t!=='light')document.documentElement.classList.add('dark');})();`
        }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
