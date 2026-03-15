'use client';

import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants';

/**
 * CategoryFilter
 *
 * Horizontal scrollable filter chips for craft categories.
 * Includes an "All" option. Tapping a chip filters the catalogue.
 */

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const allCategories = [{ key: null, label: 'All', emoji: '✨' }, ...CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => {
        const isActive = selected === cat.key;
        return (
          <motion.button
            key={cat.key ?? 'all'}
            onClick={() => onSelect(cat.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border transition-colors min-h-[44px]"
            style={{
              backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-colour)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
