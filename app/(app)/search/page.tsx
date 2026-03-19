'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SearchX } from 'lucide-react';
import { TUTORIALS, SUBCATEGORIES, searchTutorials, type CraftTutorial } from '@/lib/tutorials';
import TutorialCard from '@/components/catalogue/TutorialCard';

const CRAFT_FILTERS = [
  { key: null as string | null, label: 'All' },
  { key: 'knitting', label: '🧶 Knitting' },
  { key: 'crochet', label: '🪝 Crochet' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [craft, setCraft] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    let filtered: CraftTutorial[] = debouncedQuery ? searchTutorials(debouncedQuery) : [...TUTORIALS];
    if (craft) filtered = filtered.filter((t) => t.category === craft);
    if (subcategory) filtered = filtered.filter((t) => t.subcategory === subcategory);
    return filtered;
  }, [debouncedQuery, craft, subcategory]);

  return (
    <div className="px-4 pt-6 pb-24">
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

      {/* Results count */}
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
        {results.length} pattern{results.length !== 1 ? 's' : ''} found
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
