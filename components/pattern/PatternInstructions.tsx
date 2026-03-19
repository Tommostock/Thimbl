'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import type { PatternSection } from '@/lib/types/pattern';

interface PatternInstructionsProps {
  sections: PatternSection[];
}

export default function PatternInstructions({ sections }: PatternInstructionsProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(
    // Open first section by default
    new Set(sections.length > 0 ? [0] : []),
  );

  if (sections.length === 0) return null;

  const toggle = (order: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  };

  return (
    <div>
      <h2
        className="text-lg font-bold mb-3 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        <BookOpen size={18} style={{ color: 'var(--accent-secondary)' }} />
        Pattern Instructions
      </h2>

      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = openSections.has(section.order);
          return (
            <div
              key={section.order}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <button
                onClick={() => toggle(section.order)}
                className="w-full flex items-center justify-between p-4 min-h-[44px]"
              >
                <span
                  className="text-sm font-semibold text-left"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {section.heading}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 ml-2"
                >
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {section.content}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
