'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Scissors } from 'lucide-react';
import type { PatternMaterial } from '@/lib/types/pattern';

interface MaterialsListProps {
  materials: PatternMaterial[];
  needles: string[];
  gauge: { description: string } | null;
}

export default function MaterialsList({ materials, needles, gauge }: MaterialsListProps) {
  const [expanded, setExpanded] = useState(false);

  if (materials.length === 0 && needles.length === 0 && !gauge) return null;

  // Count total items for the badge
  const itemCount = materials.length + needles.length + (gauge ? 1 : 0);

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header — matches PatternInstructions section header style */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 min-h-[48px] text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Materials & Tools
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}
            >
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 ml-2"
          >
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {/* Gauge */}
              {gauge && (
                <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                        >
                          Gauge
                        </span>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {gauge.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Yarn */}
              {materials.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: '#8BA888', color: '#fff' }}
                        >
                          Yarn
                        </span>
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {m.yarnName}
                      </p>
                      {m.details && (
                        <p
                          className="text-xs mt-1 leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {m.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Needles / Hooks */}
              {needles.length > 0 && (
                <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: '#D4A0A0', color: '#fff' }}
                    >
                      Tools
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {needles.map((n, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                        />
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {n}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
