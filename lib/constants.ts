/**
 * Constants
 *
 * Central place for XP values, level thresholds, and achievement definitions.
 * All game-design numbers live here so they're easy to tweak.
 */

// ============================================
// XP Rewards
// ============================================

export const XP_REWARDS = {
  START_PROJECT: 10,
  COMPLETE_STEP: 5,
  COMPLETE_PROJECT: 50,
  UPLOAD_PHOTO: 10,
  RATE_PROJECT: 5,
  LOG_TIME_PER_HOUR: 5,
  STREAK_7_DAY: 100,
} as const;

// ============================================
// Level Thresholds
// ============================================

export const LEVELS = [
  { name: 'Apprentice', minXP: 0 },
  { name: 'Hobbyist', minXP: 100 },
  { name: 'Crafter', minXP: 300 },
  { name: 'Artisan', minXP: 600 },
  { name: 'Master Maker', minXP: 1000 },
  { name: 'Textile Legend', minXP: 2000 },
] as const;

/**
 * Calculate the user's level based on their total XP.
 * Returns the level object with name and minXP.
 */
export function getLevelForXP(xp: number) {
  // Walk backwards through the levels to find the highest one the user qualifies for
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return {
        ...LEVELS[i],
        index: i,
        nextLevel: i < LEVELS.length - 1 ? LEVELS[i + 1] : null,
      };
    }
  }
  return { ...LEVELS[0], index: 0, nextLevel: LEVELS[1] };
}

// ============================================
// Craft Categories
// ============================================

export const CATEGORIES = [
  { key: 'sewing', label: 'Sewing', emoji: '🧵' },
  { key: 'knitting', label: 'Knitting', emoji: '🧶' },
  { key: 'crochet', label: 'Crochet', emoji: '🪝' },
  { key: 'embroidery', label: 'Embroidery', emoji: '🪡' },
] as const;

export type CraftCategory = (typeof CATEGORIES)[number]['key'];

// ============================================
// Difficulty Levels
// ============================================

export const DIFFICULTIES = [
  { key: 'beginner', label: 'Beginner', colour: '#8BA888' },
  { key: 'intermediate', label: 'Intermediate', colour: '#D4A843' },
  { key: 'advanced', label: 'Advanced', colour: '#C67B5C' },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]['key'];
