'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  BookOpen,
  Info,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Scissors,
} from 'lucide-react';
import type { PatternSection } from '@/lib/types/pattern';
import {
  formatSection,
  GLOSSARY,
  TOOLTIP_TERMS,
  type FormattedSection,
  type FormattedStep,
} from '@/lib/instruction-formatter';

// ---- localStorage key for step progress ----
const PROGRESS_KEY = 'thimbl_step_progress';

function getCheckedSteps(patternId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return new Set(data[patternId] || []);
  } catch {
    return new Set();
  }
}

function saveCheckedSteps(patternId: string, checked: Set<string>) {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    data[patternId] = Array.from(checked);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ---- Props ----

interface PatternInstructionsProps {
  sections: PatternSection[];
  patternId: string;
}

export default function PatternInstructions({ sections, patternId }: PatternInstructionsProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.length > 0 ? [0] : []),
  );
  const [showGlossary, setShowGlossary] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(() => getCheckedSteps(patternId));
  const [craftMode, setCraftMode] = useState(false);
  const [craftSectionIdx, setCraftSectionIdx] = useState(0);
  const [craftStepIdx, setCraftStepIdx] = useState(0);

  const formatted: FormattedSection[] = useMemo(() => {
    // Filter out tips/techniques sections before formatting
    const tipsPattern =
      /^(TIPS?\s*(AND|&)\s*TECHNIQUES?|KNITTING TIP|CROCHET TIP|CROCHET INFO|INCREASE TIP|DECREASE TIP|MAGIC CIRCLE|WORK IN THE ROUND|WORKING \d+ DC TOG|EXPLANATION|REMEMBER|TIPS?)$/i;
    const formattedHeadingPattern = /tips?\s*(&|and)\s*techniques?|magic circle|crochet (tip|info)|knitting tip|explanation/i;
    return sections
      .filter((s) => !tipsPattern.test(s.heading.trim()))
      .map((s) => formatSection(s.heading, s.content))
      .filter((s) => !formattedHeadingPattern.test(s.heading));
  }, [sections]);

  // Persist checked steps
  useEffect(() => {
    saveCheckedSteps(patternId, checkedSteps);
  }, [patternId, checkedSteps]);

  const toggleCheck = useCallback((stepId: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }, []);

  const toggle = (order: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  };

  // Craft mode navigation
  const allCraftSteps = useMemo(() => {
    const result: { section: FormattedSection; step: FormattedStep; sIdx: number; stIdx: number }[] = [];
    formatted.forEach((section, sIdx) => {
      section.steps.forEach((step, stIdx) => {
        result.push({ section, step, sIdx, stIdx });
      });
    });
    return result;
  }, [formatted]);

  const craftFlatIdx = useMemo(() => {
    let idx = 0;
    for (let s = 0; s < craftSectionIdx && s < formatted.length; s++) {
      idx += formatted[s].steps.length;
    }
    return idx + craftStepIdx;
  }, [craftSectionIdx, craftStepIdx, formatted]);

  const craftNext = useCallback(() => {
    if (craftFlatIdx + 1 < allCraftSteps.length) {
      const next = allCraftSteps[craftFlatIdx + 1];
      setCraftSectionIdx(next.sIdx);
      setCraftStepIdx(next.stIdx);
    }
  }, [craftFlatIdx, allCraftSteps]);

  const craftPrev = useCallback(() => {
    if (craftFlatIdx - 1 >= 0) {
      const prev = allCraftSteps[craftFlatIdx - 1];
      setCraftSectionIdx(prev.sIdx);
      setCraftStepIdx(prev.stIdx);
    }
  }, [craftFlatIdx, allCraftSteps]);

  if (sections.length === 0) return null;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            <BookOpen size={18} style={{ color: 'var(--accent-secondary)' }} />
            Pattern Instructions
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGlossary(!showGlossary)}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg min-h-[36px]"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary)' }}
            >
              <Info size={13} />
              Stitch Guide
            </button>
            {allCraftSteps.length > 0 && (
              <button
                onClick={() => setCraftMode(true)}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg min-h-[36px]"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
              >
                Start Crafting
              </button>
            )}
          </div>
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
                  Stitch & Term Guide
                </h3>
                {GLOSSARY.map((item) => (
                  <div key={item.term}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>
                      {item.term} ({item.short})
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
            const completedCount = section.steps.filter((s) => checkedSteps.has(s.id)).length;
            const progress = section.steps.length > 0 ? (completedCount / section.steps.length) * 100 : 0;

            return (
              <div
                key={idx}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                {/* Section header */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 min-h-[48px] text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {section.heading}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                      >
                        {completedCount}/{section.steps.length}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 ml-2"
                    >
                      <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                    </motion.div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: progress === 100 ? '#22C55E' : 'var(--accent-primary)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
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
                        {/* Materials note */}
                        {section.materialsNote && (
                          <div
                            className="flex items-center gap-2 text-xs font-medium p-2.5 rounded-lg mb-3"
                            style={{ backgroundColor: 'rgba(139,168,136,0.1)', color: '#6B8F68' }}
                          >
                            <Scissors size={14} className="shrink-0" />
                            {section.materialsNote}
                          </div>
                        )}

                        {/* Description */}
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
                          {section.steps.map((step) => (
                            <StepCard
                              key={step.id}
                              step={step}
                              checked={checkedSteps.has(step.id)}
                              onToggle={() => toggleCheck(step.id)}
                            />
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

      {/* ---- Craft Mode (full-screen step-by-step, swipeable) ---- */}
      <AnimatePresence>
        {craftMode && allCraftSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: '1px solid var(--border-colour)' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {allCraftSteps[craftFlatIdx]?.section.heading}
                </p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Step {craftFlatIdx + 1} of {allCraftSteps.length}
                </p>
              </div>
              <button
                onClick={() => setCraftMode(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                aria-label="Exit craft mode"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 shrink-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  width: `${((craftFlatIdx + 1) / allCraftSteps.length) * 100}%`,
                }}
              />
            </div>

            {/* Swipeable step content */}
            <motion.div
              key={craftFlatIdx}
              className="flex-1 flex items-center justify-center p-6 overflow-auto"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_e, info) => {
                if (info.offset.x < -50 && craftFlatIdx + 1 < allCraftSteps.length) {
                  // Auto-check current step on swipe forward
                  const step = allCraftSteps[craftFlatIdx]?.step;
                  if (step && !checkedSteps.has(step.id)) toggleCheck(step.id);
                  craftNext();
                } else if (info.offset.x > 50 && craftFlatIdx > 0) {
                  craftPrev();
                } else if (info.offset.x < -50 && craftFlatIdx + 1 >= allCraftSteps.length) {
                  // Last step — swipe to finish
                  const step = allCraftSteps[craftFlatIdx]?.step;
                  if (step && !checkedSteps.has(step.id)) toggleCheck(step.id);
                  setCraftMode(false);
                }
              }}
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-w-md w-full text-center select-none">
                {allCraftSteps[craftFlatIdx]?.step.stepNumber && (
                  <span
                    className="inline-block text-sm font-bold px-4 py-1.5 rounded-full mb-4"
                    style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                  >
                    {allCraftSteps[craftFlatIdx].step.stepNumber}
                  </span>
                )}

                {allCraftSteps[craftFlatIdx]?.step.shaping && (
                  <div className="flex justify-center mb-3">
                    {allCraftSteps[craftFlatIdx].step.shaping === 'increase' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                        <TrendingUp size={14} /> Increasing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                        <TrendingDown size={14} /> Decreasing
                      </span>
                    )}
                  </div>
                )}

                <p
                  className="text-lg leading-relaxed font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {allCraftSteps[craftFlatIdx]?.step.instruction}
                </p>

                {allCraftSteps[craftFlatIdx]?.step.stitchCount && (
                  <div className="mt-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full"
                      style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16A34A' }}
                    >
                      <Check size={16} />
                      {allCraftSteps[craftFlatIdx].step.stitchCount}
                    </span>
                  </div>
                )}

                {allCraftSteps[craftFlatIdx]?.step.note && (
                  <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    💡 {allCraftSteps[craftFlatIdx].step.note}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Swipe hint */}
            <div className="pb-8 pt-2 text-center shrink-0">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Swipe left for next step &middot; Swipe right to go back
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---- Step Card with checkbox + shaping + tooltip ----

function StepCard({
  step,
  checked,
  onToggle,
}: {
  step: FormattedStep;
  checked: boolean;
  onToggle: () => void;
}) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  // Render instruction with tappable glossary terms
  const renderInstruction = (text: string) => {
    const terms = Array.from(TOOLTIP_TERMS.keys());
    // Sort by length descending so longer matches take priority
    terms.sort((a, b) => b.length - a.length);

    const regex = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

    const parts: (string | { term: string; idx: number })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push({ term: match[0], idx: match.index });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));

    return parts.map((part, i) => {
      if (typeof part === 'string') return <span key={i}>{part}</span>;
      return (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            const def = TOOLTIP_TERMS.get(part.term.toLowerCase());
            setTooltip(tooltip === def ? null : (def ?? null));
          }}
          className="underline decoration-dotted decoration-1 underline-offset-2"
          style={{ color: 'var(--accent-primary)' }}
        >
          {part.term}
        </button>
      );
    });
  };

  return (
    <div
      className="rounded-lg p-3 transition-colors"
      style={{
        backgroundColor: checked ? 'rgba(34,197,94,0.06)' : 'var(--bg-primary)',
        opacity: checked ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="shrink-0 w-6 h-6 mt-0.5 rounded-md flex items-center justify-center transition-colors"
          style={{
            backgroundColor: checked ? '#22C55E' : 'transparent',
            border: checked ? 'none' : '2px solid var(--border-colour)',
            color: '#fff',
          }}
          aria-label={checked ? 'Uncheck step' : 'Check step as done'}
        >
          {checked && <Check size={14} />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Step number + shaping indicator */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {step.stepNumber && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
              >
                {step.stepNumber}
              </span>
            )}
            {step.shaping === 'increase' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                <TrendingUp size={10} /> increase
              </span>
            )}
            {step.shaping === 'decrease' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                <TrendingDown size={10} /> decrease
              </span>
            )}
          </div>

          {/* Instruction with tappable terms */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)', textDecoration: checked ? 'line-through' : 'none' }}
          >
            {renderInstruction(step.instruction)}
          </p>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-2 p-2.5 rounded-lg text-xs leading-relaxed"
                  style={{ backgroundColor: 'rgba(139,168,136,0.1)', color: 'var(--text-secondary)' }}
                >
                  {tooltip}
                  <button
                    onClick={() => setTooltip(null)}
                    className="ml-2 underline text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stitch count — prominent, own line */}
          {step.stitchCount && (
            <div className="mt-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16A34A' }}
              >
                <Check size={12} />
                You should have {step.stitchCount}
              </span>
            </div>
          )}

          {/* Note */}
          {step.note && (
            <div
              className="flex items-start gap-1.5 mt-2 text-xs leading-relaxed p-2 rounded-md"
              style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#B45309' }}
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
