'use client';

import { useState, useCallback, useEffect, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface Toast {
  id: number;
  amount: number;
}

interface XPToastContextType {
  showXP: (amount: number) => void;
}

const XPToastContext = createContext<XPToastContextType>({ showXP: () => {} });

export function useXPToast() {
  return useContext(XPToastContext);
}

let toastId = 0;

export function XPToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showXP = useCallback((amount: number) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, amount }]);
  }, []);

  // Auto-remove toasts after 2s
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <XPToastContext.Provider value={{ showXP }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-16 left-0 right-0 z-[90] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full shadow-lg"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              <Zap size={14} fill="#fff" />
              <span className="text-sm font-bold">+{toast.amount} XP</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </XPToastContext.Provider>
  );
}
