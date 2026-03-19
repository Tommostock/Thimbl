'use client';

import { CATEGORIES } from '@/lib/constants';

interface CategoryPillsProps {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

export default function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* "All" pill */}
      <button
        onClick={() => onSelect(null)}
        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
        style={{
          backgroundColor: selected === null ? 'var(--accent-primary)' : 'var(--bg-secondary)',
          color: selected === null ? '#fff' : 'var(--text-secondary)',
        }}
      >
        All
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
          style={{
            backgroundColor: selected === cat.key ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: selected === cat.key ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
