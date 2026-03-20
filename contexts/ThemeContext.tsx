'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * Theme Context
 *
 * Manages light/dark mode across the app.
 * Persists the user's choice in localStorage.
 * Sets `data-theme` attribute on <html> so CSS custom properties switch.
 */

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // On first render, check localStorage for saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thimbl-theme') as Theme | null;
      if (saved) {
        setTheme(saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch { /* localStorage unavailable */ }
    setMounted(true);
  }, []);

  // Apply the theme to the <html> element whenever it changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('thimbl-theme', theme); } catch { /* ignore */ }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme and toggle function.
 * Must be used within a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
