import { XP_REWARDS, getLevelForXP } from './constants';
import { getStorage, setStorage } from './storage';

/**
 * XP System
 *
 * Awards XP to the local user and updates their stats in localStorage.
 * No Supabase required — all data lives in the browser.
 */

/**
 * Award XP to the current user and update their stats.
 * Returns the new total XP.
 */
export function awardXP(amount: number): number {
  const { userStats } = getStorage();

  const newXP = (userStats.total_xp || 0) + amount;
  const newLevel = getLevelForXP(newXP).index + 1;
  const today = new Date().toISOString().split('T')[0];

  // Calculate streak
  let newStreak = userStats.current_streak || 0;
  let longestStreak = userStats.longest_streak || 0;

  if (userStats.last_activity_date) {
    const lastDate = new Date(userStats.last_activity_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
    // diffDays === 0 means same day — streak unchanged
  } else {
    newStreak = 1;
  }

  longestStreak = Math.max(longestStreak, newStreak);

  setStorage({
    userStats: {
      ...userStats,
      total_xp: newXP,
      level: newLevel,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    },
  });

  return newXP;
}

/**
 * Get the XP reward for a specific action.
 */
export function getXPForAction(action: keyof typeof XP_REWARDS): number {
  return XP_REWARDS[action];
}
