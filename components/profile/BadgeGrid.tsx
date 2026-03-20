'use client';

import { motion } from 'framer-motion';
import {
  Award, Lock, Scissors, Layers, Heart, Zap, Anchor, Camera, Star,
  Moon, Clock, ShoppingBag, Timer, Trophy, Palette, Flame, CheckCircle,
  BookOpen, Share2, Target, Grid,
} from 'lucide-react';
import type { Achievement } from '@/lib/types/database';

const iconMap: Record<string, typeof Award> = {
  scissors: Scissors,
  layers: Layers,
  heart: Heart,
  zap: Zap,
  anchor: Anchor,
  camera: Camera,
  star: Star,
  moon: Moon,
  clock: Clock,
  'shopping-bag': ShoppingBag,
  timer: Timer,
  trophy: Trophy,
  palette: Palette,
  flame: Flame,
  'check-circle': CheckCircle,
  'book-open': BookOpen,
  'share-2': Share2,
  target: Target,
  grid: Grid,
  award: Award,
};

/** Human-readable requirement text for each achievement criteria type */
function getRequirementText(achievement: Achievement): string {
  const { criteria } = achievement;
  const count = criteria.count ?? 1;

  switch (criteria.type) {
    case 'projects_started':
      return `Start ${count} project${count !== 1 ? 's' : ''}`;
    case 'projects_completed':
      return `Complete ${count} project${count !== 1 ? 's' : ''}`;
    case 'category_completed':
      return `Complete ${count} ${criteria.category ?? ''} project${count !== 1 ? 's' : ''}`;
    case 'photos_uploaded':
      return `Upload ${count} photo${count !== 1 ? 's' : ''}`;
    case 'five_star_rating':
      return `Give ${count} project${count !== 1 ? 's' : ''} a 5-star rating`;
    case 'night_crafting':
      return 'Log a craft session after 10pm';
    case 'hours_logged':
      return `Log ${count}+ hours of crafting`;
    case 'materials_complete':
      return `Check off all materials for ${count} project${count !== 1 ? 's' : ''}`;
    case 'fast_completion':
      return `Complete a project in under ${criteria.days ?? 7} days`;
    case 'category_all_complete':
      return 'Complete every project in one category';
    case 'all_categories':
      return 'Complete a project in each category';
    case 'streak':
      return `Maintain a ${count}-day crafting streak`;
    case 'journal_entries':
      return `Log ${count} journal entr${count !== 1 ? 'ies' : 'y'}`;
    case 'favorites':
      return `Add ${count} pattern${count !== 1 ? 's' : ''} to favourites`;
    case 'craft_mode_sessions':
      return `Use Start Crafting mode ${count} time${count !== 1 ? 's' : ''}`;
    case 'share_project':
      return `Share ${count} pattern${count !== 1 ? 's' : ''}`;
    default:
      return achievement.description ?? '';
  }
}

interface BadgeGridProps {
  achievements: Achievement[];
  unlockedIds: string[];
}

export default function BadgeGrid({ achievements, unlockedIds }: BadgeGridProps) {
  const unlockedSet = new Set(unlockedIds);

  return (
    <div className="grid grid-cols-3 gap-3">
      {achievements.map((achievement, index) => {
        const isUnlocked = unlockedSet.has(achievement.id);
        const Icon = iconMap[achievement.icon ?? ''] ?? Award;
        const requirement = getRequirementText(achievement);

        return (
          <motion.div
            key={achievement.id}
            className="relative rounded-xl flex flex-col items-center justify-center p-3 text-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              opacity: isUnlocked ? 1 : 0.5,
              ...(isUnlocked
                ? { boxShadow: '0 0 8px var(--accent-primary)' }
                : {}),
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isUnlocked ? 1 : 0.5,
              scale: 1,
              boxShadow: isUnlocked
                ? [
                    '0 0 4px var(--accent-primary)',
                    '0 0 12px var(--accent-primary)',
                    '0 0 4px var(--accent-primary)',
                  ]
                : '0 0 0px transparent',
            }}
            transition={{
              delay: index * 0.03,
              boxShadow: isUnlocked
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : undefined,
            }}
          >
            {isUnlocked ? (
              <Icon size={22} style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <div className="relative">
                <Icon size={22} style={{ color: 'var(--text-muted)' }} />
                <Lock
                  size={10}
                  className="absolute -bottom-1 -right-1"
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>
            )}
            <span
              className="text-xs font-semibold mt-1.5 leading-tight line-clamp-2"
              style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {achievement.name}
            </span>
            <span
              className="text-[9px] mt-1 leading-tight line-clamp-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {requirement}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
