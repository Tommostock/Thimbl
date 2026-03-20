import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Source_Sans_3, Dancing_Script, Great_Vibes } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ServiceWorkerRegistration from '@/components/layout/ServiceWorkerRegistration';
import OfflineBanner from '@/components/layout/OfflineBanner';
import './globals.css';

/**
 * Root Layout
 *
 * Sets up Google Fonts, ThemeProvider, and iOS PWA meta tags.
 * All pages render inside this layout.
 */

// Heading font — elegant serif for a craft-studio feel
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

// Body font — clean and readable sans-serif
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Brand font — calligraphy for the "Thimbl" logo
const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
});

// Calligraphy font — matching BakeBook's "Suzie's" style
const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-calligraphy',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Thimbl — Level Up Your Craft',
  description:
    'A gamified textile crafting companion for sewing, knitting, crochet, and embroidery. Track projects, earn achievements, and level up your skills.',
  // iOS PWA meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Thimbl',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDF8F0' },
    { media: '(prefers-color-scheme: dark)', color: '#2C2825' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} ${dancingScript.variable} ${greatVibes.variable}`}>
      <head>
        {/* PWA iOS icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <OfflineBanner />
            {children}
            <ServiceWorkerRegistration />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
