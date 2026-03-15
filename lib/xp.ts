import { XP_REWARDS, getLevelForXP } from './constants';
import { createClient } from '@/lib/supabase/client';

/**
 * XP System
 *
 * Functions for awarding XP, updating stats, and checking streaks.
 */

/**
 * Award XP to the current user and update their stats.
 * Returns the new total XP, or null if the update failed.
 */
export async function awardXP(userId: string, amount: number): Promise<number | null> {
  const supabase = createClient();

  // Get current stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!stats) return null;

  const newXP = (stats.total_xp || 0) + amount;
  const newLevel = getLevelForXP(newXP).index + 1;
  const today = new Date().toISOString().split('T')[0];

  // Calculate streak
  let newStreak = stats.current_streak || 0;
  let longestStreak = stats.longest_streak || 0;

  if (stats.last_activity_date) {
    const lastDate = new Date(stats.last_activity_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day — increment streak
      newStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken — reset
      newStreak = 1;
    }
    // diffDays === 0 means same day — streak unchanged
  } else {
    // First activity ever
    newStreak = 1;
  }

  longestStreak = Math.max(longestStreak, newStreak);

  // Update stats
  const { error } = await supabase
    .from('user_stats')
    .update({
      total_xp: newXP,
      level: newLevel,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update XP:', error);
    return null;
  }

  return newXP;
}

/**
 * Get the XP reward for a specific action.
 */
export function getXPForAction(action: keyof typeof XP_REWARDS): number {
  return XP_REWARDS[action];
}
