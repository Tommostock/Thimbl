'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, LogOut, Award, Layers } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getStorage } from '@/lib/storage';
import { getLevelForXP } from '@/lib/constants';
import type { StoredStats } from '@/lib/storage';

/**
 * Profile Page
 *
 * Shows the user's name, level, stats, and settings.
 * All data sourced from localStorage.
 */

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<StoredStats | null>(null);
  const [projectCounts, setProjectCounts] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    const { userStats, userProjects } = getStorage();
    setStats(userStats);
    setProjectCounts({
      total: userProjects.length,
      completed: userProjects.filter((p) => p.status === 'completed').length,
    });
  }, []);

  const totalXP = stats?.total_xp ?? 0;
  const level = getLevelForXP(totalXP);
  const nextLevel = level.nextLevel;
  const progressXP = totalXP - level.minXP;
  const neededXP = nextLevel ? nextLevel.minXP - level.minXP : 1;
  const progress = nextLevel ? Math.min((progressXP / neededXP) * 100, 100) : 100;

  return (
    <div className="px-4 pt-6 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl font-bold mb-5"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Profile
        </h1>
      </motion.div>

      {/* Avatar + name */}
      <motion.div
        className="card p-5 mb-4 flex items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          🧵
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            {user?.display_name ?? 'Crafter'}
          </h2>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            <Award size={12} />
            {level.name}
          </span>
        </div>
      </motion.div>

      {/* XP bar */}
      {stats && (
        <motion.div
          className="card p-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {level.name}
              {nextLevel && (
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  → {nextLevel.name}
                </span>
              )}
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
              {totalXP} XP
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
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
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: 'Projects', value: projectCounts.total },
          { label: 'Completed', value: projectCounts.completed },
          { label: 'Streak', value: `${stats?.current_streak ?? 0}d` },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <p className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Settings */}
      <motion.div
        className="card divide-y"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ borderColor: 'var(--border-colour-light)' }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 min-h-[52px]"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun size={20} style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <Moon size={20} style={{ color: 'var(--accent-primary)' }} />
            )}
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </span>
          </div>
        </button>

        {/* Achievements link */}
        <a
          href="/achievements"
          className="w-full flex items-center justify-between p-4 min-h-[52px]"
        >
          <div className="flex items-center gap-3">
            <Layers size={20} style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              View Achievements
            </span>
          </div>
        </a>

        {/* Sign out / reset */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 p-4 min-h-[52px]"
        >
          <LogOut size={20} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Reset & Start Over
          </span>
        </button>
      </motion.div>
    </div>
  );
}
