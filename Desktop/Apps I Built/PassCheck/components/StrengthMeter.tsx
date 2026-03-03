'use client';
/**
 * StrengthMeter.tsx — Animated password strength indicator
 *
 * Shows:
 *   - A colour-coded progress bar that fills as strength increases
 *   - The strength label (Very Weak → Very Strong)
 *   - The entropy in bits
 *   - The character set size
 */

import { motion } from 'framer-motion';
import { PasswordAnalysis } from '@/lib/analyzer';

interface Props {
  analysis: PasswordAnalysis;
}

export default function StrengthMeter({ analysis }: Props) {
  const { score, label, color, entropy, charsetSize, length } = analysis;

  // Map score to a number of filled "segments" out of 5
  const segments = 5;
  const filledSegments = Math.ceil((score / 100) * segments);

  // Segment colours from weakest to strongest
  const segmentColors = ['#FF4466', '#FF8C42', '#FFD700', '#4488FF', '#00FF88'];

  return (
    <div className="space-y-3">

      {/* ── Segmented strength bar ────────────────────────── */}
      <div className="flex gap-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            className="h-2 flex-1 rounded-full"
            style={{
              backgroundColor: i < filledSegments ? segmentColors[i] : 'rgba(255,255,255,0.08)',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: length > 0 ? 1 : 0,
              opacity: length > 0 ? 1 : 0,
            }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          />
        ))}
      </div>

      {/* ── Label + score ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <motion.span
          className="text-sm font-semibold tracking-wider uppercase"
          style={{ color: length > 0 ? color : 'var(--text-dim)' }}
          key={label} // re-animate when label changes
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {length > 0 ? label : 'Enter a password'}
        </motion.span>

        {length > 0 && (
          <span className="text-xs text-[var(--text-dim)] font-mono">
            {score.toFixed(0)}/100
          </span>
        )}
      </div>

      {/* ── Stats row: entropy, charset, length ───────────── */}
      {length > 0 && (
        <motion.div
          className="grid grid-cols-3 gap-2 pt-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <StatChip label="Entropy" value={`${entropy.toFixed(1)} bits`} />
          <StatChip label="Charset" value={`${charsetSize} chars`} />
          <StatChip label="Length"  value={`${length} chars`} />
        </motion.div>
      )}
    </div>
  );
}

/** A small stat display chip */
function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-xs font-mono text-[var(--text-primary)] font-medium">{value}</div>
    </div>
  );
}
