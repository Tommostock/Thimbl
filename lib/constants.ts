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
  ADD_FAVORITE: 2,
  ADD_JOURNAL_ENTRY: 15,
  SHARE_PROJECT: 5,
  COMPLETE_CRAFT_MODE: 10,
} as const;

// ============================================
// Level Thresholds (12 levels, matching BakeBook)
// ============================================

export const LEVELS = [
  { name: 'Apprentice', minXP: 0 },
  { name: 'Novice', minXP: 50 },
  { name: 'Hobbyist', minXP: 150 },
  { name: 'Crafter', minXP: 300 },
  { name: 'Artisan', minXP: 500 },
  { name: 'Journeyman', minXP: 800 },
  { name: 'Expert', minXP: 1200 },
  { name: 'Master', minXP: 1800 },
  { name: 'Virtuoso', minXP: 2500 },
  { name: 'Grand Master', minXP: 3500 },
  { name: 'Textile Legend', minXP: 5000 },
  { name: 'Craft Sage', minXP: 7500 },
] as const;

/**
 * Calculate the user's level based on their total XP.
 * Returns the level object with name and minXP.
 */
export function getLevelForXP(xp: number) {
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

// ============================================
// Seasonal Configuration
// ============================================

export const SEASONAL_CONFIG = {
  winter: { months: [12, 1, 2], label: 'Winter Crafts', emoji: '❄️' },
  spring: { months: [3, 4, 5], label: 'Spring Crafts', emoji: '🌸' },
  summer: { months: [6, 7, 8], label: 'Summer Crafts', emoji: '☀️' },
  autumn: { months: [9, 10, 11], label: 'Autumn Crafts', emoji: '🍂' },
} as const;

export type Season = keyof typeof SEASONAL_CONFIG;

// ============================================
// Favorites Sort Options
// ============================================

export const SORT_OPTIONS = [
  { key: 'recent', label: 'Recently Added' },
  { key: 'name', label: 'Name' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'time', label: 'Time' },
] as const;
