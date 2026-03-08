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
    { media: '(prefers-color-scheme: dark)',  color: '#181B1C' },
    { media: '(prefers-color-scheme: light)', color: '#F4F2EE' },
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

        {/* PWA / iOS complete meta tags */}
        <meta name="apple-mobile-web-app-title" content="Scruffs" />
        <meta name="application-name" content="Scruffs" />
        <meta name="msapplication-TileColor" content="#3A4F4A" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        <meta name="format-detection" content="telephone=yes, email=no" />

        {/* iOS icon sizes */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple/icon-60@3x.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple/icon-83.5@2x.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple/icon-76@2x.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple/icon-60@2x.png" />

        {/* iOS splash screens — iPhone (portrait) */}
        <link rel="apple-touch-startup-image"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
          href="/splashscreens/iphone14-pro-max.png" />
        <link rel="apple-touch-startup-image"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
          href="/splashscreens/iphone14-pro.png" />
        <link rel="apple-touch-startup-image"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          href="/splashscreens/iphone14.png" />
        <link rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          href="/splashscreens/iphonex.png" />
        <link rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
          href="/splashscreens/iphonexr.png" />
        <link rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
          href="/splashscreens/iphone8plus.png" />
        <link rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
          href="/splashscreens/iphone8.png" />

        {/* Favicon variants */}
        <link rel="icon" type="image/png" sizes="32x32"  href="/icons/icon-96.png" />
        <link rel="icon" type="image/png" sizes="16x16"  href="/icons/icon-72.png" />

        {/* Apply theme before first paint to prevent flash — defaults to light */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('scruffs_theme');if(t==='dark')document.documentElement.classList.add('dark');})();`
        }} />
        {/* Register service worker */}
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js');});}`,
        }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
