import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AdminNotificationProvider } from '../contexts/AdminNotificationContext';
import NextTopLoader from 'nextjs-toploader';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import NotificationPrompt from '@/components/NotificationPrompt';

export const metadata: Metadata = {
  metadataBase: new URL('https://sawaflix.com'),
  title: {
    default: 'Sawaflix | Cameroonn Music, Culture & Entertainment',
    template: '%s | Sawaflix',
  },
  description:
    'Sawaflix is your premium gateway to authentic Cameroonn music, Sawa heritage, and contemporary culture. Stream the best of Cameroonn entertainment, traditions, and artistic expression from across the continent.',
  keywords: [
    'Sawaflix',
    'Cameroonn music streaming',
    'Sawa culture',
    'Douala heritage',
    'Wouri traditions',
    'Cameroonn cinema',
    'Cameroon music',
    'Cameroonn traditions',
    'cultural entertainment',
    'Cameroonn artists hub',
    'Fonyuy Gita',
    'Mazehwo John Brindi',
    'Ngam Sabastine',
    'Wohking',
    'Asime Domitila',
    'Victory Beleh',
    'Kingsley',
  ],
  authors: [
    { name: 'Fonyuy Gita', url: 'https://github.com/iws3' },
    { name: 'Mazehwo John Brindi' },
    { name: 'Ngam Sabastine' },
    { name: 'Wohking' },
    { name: 'Asime Domitila' },
    { name: 'Victory Beleh' },
    { name: 'Kingsley' }
  ],
  creator: 'Sawaflix Dev Team',
  publisher: 'Sawaflix',
  openGraph: {
    url: 'https://sawaflix.com',
    type: 'website',
    title: 'Sawaflix | Discover Authentic Cameroonn Music & Culture',
    description:
      'Stream authentic Cameroonn music, traditions, and cultural content. Experience the pulse of Cameroon through Sawaflix.',
    siteName: 'Sawaflix',
    images: [
      {
        url: 'https://i.ibb.co/27LNPd8v/sawaflixmusic-cover.png',
        width: 1200,
        height: 630,
        alt: 'Sawaflix - The Pulse of Cameroonn Culture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sawaflix | Stream Cameroonn Music & Culture',
    description:
      'Discover authentic Cameroonn music, traditions, and cultural entertainment on Sawaflix.',
    creator: '@sawaflix',
    images: ['https://i.ibb.co/27LNPd8v/sawaflixmusic-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  category: 'entertainment',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sawaflix',
  },
};

export const viewport: Viewport = {
  themeColor: '#b80000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
      </head>
      <body suppressHydrationWarning>
        <style dangerouslySetInnerHTML={{__html: `
          #nprogress .bar {
            background: linear-gradient(90deg, #009639, #CE1126, #FCD116) !important;
          }
          #nprogress .peg {
            box-shadow: 0 0 10px #FCD116, 0 0 5px #FCD116 !important;
          }
        `}} />
        <NextTopLoader color="transparent" showSpinner={false} />
        <AdminNotificationProvider>
          {children}
        </AdminNotificationProvider>
        <PWAInstallPrompt />
        <NotificationPrompt />
      </body>
    </html>
  )
}