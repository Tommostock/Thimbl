'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Star } from 'lucide-react';
import { getStorage } from '@/lib/storage';
import { getLevelForXP, CATEGORIES } from '@/lib/constants';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { computeSkillStats, type SkillStats } from '@/lib/skills';
import type { StoredStats, StoredProfile } from '@/lib/storage';
import type { JournalEntry } from '@/lib/types/database';
import SectionHeader from '@/components/home/SectionHeader';
import BadgeGrid from '@/components/profile/BadgeGrid';

export default function ProfilePage() {
  const [stats, setStats] = useState<StoredStats | null>(null);
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [skillStats, setSkillStats] = useState<SkillStats | null>(null);

  useEffect(() => {
    const storage = getStorage();
    setStats(storage.userStats);
    setProfile(storage.profile);
    setFavorites(storage.favorites);
    setJournalEntries(storage.journalEntries);
    setUnlockedIds(storage.unlockedAchievements);
    setSkillStats(computeSkillStats(storage.journalEntries));
  }, []);

  const totalXP = stats?.total_xp ?? 0;
  const level = getLevelForXP(totalXP);
  const nextLevel = level.nextLevel;
  const progressXP = totalXP - level.minXP;
  const neededXP = nextLevel ? nextLevel.minXP - level.minXP : 1;
  const progress = nextLevel ? Math.min((progressXP / neededXP) * 100, 100) : 100;

  const favouriteCategory = CATEGORIES.find(
    (c) => c.key === profile?.favourite_category,
  );

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl font-bold mb-5"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Profile
        </h1>
      </motion.div>

      {/* 1. Name */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2
          className="text-3xl"
          style={{ fontFamily: 'var(--font-calligraphy)', color: 'var(--accent-primary)' }}
        >
          For Nanny Joe-Joe
        </h2>
        {favouriteCategory && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {favouriteCategory.emoji} {favouriteCategory.label}
          </p>
        )}
      </motion.div>

      {/* 2. Crafter Level card */}
      <motion.div
        className="rounded-xl p-5 mb-6 text-white"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            {level.name}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
            Lvl {level.index + 1}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        {nextLevel ? (
          <p className="text-sm mt-2 opacity-80">
            {progressXP} / {neededXP} XP to next level
          </p>
        ) : (
          <p className="text-sm mt-2 opacity-80">Max level reached!</p>
        )}
      </motion.div>

      {/* 3. Stats grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: 'Favourites', value: favorites.length },
          { label: 'Journal Entries', value: journalEntries.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* 4. Crafting Journey */}
      {journalEntries.length > 0 && skillStats && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SectionHeader title="Crafting Journey" />
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Sessions', value: skillStats.totalSessions, icon: BookOpen },
              { label: 'Unique Patterns', value: skillStats.uniquePatterns, icon: Layers },
              { label: 'Avg Rating', value: skillStats.averageRating, icon: Star },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <stat.icon
                  size={16}
                  className="mx-auto mb-1"
                  style={{ color: 'var(--accent-primary)' }}
                />
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 5. Crafting Skills (per-category badges) */}
      {skillStats && skillStats.byCategory.some((c) => c.count > 0) && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader title="Crafting Skills" />
          <div className="space-y-3">
            {skillStats.byCategory
              .filter((c) => c.count > 0)
              .map((cat) => {
                const nextThreshold = cat.nextBadge?.threshold ?? cat.badge?.threshold ?? 1;
                const currentThreshold = cat.badge?.threshold ?? 0;
                const progressInTier =
                  cat.nextBadge
                    ? ((cat.count - currentThreshold) / (nextThreshold - currentThreshold)) * 100
                    : 100;

                return (
                  <div
                    key={cat.category}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {cat.label}
                        </span>
                      </div>
                      {cat.badge && (
                        <span
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                        >
                          {cat.badge.emoji} {cat.badge.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: progressInTier === 100 ? '#22C55E' : 'var(--accent-primary)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progressInTier, 100)}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {cat.count} session{cat.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {cat.nextBadge && (
                      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                        {cat.nextBadge.threshold - cat.count} more to reach {cat.nextBadge.emoji} {cat.nextBadge.name}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* 6. Achievements */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <SectionHeader title="Achievements" count={unlockedIds.length} />
        <BadgeGrid achievements={ACHIEVEMENTS} unlockedIds={unlockedIds} />
      </motion.div>

    </div>
  );
}
