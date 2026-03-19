import { SEASONAL_CONFIG } from './constants';
import type { Project } from '@/lib/types/database';

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  for (const [key, config] of Object.entries(SEASONAL_CONFIG)) {
    if ((config.months as readonly number[]).includes(month)) {
      return { key, label: config.label, emoji: config.emoji };
    }
  }
  return { key: 'spring', label: 'Spring Crafts', emoji: '🌸' };
}

export function getSeasonalProjects(projects: Project[]): Project[] {
  const { key } = getCurrentSeason();
  return projects.filter((p) => p.seasonalTags?.includes(key));
}
