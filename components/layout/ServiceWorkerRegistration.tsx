'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration
 *
 * Registers the service worker for offline caching.
 * Included in the root layout — renders nothing visible.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((err) => {
          console.warn('SW registration failed:', err);
        });
    }
  }, []);

  return null;
}
