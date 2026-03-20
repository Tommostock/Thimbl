'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUnlockedAchievements } from '@/lib/storage';
import { ACHIEVEMENTS } from '@/lib/achievements';
import BadgeGrid from '@/components/profile/BadgeGrid';

/**
 * Achievements Page
 *
 * Grid of all achievements — unlocked ones glow, locked are greyed out.
 * Uses the shared BadgeGrid component for rendering.
 * Data comes from hardcoded ACHIEVEMENTS array + localStorage unlock status.
 */

export default function AchievementsPage() {
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    setUnlocked(getUnlockedAchievements());
  }, []);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="px-4 pt-6 pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Achievements
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {unlockedCount} of {totalCount} unlocked
        </p>
      </motion.div>

      {/* Progress bar */}
      <div
        className="rounded-xl p-4 mb-5"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Collection Progress
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
            {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Achievement grid */}
      <BadgeGrid achievements={ACHIEVEMENTS} unlockedIds={unlocked} />
    </div>
  );
}
