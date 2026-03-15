'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Lock,
  Scissors,
  Layers,
  Heart,
  Zap,
  Anchor,
  Camera,
  Star,
  Moon,
  Clock,
  ShoppingBag,
  Timer,
  Trophy,
  Palette,
  Flame,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Achievement, UserAchievement } from '@/lib/types/database';

/**
 * Achievements Page
 *
 * Grid of all achievements — unlocked ones are colourful, locked are greyed out.
 */

// Map achievement icon names to Lucide components
const iconMap: Record<string, typeof Award> = {
  scissors: Scissors,
  layers: Layers,
  heart: Heart,
  zap: Zap,
  anchor: Anchor,
  camera: Camera,
  star: Star,
  moon: Moon,
  clock: Clock,
  'shopping-bag': ShoppingBag,
  timer: Timer,
  trophy: Trophy,
  palette: Palette,
  flame: Flame,
  'check-circle': CheckCircle,
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch all achievement definitions
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward');

      setAchievements((allAchievements as Achievement[]) ?? []);

      // Fetch user's unlocked achievements
      if (user) {
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);

        const unlockedIds = new Set(
          (userAchievements ?? []).map((ua: { achievement_id: string }) => ua.achievement_id)
        );
        setUnlocked(unlockedIds);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const unlockedCount = unlocked.size;
  const totalCount = achievements.length;

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
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
      {totalCount > 0 && (
        <div className="card p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Collection Progress
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Achievement grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => {
            const isUnlocked = unlocked.has(achievement.id);
            const Icon = iconMap[achievement.icon ?? ''] ?? Award;

            return (
              <motion.div
                key={achievement.id}
                className="card p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                style={{
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-2 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: isUnlocked ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  }}
                >
                  {isUnlocked ? (
                    <Icon size={24} className="text-white" />
                  ) : (
                    <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <h3
                  className="font-semibold text-sm mb-0.5"
                  style={{ color: 'var(--text-primary)' }}
                >
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
      )}
    </div>
  );
}
