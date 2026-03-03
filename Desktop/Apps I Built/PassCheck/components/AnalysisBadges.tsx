'use client';
/**
 * AnalysisBadges.tsx — Character variety badges + pattern warnings
 *
 * Shows two rows:
 *   1. Character type badges (a-z, A-Z, 0-9, !@#) — lit up if present
 *   2. Pattern warning chips — shown when weaknesses are detected
 */

import { motion, AnimatePresence } from 'framer-motion';
import { PasswordAnalysis } from '@/lib/analyzer';

interface Props {
  analysis: PasswordAnalysis;
}

// ─────────────────────────────────────────────────────────
// CHARACTER TYPE BADGES
// ─────────────────────────────────────────────────────────
const CHAR_TYPES = [
  { key: 'lower',  label: 'a–z',  description: 'Lowercase' },
  { key: 'upper',  label: 'A–Z',  description: 'Uppercase' },
  { key: 'digit',  label: '0–9',  description: 'Numbers'   },
  { key: 'symbol', label: '!@#',  description: 'Symbols'   },
] as const;

// ─────────────────────────────────────────────────────────
// PATTERN WARNINGS
// ─────────────────────────────────────────────────────────
const PATTERN_WARNINGS = [
  {
    key: 'isCommonPassword',
    label: '⚠ Common password',
    tip: 'This password appears in breach databases. Attackers try these first.',
  },
  {
    key: 'hasKeyboardWalk',
    label: '⌨ Keyboard pattern',
    tip: 'Sequences like "qwerty" or "asdfgh" are tried by all modern crackers.',
  },
  {
    key: 'hasRepeats',
    label: '🔁 Repeated chars',
    tip: 'Repetitions like "aaa" or "111" reduce effective password length.',
  },
  {
    key: 'hasSequential',
    label: '↗ Sequential',
    tip: 'Sequences like "abc" or "123" are quick to guess.',
  },
  {
    key: 'hasLeetSpeak',
    label: '🔤 Leet speak',
    tip: '"p@ssw0rd" looks clever but attackers know all substitution rules.',
  },
  {
    key: 'hasCommonSuffix',
    label: '🔚 Common suffix',
    tip: 'Ending with "123" or "!" is always tried. It adds almost no security.',
  },
] as const;

export default function AnalysisBadges({ analysis }: Props) {
  if (analysis.length === 0) return null;

  const activeWarnings = PATTERN_WARNINGS.filter(
    p => analysis.patterns[p.key]
  );

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Character type badges ────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {CHAR_TYPES.map(({ key, label, description }) => {
          const active = analysis.has[key];
          return (
            <motion.div
              key={key}
              title={description}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all duration-300"
              style={{
                background: active
                  ? 'rgba(0, 245, 255, 0.12)'
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: active
                  ? 'rgba(0, 245, 255, 0.4)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: active ? '#00F5FF' : 'var(--text-dim)',
              }}
              animate={{ scale: active ? 1 : 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Indicator dot */}
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: active ? '#00F5FF' : 'var(--text-dim)' }}
              />
              {label}
            </motion.div>
          );
        })}
      </div>

      {/* ── Pattern warnings ─────────────────────────────── */}
      <AnimatePresence>
        {activeWarnings.map((warning, i) => (
          <motion.div
            key={warning.key}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
              style={{
                background: 'rgba(255, 68, 102, 0.08)',
                border: '1px solid rgba(255, 68, 102, 0.2)',
              }}
            >
              <span className="font-semibold text-[#FF4466] shrink-0 mt-px">
                {warning.label}
              </span>
              <span className="text-[var(--text-secondary)]">{warning.tip}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
