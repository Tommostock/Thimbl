'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SearchX, Loader2 } from 'lucide-react';
import { useInfinitePatternSearch } from '@/hooks/useRavelry';
import RavelryPatternCard from '@/components/catalogue/RavelryPatternCard';

/**
 * Search Page
 *
 * Searches Ravelry patterns by text query, craft type, and availability.
 * Shows results with real community photos.
 */

const CRAFT_FILTERS = [
  { key: null as string | null, label: 'All' },
  { key: 'knitting', label: '🧶 Knitting' },
  { key: 'crochet', label: '🪝 Crochet' },
];

const SORT_OPTIONS = [
  { key: 'best', label: 'Best Match' },
  { key: 'recently-popular', label: 'Trending' },
  { key: 'favorites', label: 'Most Loved' },
  { key: 'date', label: 'Newest' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [craft, setCraft] = useState<'knitting' | 'crochet' | undefined>(undefined);
  const [sort, setSort] = useState('best');
  const [freeOnly, setFreeOnly] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { patterns, loading, error, hasMore, loadMore } = useInfinitePatternSearch({
    query: debouncedQuery || undefined,
    craft,
    sort,
    availability: freeOnly ? 'free' : undefined,
    page_size: 20,
  });

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Search bar */}
      <motion.div
        className="relative mb-4"
        animate={{
          borderColor: inputFocused ? 'var(--accent-primary)' : 'var(--border-colour)',
        }}
        transition={{ duration: 0.2 }}
        style={{
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderRadius: 16,
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: inputFocused ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Search patterns..."
          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
        />
      </motion.div>

      {/* Craft filter pills */}
      <div className="flex gap-2 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CRAFT_FILTERS.map((f) => {
          const isActive = craft === f.key || (f.key === null && !craft);
          return (
            <button
              key={f.key ?? 'all'}
              onClick={() => setCraft(f.key as typeof craft)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {f.label}
            </button>
          );
        })}

        {/* Free only toggle */}
        <button
          onClick={() => setFreeOnly(!freeOnly)}
          className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
          style={{
            backgroundColor: freeOnly ? '#22C55E' : 'var(--bg-secondary)',
            color: freeOnly ? '#fff' : 'var(--text-secondary)',
          }}
        >
          🆓 Free Only
        </button>
      </div>

      {/* Sort options */}
      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors"
            style={{
              borderColor: sort === s.key ? 'var(--accent-primary)' : 'var(--border-colour)',
              backgroundColor: sort === s.key ? 'var(--bg-secondary)' : 'transparent',
              color: sort === s.key ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
          <p className="text-sm font-medium">Could not load patterns</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Result count */}
      {!loading && patterns.length > 0 && (
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} loaded
        </p>
      )}

      {/* Results grid */}
      <AnimatePresence mode="wait">
        {patterns.length > 0 ? (
          <motion.div
            key="results"
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {patterns.map((pattern, index) => (
              <RavelryPatternCard key={pattern.id} pattern={pattern} index={index} />
            ))}
          </motion.div>
        ) : !loading ? (
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
        ) : null}
      </AnimatePresence>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
