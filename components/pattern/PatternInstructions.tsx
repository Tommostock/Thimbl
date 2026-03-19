'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Info } from 'lucide-react';
import type { PatternSection } from '@/lib/types/pattern';
import { formatSection, GLOSSARY, type FormattedSection, type FormattedStep } from '@/lib/instruction-formatter';

interface PatternInstructionsProps {
  sections: PatternSection[];
}

export default function PatternInstructions({ sections }: PatternInstructionsProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.length > 0 ? [0] : []),
  );
  const [showGlossary, setShowGlossary] = useState(false);

  const formatted: FormattedSection[] = useMemo(
    () => sections.map((s) => formatSection(s.heading, s.content)),
    [sections],
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
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-lg font-bold flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          <BookOpen size={18} style={{ color: 'var(--accent-secondary)' }} />
          Pattern Instructions
        </h2>
        <button
          onClick={() => setShowGlossary(!showGlossary)}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg min-h-[36px]"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary)' }}
        >
          <Info size={14} />
          Stitch Guide
        </button>
      </div>

      {/* Glossary */}
      <AnimatePresence>
        {showGlossary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="rounded-xl p-4 space-y-2.5"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-colour)' }}
            >
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                📖 Stitch & Term Guide
              </h3>
              {GLOSSARY.map((item) => (
                <div key={item.term}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {item.term}
                  </span>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections */}
      <div className="space-y-3">
        {formatted.map((section, idx) => {
          const isOpen = openSections.has(idx);
          return (
            <div
              key={idx}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {/* Section header */}
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 min-h-[48px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold text-left"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {section.heading}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  >
                    {section.steps.length} step{section.steps.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 ml-2"
                >
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </motion.div>
              </button>

              {/* Section content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {/* Section description */}
                      {section.description && (
                        <p
                          className="text-sm leading-relaxed mb-4 p-3 rounded-lg"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-secondary)',
                            borderLeft: '3px solid var(--accent-primary)',
                          }}
                        >
                          {section.description}
                        </p>
                      )}

                      {/* Steps */}
                      <div className="space-y-2">
                        {section.steps.map((step, i) => (
                          <StepCard key={i} step={step} />
                        ))}
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

function StepCard({ step }: { step: FormattedStep }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="flex items-start gap-3">
        {/* Step number badge */}
        {step.stepNumber && (
          <span
            className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-md mt-0.5"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              minWidth: 'fit-content',
            }}
          >
            {step.stepNumber}
          </span>
        )}

        {/* Instruction text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {step.instruction}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Stitch count badge */}
            {step.stitchCount && (
              <span
                className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(139,168,136,0.15)',
                  color: '#6B8F68',
                }}
              >
                ✓ {step.stitchCount}
              </span>
            )}
          </div>

          {/* Beginner note */}
          {step.note && (
            <div
              className="flex items-start gap-1.5 mt-2 text-xs leading-relaxed p-2 rounded-md"
              style={{
                backgroundColor: 'rgba(245,158,11,0.08)',
                color: '#B45309',
              }}
            >
              <span className="shrink-0">💡</span>
              <span>{step.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
