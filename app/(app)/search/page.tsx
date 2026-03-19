'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, SearchX } from 'lucide-react';
import { PROJECTS } from '@/lib/data';
import { DIFFICULTIES } from '@/lib/constants';
import CategoryFilter from '@/components/catalogue/CategoryFilter';
import ProjectCard from '@/components/catalogue/ProjectCard';
import FilterSheet, { type FilterState } from '@/components/search/FilterSheet';

// ============================================
// Helpers
// ============================================

function matchesTimeRange(estimatedTime: string | null, ranges: string[]): boolean {
  if (ranges.length === 0) return true;
  if (!estimatedTime) return false;
  const hours = parseFloat(estimatedTime) || 0;
  const isMinutes = estimatedTime.toLowerCase().includes('min');
  const h = isMinutes ? hours / 60 : hours;
  return ranges.some((r) => {
    if (r === 'under-2h') return h < 2;
    if (r === '2-4h') return h >= 2 && h < 4;
    if (r === '4-8h') return h >= 4 && h < 8;
    if (r === '8h+') return h >= 8;
    return false;
  });
}

// ============================================
// Search Page
// ============================================

const DEFAULT_FILTERS: FilterState = {
  timeRange: [],
  tags: [],
  difficulty: [],
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Count active advanced filters
  const advancedFilterCount =
    advancedFilters.timeRange.length + advancedFilters.tags.length;

  // Toggle difficulty
  function toggleDifficulty(key: string) {
    setSelectedDifficulties((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  }

  // Filter projects
  const results = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();

    return PROJECTS.filter((project) => {
      // Text search
      if (q) {
        const matchesTitle = project.title.toLowerCase().includes(q);
        const matchesDesc = project.description?.toLowerCase().includes(q);
        const matchesTags = project.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      // Category
      if (category && project.category !== category) return false;

      // Difficulty (from inline buttons OR advanced filters -- merge both)
      const allDifficulties = [
        ...new Set([...selectedDifficulties, ...advancedFilters.difficulty]),
      ];
      if (allDifficulties.length > 0 && !allDifficulties.includes(project.difficulty)) return false;

      // Time range
      if (!matchesTimeRange(project.estimated_time, advancedFilters.timeRange)) return false;

      // Tags (project must have at least one matching tag)
      if (advancedFilters.tags.length > 0) {
        const projectTags = project.tags ?? [];
        const hasMatch = advancedFilters.tags.some((t) => projectTags.includes(t));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [debouncedQuery, category, selectedDifficulties, advancedFilters]);

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
          placeholder="Search projects..."
          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
        />
      </motion.div>

      {/* Category pills */}
      <div className="mb-4">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {/* Difficulty toggles + Filter button */}
      <div className="flex items-center gap-2 mb-4">
        {DIFFICULTIES.map((d) => {
          const isActive = selectedDifficulties.includes(d.key);
          return (
            <button
              key={d.key}
              onClick={() => toggleDifficulty(d.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={{
                borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-colour)',
                backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: d.colour }}
              />
              {d.label}
            </button>
          );
        })}

        {/* Advanced filter button */}
        <button
          onClick={() => setSheetOpen(true)}
          className="relative ml-auto p-2 rounded-full border"
          style={{ borderColor: 'var(--border-colour)', color: 'var(--text-secondary)' }}
        >
          <SlidersHorizontal size={16} />
          {advancedFilterCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              {advancedFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Result count */}
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
        {results.length} project{results.length !== 1 ? 's' : ''} found
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
            {results.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
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
              No projects found
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your filters
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced filter sheet */}
      <FilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
      />
    </div>
  );
}
