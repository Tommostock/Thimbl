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
  const [expanded, setExpanded] = useState(true);

  if (materials.length === 0 && needles.length === 0 && !gauge) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 min-h-[44px]"
      >
        <span
          className="text-base font-bold flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          <Scissors size={18} style={{ color: 'var(--accent-secondary)' }} />
          Materials & Tools
        </span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Gauge */}
              {gauge && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--accent-primary)' }}>
                    Tension / Gauge
                  </span>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {gauge.description}
                  </p>
                </div>
              )}

              {/* Yarn */}
              {materials.length > 0 && (
                <div>
                  <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--accent-primary)' }}>
                    Yarn
                  </span>
                  {materials.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {m.yarnName}
                      </p>
                      {m.details && (
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {m.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Needles */}
              {needles.length > 0 && (
                <div>
                  <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--accent-primary)' }}>
                    Needles / Hooks
                  </span>
                  {needles.map((n, i) => (
                    <p key={i} className="text-sm py-1" style={{ color: 'var(--text-secondary)' }}>
                      {n}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
