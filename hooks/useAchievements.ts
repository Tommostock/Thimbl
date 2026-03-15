'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { awardXP } from '@/lib/xp';
import type { Achievement, AchievementCriteria } from '@/lib/types/database';

/**
 * useAchievements Hook
 *
 * Checks whether the user has earned any new achievements based on their stats.
 * Call checkAchievements() after any action that might unlock one.
 *
 * Criteria types match the seed.sql format:
 *   { type: "projects_started", count: 5 }
 *   { type: "projects_completed", count: 1 }
 *   { type: "category_completed", category: "knitting", count: 1 }
 *   { type: "photos_uploaded", count: 10 }
 *   { type: "hours_logged", count: 50 }
 *   { type: "streak", count: 30 }
 *   etc.
 */

export function useAchievements() {
  const { user } = useAuth();

  const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!user) return [];

    const supabase = createClient();
    const newlyUnlocked: Achievement[] = [];

    // Gather all the stats we need
    const [
      { data: stats },
      { count: startedCount },
      { count: completedCount },
      { count: photoCount },
      { data: hourRows },
      { data: userProjectRows },
      { data: allAchievements },
      { data: userAchievements },
    ] = await Promise.all([
      supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
      supabase.from('user_projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('user_projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('user_photos').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('user_projects').select('hours_logged').eq('user_id', user.id),
      supabase.from('user_projects').select('project_id, status, rating, started_at, completed_at, project:projects(category)').eq('user_id', user.id),
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
    ]);

    if (!stats) return [];

    const totalHours = (hourRows ?? []).reduce(
      (sum: number, row: { hours_logged: number | null }) => sum + (row.hours_logged || 0),
      0
    );

    const unlockedIds = new Set(
      (userAchievements ?? []).map((ua: { achievement_id: string }) => ua.achievement_id)
    );

    // Build category completion counts
    const categoryCompletedCounts: Record<string, number> = {};
    const categoriesWithCompletions = new Set<string>();
    let hasFiveStar = false;
    let hasFastCompletion = false;

    for (const row of (userProjectRows ?? []) as Array<Record<string, unknown>>) {
      const proj = row.project as { category: string } | null;
      const category = proj?.category;
      if (!category) continue;

      if (row.status === 'completed') {
        categoryCompletedCounts[category] = (categoryCompletedCounts[category] || 0) + 1;
        categoriesWithCompletions.add(category);

        if ((row.rating as number) === 5) hasFiveStar = true;

        // Check fast completion (under 7 days)
        if (row.started_at && row.completed_at) {
          const start = new Date(row.started_at as string).getTime();
          const end = new Date(row.completed_at as string).getTime();
          const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
          if (daysDiff < 7) hasFastCompletion = true;
        }
      }
    }

    // Check each achievement
    for (const achievement of (allAchievements ?? []) as Achievement[]) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria = achievement.criteria as AchievementCriteria | null;
      if (!criteria) continue;

      const earned = evaluateCriteria(criteria, {
        projectsStarted: startedCount || 0,
        projectsCompleted: completedCount || 0,
        photosUploaded: photoCount || 0,
        totalHours,
        longestStreak: stats.longest_streak || 0,
        categoryCompletedCounts,
        categoriesWithCompletions: categoriesWithCompletions.size,
        hasFiveStar,
        hasFastCompletion,
      });

      if (!earned) continue;

      // Unlock the achievement
      const { error } = await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: achievement.id,
      });

      if (!error) {
        newlyUnlocked.push(achievement);
        // Award XP for the achievement
        if (achievement.xp_reward) {
          await awardXP(user.id, achievement.xp_reward);
        }
      }
    }

    return newlyUnlocked;
  }, [user]);

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
}

function evaluateCriteria(criteria: AchievementCriteria, ctx: EvalContext): boolean {
  const count = criteria.count ?? 1;

  switch (criteria.type) {
    case 'projects_started':
      return ctx.projectsStarted >= count;
    case 'projects_completed':
      return ctx.projectsCompleted >= count;
    case 'category_completed':
      return (ctx.categoryCompletedCounts[criteria.category ?? ''] ?? 0) >= count;
    case 'photos_uploaded':
      return ctx.photosUploaded >= count;
    case 'hours_logged':
      return ctx.totalHours >= count;
    case 'streak':
      return ctx.longestStreak >= count;
    case 'five_star_rating':
      return ctx.hasFiveStar;
    case 'fast_completion':
      return ctx.hasFastCompletion;
    case 'all_categories':
      return ctx.categoriesWithCompletions >= count;
    case 'category_all_complete':
      // At least one category where all projects are completed
      // Simplified: just check if any category has 10+ completions (all projects in seed)
      return Object.values(ctx.categoryCompletedCounts).some((c) => c >= 10);
    case 'night_crafting':
      // This is time-based and checked at log time — skip for now
      return false;
    case 'materials_complete':
      // This requires checking shopping list — skip for batch check
      return false;
    default:
      return false;
  }
}
