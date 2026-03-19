'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StepItem } from '@/lib/types/database';

interface CraftModeProps {
  steps: StepItem[];
  projectTitle: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function CraftMode({ steps, projectTitle, onClose, onComplete }: CraftModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right

  const step = steps[currentIndex];
  const isLast = currentIndex === steps.length - 1;
  const isFirst = currentIndex === 0;

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);
  }, [isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (isFirst) return;
    setDirection(-1);
    setCurrentIndex((prev) => prev - 1);
  }, [isFirst]);

  const variants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Step {currentIndex + 1} of {steps.length}
          </p>
          <p
            className="text-sm font-medium truncate max-w-[250px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {projectTitle}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          aria-label="Close craft mode"
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center px-4 py-3">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 24 : 8,
              backgroundColor:
                i <= currentIndex ? 'var(--accent-primary)' : 'var(--border-colour)',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative px-4">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute inset-x-4 top-0"
          >
            <h2
              className="text-xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {step.title}
            </h2>
            <p
              className="text-base leading-relaxed mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {step.description}
            </p>
            {step.tip && (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                Tip: {step.tip}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-4 pb-8 pt-4">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px] transition-opacity disabled:opacity-30"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        <button
          onClick={goNext}
          className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
          style={{
            backgroundColor: isLast ? 'var(--accent-primary)' : 'var(--accent-secondary)',
            color: '#fff',
          }}
        >
          {isLast ? 'Finish' : 'Next'}
          {!isLast && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}
