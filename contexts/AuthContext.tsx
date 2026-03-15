'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getStorage, clearStorage, hasProfile } from '@/lib/storage';

/**
 * Auth Context
 *
 * No Supabase auth — user identity is stored in localStorage.
 * "Logged in" means onboarding has been completed (display_name is set).
 * "Sign out" clears localStorage and redirects to /onboarding.
 */

interface LocalUser {
  id: 'local';
  display_name: string;
  favourite_category: string;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signOut: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = () => {
    const { profile } = getStorage();
    if (profile.display_name) {
      setUser({ id: 'local', display_name: profile.display_name, favourite_category: profile.favourite_category });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const signOut = () => {
    clearStorage();
    setUser(null);
    router.push('/onboarding');
  };

  const refreshUser = () => {
    loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
