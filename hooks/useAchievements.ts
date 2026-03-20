'use client';

import { useCallback } from 'react';
import { getStorage, getUnlockedAchievements, unlockAchievement } from '@/lib/storage';
import { awardXP } from '@/lib/xp';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { getTutorialById } from '@/lib/tutorials';
import type { Achievement, AchievementCriteria } from '@/lib/types/database';

/**
 * useAchievements Hook
 *
 * Checks whether the user has earned any new achievements based on their
 * localStorage stats. Call checkAchievements() after any significant action.
 */

export function useAchievements() {
  const checkAchievements = useCallback((): Achievement[] => {
    const storage = getStorage();
    const { userProjects, userPhotos, userStats, journalEntries, favorites } = storage;
    const unlockedIds = new Set(getUnlockedAchievements());
    const newlyUnlocked: Achievement[] = [];

    const completedProjects = userProjects.filter((p) => p.status === 'completed');
    const totalHours = userProjects.reduce((sum, p) => sum + (p.hours_logged || 0), 0);

    // Count completions per category (using tutorials lookup)
    const categoryCompletedCounts: Record<string, number> = {};
    let hasFiveStar = false;

    for (const up of completedProjects) {
      const tutorial = getTutorialById(up.project_id);
      if (tutorial) {
        categoryCompletedCounts[tutorial.category] = (categoryCompletedCounts[tutorial.category] || 0) + 1;
      }
      if (up.rating === 5) hasFiveStar = true;
    }

    // Also count journal entries per category for broader achievement tracking
    for (const entry of (journalEntries ?? [])) {
      const tutorial = getTutorialById(entry.projectId);
      if (tutorial) {
        categoryCompletedCounts[tutorial.category] = (categoryCompletedCounts[tutorial.category] || 0) + 1;
      }
      if (entry.rating === 5) hasFiveStar = true;
    }

    const ctx: EvalContext = {
      projectsStarted: userProjects.length + (journalEntries ?? []).length,
      projectsCompleted: completedProjects.length,
      photosUploaded: userPhotos.length + (journalEntries ?? []).reduce((sum, e) => sum + e.photos.length, 0),
      totalHours,
      longestStreak: userStats.longest_streak || 0,
      categoryCompletedCounts,
      categoriesWithCompletions: Object.keys(categoryCompletedCounts).length,
      hasFiveStar,
      journalEntryCount: (journalEntries ?? []).length,
      favoritesCount: (favorites ?? []).length,
      craftModeSessions: userStats.craft_mode_sessions ?? 0,
      projectsShared: userStats.projects_shared ?? 0,
    };

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria = achievement.criteria as AchievementCriteria | null;
      if (!criteria) continue;

      if (!evaluateCriteria(criteria, ctx)) continue;

      unlockAchievement(achievement.id);
      if (achievement.xp_reward) {
        awardXP(achievement.xp_reward);
      }
      newlyUnlocked.push(achievement);
    }

    return newlyUnlocked;
  }, []);

  return { checkAchievements };
}

interface EvalContext {
  projectsStarted: number;
  projectsCompleted: number;
  photosUploaded: number;
  totalHours: number;
  longestStreak: number;
  categoryCompletedCounts: Record<string, number>;
  categoriesWithCompletions: number;
  hasFiveStar: boolean;
  journalEntryCount: number;
  favoritesCount: number;
  craftModeSessions: number;
  projectsShared: number;
}

function evaluateCriteria(criteria: AchievementCriteria, ctx: EvalContext): boolean {
  const count = criteria.count ?? 1;
  switch (criteria.type) {
    case 'projects_started': return ctx.projectsStarted >= count;
    case 'projects_completed': return ctx.projectsCompleted >= count;
    case 'category_completed': return (ctx.categoryCompletedCounts[criteria.category ?? ''] ?? 0) >= count;
    case 'photos_uploaded': return ctx.photosUploaded >= count;
    case 'hours_logged': return ctx.totalHours >= count;
    case 'streak': return ctx.longestStreak >= count;
    case 'five_star_rating': return ctx.hasFiveStar;
    case 'all_categories': return ctx.categoriesWithCompletions >= count;
    case 'journal_entries': return ctx.journalEntryCount >= count;
    case 'favorites_count': return ctx.favoritesCount >= count;
    case 'craft_mode_sessions': return ctx.craftModeSessions >= count;
    case 'projects_shared': return ctx.projectsShared >= count;
    default: return false;
  }
}
