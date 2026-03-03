'use client';
/**
 * page.tsx — The main (and only) page of PassCheck
 *
 * This is the entry point of the app. It:
 *   1. Holds the top-level state (password, analysis, showFeedback)
 *   2. Analyses the password in real-time as the user types
 *   3. Passes data down to each component section
 *
 * In Next.js App Router, files named page.tsx inside the /app directory
 * automatically become URL routes. This is the root route (/).
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Our components
import PasswordInput    from '@/components/PasswordInput';
import StrengthMeter    from '@/components/StrengthMeter';
import AnalysisBadges   from '@/components/AnalysisBadges';
import AttackSimulator  from '@/components/AttackSimulator';
import FeedbackPanel    from '@/components/FeedbackPanel';

// Our logic library
import { analyzePassword, emptyAnalysis, PasswordAnalysis } from '@/lib/analyzer';

export default function Home() {
  // ── State ──────────────────────────────────────────────
  // The password the user has typed in the input field
  const [password, setPassword] = useState('');

  // The full analysis result (updates every keystroke)
  const [analysis, setAnalysis] = useState<PasswordAnalysis>(emptyAnalysis());

  // Whether to show the educational feedback panel (after simulation)
  const [showFeedback, setShowFeedback] = useState(false);

  // ── Handlers ───────────────────────────────────────────

  /**
   * handlePasswordChange — Called every time the user types in the input.
   * Runs the full password analysis immediately (all in the browser, instant).
   */
  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setAnalysis(analyzePassword(value));
    setShowFeedback(false); // Reset feedback if the user changes the password
  }, []);

  /**
   * handleSimulationComplete — Called by AttackSimulator when all 3 attacks finish.
   * Triggers the educational feedback panel to appear.
   */
  const handleSimulationComplete = useCallback(() => {
    setShowFeedback(true);
  }, []);

  // ── Render ─────────────────────────────────────────────
  return (
    <main className="min-h-screen w-full max-w-lg mx-auto px-4 py-6 space-y-4 pb-12">

      {/* ── App header ─────────────────────────────────────── */}
      <motion.header
        className="text-center pt-2 pb-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* App icon / logo */}
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 text-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,255,136,0.1))',
            border: '1px solid rgba(0,245,255,0.3)',
            boxShadow: '0 0 30px rgba(0,245,255,0.1)',
          }}
        >
          🗝️
        </div>

        <h1
          className="text-2xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #00F5FF, #00FF88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          PassCheck
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1 tracking-wide">
          Password Strength Simulator
        </p>
        <p className="text-[10px] text-[var(--text-dim)] mt-1">
          Educational · Private · Free
        </p>
      </motion.header>

      {/* ── Password input card ────────────────────────────── */}
      <motion.section
        className="glass-card p-4 space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Input field */}
        <PasswordInput
          value={password}
          onChange={handlePasswordChange}
        />

        {/* Strength meter — always visible, updates in real-time */}
        <StrengthMeter analysis={analysis} />

        {/* Character variety badges + pattern warnings */}
        <AnimatePresence>
          {password.length > 0 && (
            <AnalysisBadges analysis={analysis} />
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── How to use hint (shown only when no password entered) ── */}
      <AnimatePresence>
        {password.length === 0 && (
          <motion.div
            className="text-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xs text-[var(--text-dim)]">
              Type a test password above, then simulate attacks ↓
            </p>
            <p className="text-[10px] text-[var(--text-dim)] mt-1">
              Try: <span className="text-[var(--text-secondary)]">password123</span>
              {' '}vs{' '}
              <span className="text-[var(--text-secondary)]">X#9mK!vQ2@pL8</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Attack simulator section ────────────────────────── */}
      <motion.section
        className="space-y-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 px-1">
          <span className="text-base">⚔️</span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            Attack Simulation
          </h2>
        </div>

        <AttackSimulator
          analysis={analysis}
          onComplete={handleSimulationComplete}
        />
      </motion.section>

      {/* ── Educational feedback (shown after simulation) ──────── */}
      <AnimatePresence>
        {showFeedback && (
          <motion.section
            className="glass-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FeedbackPanel analysis={analysis} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="text-center pb-4 space-y-1">
        <p className="text-[10px] text-[var(--text-dim)]">
          🔒 All analysis runs locally in your browser
        </p>
        <p className="text-[10px] text-[var(--text-dim)]">
          No passwords are ever stored or transmitted
        </p>
        <p className="text-[10px] text-[var(--text-dim)] mt-2">
          PassCheck — Free & Open Educational Tool
        </p>
      </footer>
    </main>
  );
}
