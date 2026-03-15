import type { MetadataRoute } from 'next';

/**
 * PWA Manifest for Thimbl
 * This generates /manifest.webmanifest automatically via Next.js 15
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Thimbl — Crafting Companion',
    short_name: 'Thimbl',
    description: 'Level up your craft. A gamified textile crafting companion for sewing, knitting, crochet, and embroidery.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FDF8F0',
    theme_color: '#C67B5C',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['lifestyle', 'education'],
  };
}
