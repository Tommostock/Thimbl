'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { clearStorage } from '@/lib/storage';

/**
 * Auth Context (simplified — no onboarding)
 *
 * Provides a signOut function that clears localStorage.
 * No login or onboarding flow — the app is immediately usable.
 */

interface AuthContextType {
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const signOut = () => {
    clearStorage();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
