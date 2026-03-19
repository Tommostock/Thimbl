'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface FilterState {
  timeRange: string[];
  tags: string[];
  difficulty: string[];
}

const TIME_RANGES = [
  { key: 'under-2h', label: 'Under 2h' },
  { key: '2-4h', label: '2-4h' },
  { key: '4-8h', label: '4-8h' },
  { key: '8h+', label: '8h+' },
];

const AVAILABLE_TAGS = [
  'home-decor',
  'wearable',
  'gift',
  'quick',
  'accessories',
  'baby',
  'holiday',
  'cosy',
  'fashion',
  'practical',
  'floral',
  'geometric',
];

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

const DEFAULT_FILTERS: FilterState = {
  timeRange: [],
  tags: [],
  difficulty: [],
};

export default function FilterSheet({ isOpen, onClose, filters, onApply }: FilterSheetProps) {
  const localFilters = { ...filters, timeRange: [...filters.timeRange], tags: [...filters.tags], difficulty: [...filters.difficulty] };

  function toggle(arr: string[], value: string): string[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-y-auto p-6"
            style={{ backgroundColor: 'var(--bg-primary)', maxHeight: '80vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Advanced Filters
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Time Range */}
            <FilterSection title="Time Range">
              <div className="flex flex-wrap gap-2">
                {TIME_RANGES.map((range) => (
                  <ToggleChip
                    key={range.key}
                    label={range.label}
                    active={localFilters.timeRange.includes(range.key)}
                    onClick={() => {
                      localFilters.timeRange = toggle(localFilters.timeRange, range.key);
                      onApply({ ...localFilters });
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Tags */}
            <FilterSection title="Tags">
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <ToggleChip
                    key={tag}
                    label={tag}
                    active={localFilters.tags.includes(tag)}
                    onClick={() => {
                      localFilters.tags = toggle(localFilters.tags, tag);
                      onApply({ ...localFilters });
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Apply + Reset */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold mt-6"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                onApply({ ...DEFAULT_FILTERS });
                onClose();
              }}
              className="w-full py-2 mt-2 text-sm font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              Reset All
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3
        className="text-sm font-semibold mb-2"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-secondary)',
        color: active ? '#fff' : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  );
}
