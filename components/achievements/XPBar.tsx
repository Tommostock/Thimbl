'use client';

import { motion } from 'framer-motion';
import { getLevelForXP } from '@/lib/constants';

/**
 * XPBar Component
 *
 * Shows the user's current XP progress towards the next level.
 * Animated fill bar with level name and XP count.
 */

interface XPBarProps {
  totalXP: number;
  compact?: boolean;
}

export default function XPBar({ totalXP, compact = false }: XPBarProps) {
  const level = getLevelForXP(totalXP);
  const nextLevel = level.nextLevel;

  // Calculate progress to next level
  const progressXP = totalXP - level.minXP;
  const neededXP = nextLevel ? nextLevel.minXP - level.minXP : 1;
  const progress = nextLevel ? Math.min((progressXP / neededXP) * 100, 100) : 100;

  if (compact) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {level.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {totalXP} XP
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            {level.name}
          </span>
          {nextLevel && (
            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
              → {nextLevel.name}
            </span>
          )}
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {totalXP} XP
        </span>
      </div>
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {nextLevel && (
        <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-muted)' }}>
          {nextLevel.minXP - totalXP} XP to {nextLevel.name}
        </p>
      )}
    </div>
  );
}
