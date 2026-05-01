import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MederSub — Instant VTU Platform',
  description: 'Buy Airtime, Data, Pay Cable TV & Electricity Bills instantly. Fast, secure & reliable VTU platform.',
  applicationName: 'MederSub',
  authors: [{ name: 'Mederhoo Script' }],
  keywords: ['VTU', 'airtime', 'data bundles', 'cable TV', 'electricity', 'Nigeria', 'MTN', 'Glo', 'Airtel'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MederSub',
  },
  openGraph: {
    title: 'MederSub — Instant VTU Platform',
    description: 'Buy Airtime, Data, Pay Cable TV & Electricity Bills instantly.',
    type: 'website',
    locale: 'en_NG',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Telegram Mini App SDK */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />

        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MederSub" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#6366f1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
