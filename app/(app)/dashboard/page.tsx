'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sun, Moon, Search, SearchX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  TUTORIALS,
  searchTutorials,
  getTutorialById,
  type CraftTutorial,
} from '@/lib/tutorials';
import { getRecentlyViewed } from '@/lib/storage';
import SectionHeader from '@/components/home/SectionHeader';
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isFiltering = !!debouncedQuery || !!craft;

  // Filtered results
  const results = useMemo(() => {
    let filtered: CraftTutorial[] = debouncedQuery ? searchTutorials(debouncedQuery) : [...TUTORIALS];
    if (craft) filtered = filtered.filter((t) => t.category === craft);
    return filtered;
  }, [debouncedQuery, craft]);

  // Active projects — patterns with step progress
  const [activeProjects, setActiveProjects] = useState<{ tutorial: CraftTutorial; stepsCompleted: number }[]>([]);

  useEffect(() => {
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
        projects.sort((a, b) => b.stepsCompleted - a.stepsCompleted);
        setActiveProjects(projects.slice(0, 8));
      }
    } catch { /* ignore */ }
  }, []);

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
      <div
        className="relative mb-4"
        style={{
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: inputFocused ? 'var(--accent-primary)' : 'var(--border-colour)',
          borderRadius: 16,
          backgroundColor: 'var(--bg-secondary)',
          transition: 'border-color 0.2s',
        }}
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
      </div>

      {/* Craft filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
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

      {/* Active Projects — horizontal scroll */}
      {!isFiltering && activeProjects.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Active Projects" />
          <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {activeProjects.map(({ tutorial, stepsCompleted }) => (
              <Link
                key={tutorial.id}
                href={`/explore/${tutorial.id}`}
                className="flex items-center gap-3 rounded-xl p-3 shrink-0"
                style={{ backgroundColor: 'var(--bg-secondary)', minWidth: 260 }}
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
                  className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                >
                  Continue
                </span>
              </Link>
            ))}
          </div>
        </div>
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
          <div className="grid grid-cols-2 gap-3">
            {results.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20">
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
