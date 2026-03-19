'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { searchPatterns, type RavelryPatternSearchResult } from '@/lib/ravelry';
import SectionHeader from '@/components/home/SectionHeader';
import RavelryCardSmall from '@/components/home/RavelryCardSmall';
import RavelryPatternCard from '@/components/catalogue/RavelryPatternCard';

/**
 * Dashboard / Home Page
 *
 * Shows Ravelry patterns: popular knitting, popular crochet, free patterns,
 * and trending. Real photos from the Ravelry community.
 */

interface Section {
  title: string;
  patterns: RavelryPatternSearchResult[];
  loading: boolean;
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const [sections, setSections] = useState<Record<string, Section>>({
    popularKnitting: { title: '🧶 Popular Knitting', patterns: [], loading: true },
    popularCrochet: { title: '🪝 Popular Crochet', patterns: [], loading: true },
    freePatterns: { title: '🆓 Free Patterns', patterns: [], loading: true },
    trending: { title: '🔥 Trending', patterns: [], loading: true },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSections() {
      try {
        const [knitting, crochet, free, trending] = await Promise.all([
          searchPatterns({ craft: 'knitting', sort: 'best', page_size: 10, availability: 'free' }),
          searchPatterns({ craft: 'crochet', sort: 'best', page_size: 10, availability: 'free' }),
          searchPatterns({ sort: 'recently-popular', page_size: 10, availability: 'free' }),
          searchPatterns({ sort: 'recently-popular', page_size: 20 }),
        ]);

        setSections({
          popularKnitting: { title: '🧶 Popular Knitting', patterns: knitting.patterns, loading: false },
          popularCrochet: { title: '🪝 Popular Crochet', patterns: crochet.patterns, loading: false },
          freePatterns: { title: '🆓 Free Patterns', patterns: free.patterns, loading: false },
          trending: { title: '🔥 Trending', patterns: trending.patterns, loading: false },
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load patterns');
      }
    }

    loadSections();
  }, []);

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Logo bar */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Thimbl
        </h1>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
          <p className="text-sm font-medium">Could not load patterns</p>
          <p className="text-xs mt-1">{error}</p>
          <p className="text-xs mt-2">Make sure RAVELRY_USERNAME and RAVELRY_PASSWORD are set in your Vercel environment variables.</p>
        </div>
      )}

      {/* Horizontal scroll sections */}
      {['popularKnitting', 'popularCrochet', 'freePatterns'].map((key) => {
        const section = sections[key as keyof typeof sections];
        return (
          <div key={key} className="mb-6">
            <SectionHeader title={section.title} href="/search" />
            {section.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              </div>
            ) : section.patterns.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {section.patterns.map((pattern) => (
                  <RavelryCardSmall key={pattern.id} pattern={pattern} />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Trending grid */}
      <div className="mb-6">
        <SectionHeader title={sections.trending.title} href="/search" count={sections.trending.patterns.length} />
        {sections.trending.loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {sections.trending.patterns.map((pattern, index) => (
              <RavelryPatternCard key={pattern.id} pattern={pattern} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
