'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

/**
 * OfflineBanner Component
 *
 * Shows a small banner at the top of the screen when the user goes offline.
 * Automatically hides when the connection is restored.
 */

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    // Check initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <WifiOff size={14} />
          You&apos;re offline — some features may be limited
        </motion.div>
      )}
    </AnimatePresence>
  );
}
