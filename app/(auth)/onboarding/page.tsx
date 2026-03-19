'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight } from 'lucide-react';
import { setStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORIES } from '@/lib/constants';

const CAROUSEL_CARDS = [
  {
    emoji: '🧵',
    title: 'Welcome to Thimbl',
    description: 'Your textile crafting companion for sewing, knitting, crochet and embroidery.',
  },
  {
    emoji: '🔍',
    title: 'Discover Projects',
    description: 'Browse 40+ craft projects with step-by-step instructions, materials lists and expert tips.',
  },
  {
    emoji: '📸',
    title: 'Track Your Progress',
    description: 'Log crafting sessions, upload photos, set timers and keep a personal craft journal.',
  },
  {
    emoji: '⭐',
    title: 'Level Up',
    description: 'Earn XP for every action, unlock achievements and become a Craft Sage.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [phase, setPhase] = useState<'carousel' | 'form'>('carousel');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [favouriteCategory, setFavouriteCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isLastCard = carouselIndex === CAROUSEL_CARDS.length - 1;

  function nextCard() {
    if (isLastCard) {
      setPhase('form');
    } else {
      setCarouselIndex((i) => i + 1);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
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
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {phase === 'carousel' ? (
            <motion.div
              key="carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -40 }}
              className="text-center"
            >
              {/* Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="mb-8"
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.9 }}
                  >
                    <span className="text-4xl">{CAROUSEL_CARDS[carouselIndex].emoji}</span>
                  </div>
                  <h1
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                  >
                    {CAROUSEL_CARDS[carouselIndex].title}
                  </h1>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    {CAROUSEL_CARDS[carouselIndex].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {CAROUSEL_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i === carouselIndex ? 'var(--accent-primary)' : 'var(--border-colour)',
                      width: i === carouselIndex ? 24 : 8,
                    }}
                  />
                ))}
              </div>

              {/* Button */}
              <button
                onClick={nextCard}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                {isLastCard ? "Get Started" : "Next"}
                <ChevronRight size={16} />
              </button>

              {/* Skip */}
              <button
                onClick={() => setPhase('form')}
                className="mt-3 text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Skip
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
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
                  style={{ fontFamily: 'var(--font-brand)', color: 'var(--text-primary)' }}
                >
                  Thimbl
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
                      <motion.button
                        key={cat.key}
                        type="button"
                        onClick={() => setFavouriteCategory(cat.key)}
                        whileTap={{ scale: 0.96 }}
                        className="p-3 rounded-xl border-2 text-sm font-medium flex items-center gap-2 transition-colors"
                        style={{
                          borderColor: favouriteCategory === cat.key ? 'var(--accent-primary)' : 'var(--border-colour)',
                          backgroundColor: favouriteCategory === cat.key ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                          color: favouriteCategory === cat.key ? '#fff' : 'var(--text-primary)',
                        }}
                      >
                        <span>{cat.emoji}</span>
                        {cat.label}
                      </motion.button>
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
