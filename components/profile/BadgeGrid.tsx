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

        return (
          <motion.div
            key={achievement.id}
            className="relative aspect-square rounded-xl flex flex-col items-center justify-center p-3 text-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              opacity: isUnlocked ? 1 : 0.5,
              ...(isUnlocked
                ? {
                    boxShadow: '0 0 8px var(--accent-primary)',
                  }
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
              <Icon size={24} style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <div className="relative">
                <Icon size={24} style={{ color: 'var(--text-muted)' }} />
                <Lock
                  size={12}
                  className="absolute -bottom-1 -right-1"
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>
            )}
            <span
              className="text-xs font-medium mt-1 leading-tight line-clamp-2"
              style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {achievement.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
