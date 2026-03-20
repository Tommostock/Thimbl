'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sun, Moon, Search, SearchX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  TUTORIALS,
  SUBCATEGORIES,
  searchTutorials,
  getTutorialById,
  getTutorialsByCategory,
  getTutorialsBySubcategory,
  type CraftTutorial,
} from '@/lib/tutorials';
import { getRecentlyViewed } from '@/lib/storage';
import SectionHeader from '@/components/home/SectionHeader';
import TutorialCardSmall from '@/components/home/TutorialCardSmall';
import TutorialCard from '@/components/catalogue/TutorialCard';
import ThimbleLogo from '@/components/ui/ThimbleLogo';

const CRAFT_FILTERS = [
  { key: null as string | null, label: 'All' },
  { key: 'knitting', label: '🧶 Knitting' },
  { key: 'crochet', label: '🪝 Crochet' },
];

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  // Search state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  // Filter state
  const [craft, setCraft] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Are we in "browsing" mode (no search, no filters) or "filtering" mode?
  const isFiltering = !!debouncedQuery || !!craft || !!subcategory;

  // Filtered results
  const results = useMemo(() => {
    let filtered: CraftTutorial[] = debouncedQuery ? searchTutorials(debouncedQuery) : [...TUTORIALS];
    if (craft) filtered = filtered.filter((t) => t.category === craft);
    if (subcategory) filtered = filtered.filter((t) => t.subcategory === subcategory);
    return filtered;
  }, [debouncedQuery, craft, subcategory]);

  // Recently viewed (loaded from localStorage on mount)
  const [recentlyViewed, setRecentlyViewed] = useState<CraftTutorial[]>([]);
  // Active projects — patterns with step progress
  const [activeProjects, setActiveProjects] = useState<{ tutorial: CraftTutorial; stepsCompleted: number }[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewed();
    const tutorials = ids
      .map((rid) => getTutorialById(rid))
      .filter((t): t is CraftTutorial => t !== undefined)
      .slice(0, 8);
    setRecentlyViewed(tutorials);

    // Load step progress
    try {
      const raw = localStorage.getItem('thimbl_step_progress');
      if (raw) {
        const progress: Record<string, string[]> = JSON.parse(raw);
        const projects: { tutorial: CraftTutorial; stepsCompleted: number }[] = [];
        for (const [patternId, steps] of Object.entries(progress)) {
          if (steps.length > 0) {
            const t = getTutorialById(patternId);
            if (t) projects.push({ tutorial: t, stepsCompleted: steps.length });
          }
        }
        // Sort by most recently active (most steps = likely most recent interaction)
        projects.sort((a, b) => b.stepsCompleted - a.stepsCompleted);
        setActiveProjects(projects.slice(0, 6));
      }
    } catch { /* ignore */ }
  }, []);

  // Discovery carousels (only computed when needed)
  const knittingHighlights = useMemo(() => getTutorialsByCategory('knitting').slice(0, 10), []);
  const crochetHighlights = useMemo(() => getTutorialsByCategory('crochet').slice(0, 10), []);
  const toyHighlights = useMemo(() => getTutorialsBySubcategory('Toys'), []);
  const babyHighlights = useMemo(() => getTutorialsBySubcategory('Baby'), []);
  const christmasHighlights = useMemo(() => getTutorialsBySubcategory('Christmas'), []);

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Logo bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ThimbleLogo size={30} />
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Thimbl
          </h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Search bar */}
      <motion.div
        className="relative mb-4"
        animate={{ borderColor: inputFocused ? 'var(--accent-primary)' : 'var(--border-colour)' }}
        transition={{ duration: 0.2 }}
        style={{ borderWidth: 1.5, borderStyle: 'solid', borderRadius: 16, backgroundColor: 'var(--bg-secondary)' }}
      >
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: inputFocused ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Search patterns..."
          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </motion.div>

      {/* Craft filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CRAFT_FILTERS.map((f) => {
          const isActive = craft === f.key;
          return (
            <button
              key={f.key ?? 'all'}
              onClick={() => setCraft(f.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
              style={{
                backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Subcategory filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSubcategory(null)}
          className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0"
          style={{
            borderColor: !subcategory ? 'var(--accent-primary)' : 'var(--border-colour)',
            backgroundColor: !subcategory ? 'var(--bg-secondary)' : 'transparent',
            color: !subcategory ? 'var(--text-primary)' : 'var(--text-muted)',
          }}
        >
          All Types
        </button>
        {SUBCATEGORIES.map((sub) => (
          <button
            key={sub.key}
            onClick={() => setSubcategory(subcategory === sub.key ? null : sub.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0"
            style={{
              borderColor: subcategory === sub.key ? 'var(--accent-primary)' : 'var(--border-colour)',
              backgroundColor: subcategory === sub.key ? 'var(--bg-secondary)' : 'transparent',
              color: subcategory === sub.key ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {sub.emoji} {sub.label}
          </button>
        ))}
      </div>

      {/* Discovery carousels — only when browsing (no search/filters active) */}
      {!isFiltering && (
        <>
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="Active Projects" />
              <div className="space-y-2">
                {activeProjects.map(({ tutorial, stepsCompleted }) => (
                  <Link
                    key={tutorial.id}
                    href={`/explore/${tutorial.id}`}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <img
                      src={tutorial.imageUrl}
                      alt={tutorial.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {tutorial.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {stepsCompleted} step{stepsCompleted !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                    >
                      Continue
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="Recently Viewed" />
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {recentlyViewed.map((t) => (
                  <TutorialCardSmall key={t.id} tutorial={t} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <SectionHeader title="🧶 Knitting Patterns" />
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {knittingHighlights.map((t) => (
                <TutorialCardSmall key={t.id} tutorial={t} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <SectionHeader title="🪝 Crochet Patterns" />
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {crochetHighlights.map((t) => (
                <TutorialCardSmall key={t.id} tutorial={t} />
              ))}
            </div>
          </div>

          {toyHighlights.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="🧸 Toys & Amigurumi" />
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {toyHighlights.map((t) => (
                  <TutorialCardSmall key={t.id} tutorial={t} />
                ))}
              </div>
            </div>
          )}

          {babyHighlights.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="👶 Baby Patterns" />
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {babyHighlights.map((t) => (
                  <TutorialCardSmall key={t.id} tutorial={t} />
                ))}
              </div>
            </div>
          )}

          {christmasHighlights.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="🎄 Christmas & Holiday" />
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {christmasHighlights.map((t) => (
                  <TutorialCardSmall key={t.id} tutorial={t} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Results count */}
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
        {isFiltering
          ? `${results.length} pattern${results.length !== 1 ? 's' : ''} found`
          : `All Patterns (${results.length})`}
      </p>

      {/* Results grid */}
      <AnimatePresence mode="wait">
        {results.length > 0 ? (
          <motion.div
            key="results"
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {results.map((tutorial, index) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="flex flex-col items-center justify-center pt-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchX size={48} style={{ color: 'var(--text-muted)' }} strokeWidth={1.2} />
            <h3
              className="text-base font-semibold mt-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              No patterns found
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Try a different search or filter
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
