'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, GraduationCap, Scissors } from 'lucide-react';
import ThimbleLogo from '@/components/ui/ThimbleLogo';

const WELCOME_KEY = 'thimbl_has_seen_welcome';

interface WelcomeCard {
  icon: typeof Search;
  title: string;
  subtitle?: string;
  description: string;
  useLogoForIcon?: boolean;
}

const CARDS: WelcomeCard[] = [
  {
    icon: Scissors,
    title: 'Thimbl',
    subtitle: 'CRAFTING COMPANION',
    description: 'Your personal collection of 60+ knitting and crochet patterns with step-by-step instructions.',
    useLogoForIcon: true,
  },
  {
    icon: Search,
    title: 'Browse & Search',
    description: 'Explore patterns by category, search by name, and filter by knitting or crochet.',
  },
  {
    icon: BookOpen,
    title: 'Journal & Notes',
    description: 'Log your craft sessions with photos, ratings, and personal notes. Track your progress over time.',
  },
  {
    icon: GraduationCap,
    title: 'Learn & Grow',
    description: 'Look up stitches, convert UK/US terminology, and check needle sizes — all in one place.',
  },
];

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(WELCOME_KEY);
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    setVisible(false);
  };

  const isLastPage = currentPage === CARDS.length - 1;

  const handleNext = () => {
    if (isLastPage) {
      dismiss();
    } else {
      setCurrentPage((p) => p + 1);
    }
  };

  if (!visible) return null;

  const card = CARDS[currentPage];
  const Icon = card.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        <motion.div
          className="rounded-2xl w-full max-w-sm overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Skip button */}
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={dismiss}
              className="text-sm font-medium px-3 py-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Skip
            </button>
          </div>

          {/* Card content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="px-8 pt-4 pb-6 text-center"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                {card.useLogoForIcon ? (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '3px solid var(--accent-primary)',
                    }}
                  >
                    <ThimbleLogo size={52} />
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '3px solid var(--accent-primary)',
                    }}
                  >
                    <Icon size={40} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                )}
              </div>

              {/* Title */}
              {currentPage === 0 ? (
                <div className="mb-2">
                  <h2
                    className="text-4xl mb-0"
                    style={{ fontFamily: 'var(--font-calligraphy)', color: 'var(--accent-primary)' }}
                  >
                    {card.title}
                  </h2>
                  {card.subtitle && (
                    <p
                      className="text-xs font-bold tracking-[0.3em]"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>
              ) : (
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                >
                  {card.title}
                </h2>
              )}

              {/* Description */}
              <p
                className="text-sm leading-relaxed mt-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {card.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bottom: dots + button */}
          <div className="px-8 pb-8 flex flex-col items-center gap-5">
            {/* Dots */}
            <div className="flex gap-2">
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentPage ? 24 : 8,
                    backgroundColor: i === currentPage ? 'var(--accent-primary)' : 'var(--border-colour)',
                  }}
                />
              ))}
            </div>

            {/* Action button */}
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {isLastPage ? 'Get Started' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
