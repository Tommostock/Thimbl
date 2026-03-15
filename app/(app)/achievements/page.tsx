'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Lock, Scissors, Layers, Heart, Zap, Anchor, Camera, Star,
  Moon, Clock, ShoppingBag, Timer, Trophy, Palette, Flame, CheckCircle,
} from 'lucide-react';
import { getUnlockedAchievements } from '@/lib/storage';
import { ACHIEVEMENTS } from '@/lib/data';
import type { Achievement } from '@/lib/types/database';

/**
 * Achievements Page
 *
 * Grid of all achievements — unlocked ones are colourful, locked are greyed out.
 * Data comes from hardcoded ACHIEVEMENTS array + localStorage unlock status.
 */

const iconMap: Record<string, typeof Award> = {
  scissors: Scissors, layers: Layers, heart: Heart, zap: Zap,
  anchor: Anchor, camera: Camera, star: Star, moon: Moon, clock: Clock,
  'shopping-bag': ShoppingBag, timer: Timer, trophy: Trophy,
  palette: Palette, flame: Flame, 'check-circle': CheckCircle,
};

export default function AchievementsPage() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    setUnlocked(new Set(getUnlockedAchievements()));
  }, []);

  const unlockedCount = unlocked.size;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="px-4 pt-6 pb-4">
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

      {/* Progress */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Collection Progress
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
            {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
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
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((achievement: Achievement, index: number) => {
          const isUnlocked = unlocked.has(achievement.id);
          const Icon = iconMap[achievement.icon ?? ''] ?? Award;

          return (
            <motion.div
              key={achievement.id}
              className="card p-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              style={{ opacity: isUnlocked ? 1 : 0.5 }}
            >
              <div
                className="w-14 h-14 mx-auto mb-2 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: isUnlocked ? 'var(--accent-primary)' : 'var(--bg-secondary)' }}
              >
                {isUnlocked ? (
                  <Icon size={24} className="text-white" />
                ) : (
                  <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {achievement.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {achievement.description}
              </p>
              <span
                className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: isUnlocked ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: isUnlocked ? '#fff' : 'var(--text-muted)',
                }}
              >
                +{achievement.xp_reward} XP
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
