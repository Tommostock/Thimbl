/**
 * layout.tsx — Root layout for PassCheck
 *
 * In Next.js App Router, layout.tsx wraps every page in your app.
 * This is where we set up:
 *   - Page metadata (title, description — for SEO and share previews)
 *   - PWA (Progressive Web App) configuration — lets users install the app
 *   - Fonts
 *   - The HTML shell that wraps all page content
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';

// ─────────────────────────────────────────────────────────
// METADATA — Shown in browser tabs, Google search, and
// social media previews when someone shares the link.
// ─────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'PassCheck — Password Strength Simulator',
  description:
    'Simulate dictionary, hybrid, and brute-force attacks on a test password. ' +
    'Learn why passwords fail and how to make them stronger. Free, private, educational.',
  keywords: ['password strength', 'password security', 'cybersecurity education', 'password simulator'],
  authors: [{ name: 'PassCheck' }],

  // PWA manifest link (the manifest.json lives in /public)
  manifest: '/manifest.json',

  // Open Graph — controls how the link looks when shared on WhatsApp, Slack, etc.
  openGraph: {
    title: 'PassCheck — Password Strength Simulator',
    description: 'Test your password strength with simulated attacks. Free & private.',
    type: 'website',
  },

  // Mobile browser toolbar colour
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'PassCheck',
  },
};

// ─────────────────────────────────────────────────────────
// VIEWPORT — Controls how the page scales on mobile devices.
// ─────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,     // Prevent unintended zoom-in on form inputs (iOS)
  userScalable: false,
  themeColor: '#0a0a0f', // Dark status bar on Android Chrome
};

// ─────────────────────────────────────────────────────────
// ROOT LAYOUT COMPONENT
// Every page is wrapped in this HTML shell.
// ─────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // 'children' = whatever page is being rendered
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Geist Mono — the monospace font that gives PassCheck its terminal look */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Apple touch icon — shown when user adds to iOS home screen */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="animated-bg min-h-screen safe-top safe-bottom">
        {children}
      </body>
    </html>
  );
}
