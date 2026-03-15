'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES } from '@/lib/constants';

/**
 * Onboarding Page
 *
 * Shown after first signup. Asks the user to pick their favourite craft category.
 * Updates the user's profile in Supabase.
 */

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    const supabase = createClient();

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Update (or insert) the user's profile with their favourite category
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: user.user_metadata?.display_name || 'Crafter',
        favourite_category: selected,
      });

    // Also ensure user_stats row exists
    await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
      });

    router.push('/');
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-secondary)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        >
          <Sparkles size={28} className="text-white" />
        </motion.div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          What&apos;s your favourite craft?
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Pick one to personalise your experience. You can always explore others!
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {CATEGORIES.map((cat, i) => {
          const isSelected = selected === cat.key;
          return (
            <motion.button
              key={cat.key}
              onClick={() => setSelected(cat.key)}
              className="relative card p-5 text-center transition-all min-h-[44px]"
              style={{
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-colour-light)',
                borderWidth: isSelected ? '2px' : '1px',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Checkmark when selected */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check size={12} className="text-white" />
                </motion.div>
              )}

              <span className="text-3xl mb-2 block">{cat.emoji}</span>
              <span
                className="text-sm font-semibold block"
                style={{ color: 'var(--text-primary)' }}
              >
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 min-h-[44px]"
        style={{ backgroundColor: 'var(--accent-primary)' }}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          "Let's get crafting!"
        )}
      </button>

      {/* Skip option */}
      <button
        onClick={() => {
          router.push('/');
          router.refresh();
        }}
        className="w-full mt-3 py-2 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Skip for now
      </button>
    </motion.div>
  );
}
