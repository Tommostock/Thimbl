/**
 * Skills & Badge System
 *
 * Tracks crafting progress by category and subcategory,
 * awards badge tiers based on completed sessions.
 * Mirrors BakeBook's skills.ts for feature parity.
 */

import type { JournalEntry } from '@/lib/types/database';
import { getTutorialById } from '@/lib/tutorials';

// ---- Badge tiers ----

export interface Badge {
  name: string;
  emoji: string;
  threshold: number;
}

export const BADGE_TIERS: Badge[] = [
  { name: 'Beginner', emoji: '🌱', threshold: 1 },
  { name: 'Apprentice', emoji: '🧵', threshold: 3 },
  { name: 'Crafter', emoji: '✂️', threshold: 5 },
  { name: 'Expert', emoji: '🏅', threshold: 10 },
  { name: 'Master', emoji: '👑', threshold: 15 },
];

export function getBadgeForCount(count: number): Badge | null {
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    if (count >= BADGE_TIERS[i].threshold) return BADGE_TIERS[i];
  }
  return null;
}

export function getNextBadge(count: number): Badge | null {
  for (const badge of BADGE_TIERS) {
    if (count < badge.threshold) return badge;
  }
  return null;
}

// ---- Skill stat types ----

export interface CategoryStat {
  category: string;
  label: string;
  emoji: string;
  count: number;
  badge: Badge | null;
  nextBadge: Badge | null;
}

export interface SubcategoryStat {
  subcategory: string;
  count: number;
  badge: Badge | null;
  nextBadge: Badge | null;
}

export interface SkillStats {
  totalSessions: number;
  uniquePatterns: number;
  averageRating: number;
  byCategory: CategoryStat[];
  bySubcategory: SubcategoryStat[];
}

// ---- Compute stats ----

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  knitting: { label: 'Knitting', emoji: '🧶' },
  crochet: { label: 'Crochet', emoji: '🪝' },
};

export function computeSkillStats(entries: JournalEntry[]): SkillStats {
  const totalSessions = entries.length;
  const uniquePatterns = new Set(entries.map((e) => e.projectId)).size;
  const averageRating =
    entries.length > 0
      ? Math.round((entries.reduce((sum, e) => sum + e.rating, 0) / entries.length) * 10) / 10
      : 0;

  // By category
  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, number> = {};

  for (const entry of entries) {
    const tutorial = getTutorialById(entry.projectId);
    if (tutorial) {
      categoryCounts[tutorial.category] = (categoryCounts[tutorial.category] || 0) + 1;
      subcategoryCounts[tutorial.subcategory] = (subcategoryCounts[tutorial.subcategory] || 0) + 1;
    }
  }

  const byCategory: CategoryStat[] = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const count = categoryCounts[key] || 0;
    return {
      category: key,
      label: meta.label,
      emoji: meta.emoji,
      count,
      badge: getBadgeForCount(count),
      nextBadge: getNextBadge(count),
    };
  });

  const bySubcategory: SubcategoryStat[] = Object.entries(subcategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([sub, count]) => ({
      subcategory: sub,
      count,
      badge: getBadgeForCount(count),
      nextBadge: getNextBadge(count),
    }));

  return {
    totalSessions,
    uniquePatterns,
    averageRating,
    byCategory,
    bySubcategory,
  };
}
