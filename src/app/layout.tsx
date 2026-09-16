import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { CommandPalette } from '@/components/command-palette';
import { StructuredData } from '@/components/seo/structured-data';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#070A13' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialflow.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'SocialFlow — Real-Time Social Media Management',
    template: '%s | SocialFlow',
  },
  description:
    'SocialFlow is a powerful real-time social media management platform for scheduling, publishing, monitoring, analytics and managing social content from one place.',
  applicationName: 'SocialFlow',
  authors: [{ name: 'SocialFlow Team', url: appUrl }],
  keywords: [
    'SocialFlow',
    'social media management',
    'social media scheduler',
    'social media analytics',
    'social media automation',
    'content scheduling',
    'social media marketing',
    'social media publishing',
    'social media dashboard',
    'social media platform',
  ],
  creator: 'SocialFlow',
  publisher: 'SocialFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'SocialFlow',
    title: 'SocialFlow — Real-Time Social Media Management',
    description:
      'Plan, schedule, publish and analyze your social media content from one powerful platform.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SocialFlow — Real-Time Social Media Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialFlow — Real-Time Social Media Management',
    description:
      'Plan, schedule, publish and analyze your social media content from one powerful platform.',
    images: ['/og-image.png'],
    creator: '@socialflowapp',
    site: '@socialflowapp',
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
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} min-h-full bg-slate-50 dark:bg-[#070A13] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200`}>
        <Providers>
          {children}
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
