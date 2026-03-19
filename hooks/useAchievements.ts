'use client';

import { useCallback } from 'react';
import { getStorage, getUnlockedAchievements, unlockAchievement } from '@/lib/storage';
import { awardXP } from '@/lib/xp';
import { ACHIEVEMENTS, PROJECTS } from '@/lib/data';
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

    // Count completions per category
    const categoryCompletedCounts: Record<string, number> = {};
    let hasFiveStar = false;
    let hasFastCompletion = false;

    for (const up of completedProjects) {
      const project = PROJECTS.find((p) => p.id === up.project_id);
      if (project) {
        categoryCompletedCounts[project.category] = (categoryCompletedCounts[project.category] || 0) + 1;
      }
      if (up.rating === 5) hasFiveStar = true;
      if (up.started_at && up.completed_at) {
        const days = (new Date(up.completed_at).getTime() - new Date(up.started_at).getTime()) / (1000 * 60 * 60 * 24);
        if (days < 7) hasFastCompletion = true;
      }
    }

    const ctx = {
      projectsStarted: userProjects.length,
      projectsCompleted: completedProjects.length,
      photosUploaded: userPhotos.length,
      totalHours,
      longestStreak: userStats.longest_streak || 0,
      categoryCompletedCounts,
      categoriesWithCompletions: Object.keys(categoryCompletedCounts).length,
      hasFiveStar,
      hasFastCompletion,
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
  hasFastCompletion: boolean;
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
    case 'fast_completion': return ctx.hasFastCompletion;
    case 'all_categories': return ctx.categoriesWithCompletions >= count;
    case 'category_all_complete': return Object.values(ctx.categoryCompletedCounts).some((c) => c >= 10);
    case 'journal_entries': return ctx.journalEntryCount >= count;
    case 'favorites_count': return ctx.favoritesCount >= count;
    case 'craft_mode_sessions': return ctx.craftModeSessions >= count;
    case 'projects_shared': return ctx.projectsShared >= count;
    default: return false;
  }
}
