'use client';
/**
 * AttackCard.tsx — A single animated attack simulation card
 *
 * Each card displays:
 *   - Attack type header + icon
 *   - A scrolling terminal showing what's being "tried"
 *   - An animated progress bar
 *   - An attempt counter
 *   - A final result badge (CRACKED or RESISTANT)
 *   - An explanation of how this attack works
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AttackState } from '@/lib/attacks';

interface Props {
  title: string;
  icon: string;
  description: string;      // Short explanation shown in the card header
  state: AttackState;
  delay?: number;           // Animation stagger delay
}

export default function AttackCard({ title, icon, description, state, delay = 0 }: Props) {
  const isRunning   = state.status === 'running';
  const isCracked   = state.status === 'cracked';
  const isResistant = state.status === 'resistant';
  const isDone      = isCracked || isResistant;

  // Border colour changes based on result
  const borderColor = isCracked
    ? 'rgba(255, 68, 102, 0.4)'
    : isResistant
    ? 'rgba(0, 255, 136, 0.3)'
    : 'rgba(42, 42, 58, 0.8)';

  const headerColor = isCracked
    ? '#FF4466'
    : isResistant
    ? '#00FF88'
    : '#00F5FF';

  return (
    <motion.div
      className="glass-card p-4 space-y-3"
      style={{ borderColor }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h3
              className="text-sm font-bold tracking-wider uppercase"
              style={{ color: headerColor }}
            >
              {title}
            </h3>
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{description}</p>
          </div>
        </div>

        {/* Status badge */}
        <AnimatePresence mode="wait">
          {isRunning && (
            <motion.span
              key="running"
              className="badge-running shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              RUNNING
            </motion.span>
          )}
          {isCracked && (
            <motion.span
              key="cracked"
              className="badge-cracked shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              CRACKED
            </motion.span>
          )}
          {isResistant && (
            <motion.span
              key="resistant"
              className="badge-resistant shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              RESISTANT
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Terminal display ─────────────────────────────── */}
      {(isRunning || isDone) && (
        <div
          className="rounded-xl p-3 font-mono text-xs space-y-1"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-[var(--text-dim)] text-[10px] mb-2">
            {'>'} attack terminal
          </div>
          <div className="terminal-text">
            {isRunning ? (
              <span className="cursor-blink">
                {'>'} trying: {state.currentAttempt}
              </span>
            ) : (
              <span style={{ color: isCracked ? '#FF4466' : '#00FF88' }}>
                {'>'} {isCracked ? '✗ MATCH FOUND' : '✓ NO MATCH'}: {state.currentAttempt}
              </span>
            )}
          </div>
          {state.attemptsCount > 0 && (
            <div className="text-[var(--text-dim)] text-[10px] mt-1 pt-1 border-t border-white/5">
              {state.attemptsCount.toLocaleString()} attempts
              {state.crackedIn && (
                <span className="ml-2 text-[#FF4466]">cracked in {state.crackedIn}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Progress bar ─────────────────────────────────── */}
      {(isRunning || isDone) && (
        <div className="space-y-1">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isCracked
                  ? 'linear-gradient(90deg, #FF4466, #ff8899)'
                  : isResistant
                  ? 'linear-gradient(90deg, #00FF88, #00ccaa)'
                  : 'linear-gradient(90deg, #00F5FF, #0088ff)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${state.progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--text-dim)]">
            <span>0%</span>
            <span>{state.progress}%</span>
          </div>
        </div>
      )}

      {/* ── Final result message ──────────────────────────── */}
      <AnimatePresence>
        {isDone && state.result && (
          <motion.p
            className="text-[11px] text-[var(--text-secondary)] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {state.result}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
