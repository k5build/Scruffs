import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scruffs – Extraordinary Pet Groomers Dubai',
  description: 'Dubai\'s premium mobile pet grooming service. Professional certified groomers come to your door. Book in under 2 minutes.',
  keywords: 'pet grooming Dubai, mobile pet grooming, dog grooming Dubai, cat grooming Dubai, scruffs',
  openGraph: {
    title: 'Scruffs – Extraordinary Pet Groomers',
    description: 'Premium mobile pet grooming across all Dubai areas.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'Scruffs',
  },
  icons: { icon: '/logo-icon-green.png', apple: '/logo-icon-green.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3A4F4A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
