'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { setStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORIES } from '@/lib/constants';

/**
 * Onboarding Page
 *
 * First-run setup — user enters their name and picks a favourite craft.
 * Data saved to localStorage. No account or password needed.
 */

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [favouriteCategory, setFavouriteCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!favouriteCategory) {
      setError('Please pick a favourite craft');
      return;
    }

    setSaving(true);
    setStorage({
      profile: {
        display_name: displayName.trim(),
        favourite_category: favouriteCategory,
      },
    });
    refreshUser();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <span className="text-3xl">🧵</span>
          </div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Welcome to Thimbl
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your crafting journey starts here
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-primary)' }}
            >
              What should we call you?
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-colour)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* Favourite craft */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              What&apos;s your favourite craft?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFavouriteCategory(cat.key)}
                  className="p-3 rounded-xl border-2 text-sm font-medium flex items-center gap-2 transition-colors"
                  style={{
                    borderColor: favouriteCategory === cat.key ? 'var(--accent-primary)' : 'var(--border-colour)',
                    backgroundColor: favouriteCategory === cat.key ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: favouriteCategory === cat.key ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--accent-primary)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Let's Craft!"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
