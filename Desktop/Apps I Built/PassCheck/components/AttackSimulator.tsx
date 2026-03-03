'use client';
/**
 * AttackSimulator.tsx — Orchestrates all three attack simulations
 *
 * This component:
 *   1. Runs all three attacks sequentially when triggered
 *   2. Maintains the state for each individual AttackCard
 *   3. Shows crack time estimates from crackTime.ts
 *   4. Displays per-scenario crack times in a summary table
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AttackCard from './AttackCard';
import { PasswordAnalysis } from '@/lib/analyzer';
import { AttackState, runDictionaryAttack, runHybridAttack, runBruteForce } from '@/lib/attacks';
import { estimateCrackTimes } from '@/lib/crackTime';

interface Props {
  analysis: PasswordAnalysis;
  onComplete: () => void;  // Called when all attacks finish — triggers feedback panel
}

// Default idle state for each card
const IDLE: AttackState = {
  status: 'idle',
  progress: 0,
  currentAttempt: '',
  attemptsCount: 0,
  result: '',
};

export default function AttackSimulator({ analysis, onComplete }: Props) {
  // Track the state of each attack card independently
  const [dictState,   setDictState]   = useState<AttackState>(IDLE);
  const [hybridState, setHybridState] = useState<AttackState>(IDLE);
  const [bruteState,  setBruteState]  = useState<AttackState>(IDLE);
  const [isRunning,   setIsRunning]   = useState(false);
  const [isDone,      setIsDone]      = useState(false);

  const crackTimes = estimateCrackTimes(analysis.entropy);

  /**
   * runSimulation — Runs all three attacks in sequence.
   * Each attack completes before the next one starts.
   */
  const runSimulation = useCallback(async () => {
    if (isRunning || analysis.length === 0) return;

    // Reset all cards to idle
    setDictState(IDLE);
    setHybridState(IDLE);
    setBruteState(IDLE);
    setIsDone(false);
    setIsRunning(true);

    // ── Attack 1: Dictionary ─────────────────────────────
    await runDictionaryAttack(analysis, setDictState);

    // Short pause between attacks for UX clarity
    await new Promise(r => setTimeout(r, 600));

    // ── Attack 2: Hybrid ─────────────────────────────────
    await runHybridAttack(analysis, setHybridState);

    await new Promise(r => setTimeout(r, 600));

    // ── Attack 3: Brute Force ────────────────────────────
    // Brute force is instant (we just calculate the math)
    const bruteResult = runBruteForce(analysis);
    setBruteState(bruteResult);

    setIsRunning(false);
    setIsDone(true);

    // Tell the parent page to show the educational feedback
    onComplete();
  }, [analysis, isRunning, onComplete]);

  return (
    <div className="space-y-4">

      {/* ── Simulate button ───────────────────────────────── */}
      <motion.button
        onClick={runSimulation}
        disabled={isRunning || analysis.length === 0}
        className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase relative overflow-hidden"
        style={{
          background: isRunning
            ? 'rgba(0, 245, 255, 0.08)'
            : analysis.length === 0
            ? 'rgba(255,255,255,0.04)'
            : 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,255,136,0.1))',
          border: '1px solid',
          borderColor: isRunning
            ? 'rgba(0, 245, 255, 0.3)'
            : analysis.length === 0
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0, 245, 255, 0.5)',
          color: analysis.length === 0
            ? 'var(--text-dim)'
            : '#00F5FF',
        }}
        whileTap={{ scale: analysis.length > 0 && !isRunning ? 0.98 : 1 }}
        transition={{ duration: 0.1 }}
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            Simulating attacks...
          </span>
        ) : isDone ? (
          '⟳ Run simulation again'
        ) : (
          '⚡ Simulate attacks'
        )}
      </motion.button>

      {/* ── Attack cards ─────────────────────────────────── */}
      <AnimatePresence>
        {(dictState.status !== 'idle' || isRunning) && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AttackCard
              title="Dictionary Attack"
              icon="📖"
              description="Checks against a list of common & breached passwords"
              state={dictState}
              delay={0}
            />
            <AttackCard
              title="Hybrid Attack"
              icon="🔀"
              description="Dictionary words combined with numbers & symbols"
              state={hybridState}
              delay={0.05}
            />
            <AttackCard
              title="Brute Force"
              icon="💻"
              description="Every possible combination — guaranteed to crack eventually"
              state={bruteState}
              delay={0.1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Crack time summary table ──────────────────────── */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            className="glass-card p-4 space-y-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              Crack Time Estimates
            </h3>
            <div className="space-y-2">
              {crackTimes.map(({ scenario, timeString, isSafe }) => (
                <div
                  key={scenario.label}
                  className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{scenario.icon}</span>
                      <span className="text-xs text-[var(--text-primary)]">{scenario.label}</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-dim)] ml-5">{scenario.subtitle}</div>
                  </div>
                  <span
                    className="text-xs font-mono font-semibold shrink-0"
                    style={{ color: isSafe ? '#00FF88' : '#FF4466' }}
                  >
                    {timeString}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
