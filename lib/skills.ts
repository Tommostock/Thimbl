import type { UserProject, Project } from '@/lib/types/database';
import { CATEGORIES, DIFFICULTIES } from './constants';

export interface SkillStat {
  key: string;
  label: string;
  emoji: string;
  completed: number;
  total: number;
  percentage: number;
  colour: string;
}

const CATEGORY_COLOURS: Record<string, string> = {
  sewing: '#C67B5C',
  knitting: '#8BA888',
  crochet: '#D4A843',
  embroidery: '#D4A0A0',
};

const DIFFICULTY_COLOURS: Record<string, string> = {
  beginner: '#8BA888',
  intermediate: '#D4A843',
  advanced: '#C67B5C',
};

export function getSkillsByCategory(
  userProjects: UserProject[],
  allProjects: Project[]
): SkillStat[] {
  const completed = userProjects.filter((up) => up.status === 'completed');

  return CATEGORIES.map((cat) => {
    const total = allProjects.filter((p) => p.category === cat.key).length;
    const done = completed.filter((up) => {
      const proj = allProjects.find((p) => p.id === up.project_id);
      return proj?.category === cat.key;
    }).length;

    return {
      key: cat.key,
      label: cat.label,
      emoji: cat.emoji,
      completed: done,
      total,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
      colour: CATEGORY_COLOURS[cat.key] ?? '#C67B5C',
    };
  });
}

export function getSkillsByDifficulty(
  userProjects: UserProject[],
  allProjects: Project[]
): SkillStat[] {
  const completed = userProjects.filter((up) => up.status === 'completed');

  return DIFFICULTIES.map((diff) => {
    const total = allProjects.filter((p) => p.difficulty === diff.key).length;
    const done = completed.filter((up) => {
      const proj = allProjects.find((p) => p.id === up.project_id);
      return proj?.difficulty === diff.key;
    }).length;

    return {
      key: diff.key,
      label: diff.label,
      emoji: diff.key === 'beginner' ? '🌱' : diff.key === 'intermediate' ? '⭐' : '🏆',
      completed: done,
      total,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
      colour: DIFFICULTY_COLOURS[diff.key] ?? '#C67B5C',
    };
  });
}
