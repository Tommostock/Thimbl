'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Award,
  Scissors,
  Clock,
  Camera,
  LogOut,
  Sun,
  Moon,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getLevelForXP } from '@/lib/constants';
import type { UserStats, Profile } from '@/lib/types/database';

/**
 * Profile Page
 *
 * Shows user stats, level, theme toggle, and account management.
 */

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const supabase = createClient();

      const [{ data: statsData }, { data: profileData }] = await Promise.all([
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ]);

      setStats(statsData as UserStats | null);
      setProfile(profileData as Profile | null);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'Crafter';
  const xp = stats?.total_xp ?? 0;
  const level = getLevelForXP(xp);

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Profile header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <User size={36} className="text-white" />
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          {displayName}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--accent-primary)' }}>
          Level {level.index + 1} — {level.name}
        </p>
      </motion.div>

      {/* XP progress */}
      <motion.div
        className="card p-4 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {xp} XP
          </span>
          {level.nextLevel && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {level.nextLevel.minXP - xp} XP to {level.nextLevel.name}
            </span>
          )}
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: level.nextLevel
                ? `${((xp - level.minXP) / (level.nextLevel.minXP - level.minXP)) * 100}%`
                : '100%',
              backgroundColor: 'var(--accent-primary)',
            }}
          />
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { icon: Scissors, label: 'Projects', value: `${stats?.level ?? 0}` },
          { icon: Award, label: 'Streak', value: `${stats?.current_streak ?? 0} days` },
          { icon: Clock, label: 'Total XP', value: `${xp}` },
          { icon: Camera, label: 'Level', value: level.name },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 flex items-center gap-3">
            <stat.icon size={20} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2
          className="text-base font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Settings
        </h2>

        <div className="card divide-y" style={{ borderColor: 'var(--border-colour-light)' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Moon size={20} style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Sun size={20} style={{ color: 'var(--text-secondary)' }} />
              )}
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Achievements link */}
          <button
            onClick={() => router.push('/achievements')}
            className="w-full flex items-center justify-between p-4 min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <Award size={20} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Achievements
              </span>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 min-h-[44px]"
          >
            <LogOut size={20} style={{ color: '#C0392B' }} />
            <span className="text-sm" style={{ color: '#C0392B' }}>
              Sign Out
            </span>
          </button>
        </div>
      </motion.div>

      {/* Email */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
        {user?.email}
      </p>
    </div>
  );
}
