'use client';

import { Award } from 'lucide-react';
import { getLevelForXP } from '@/lib/constants';

/**
 * LevelBadge Component
 *
 * Displays the user's current level as a coloured badge.
 */

interface LevelBadgeProps {
  totalXP: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function LevelBadge({ totalXP, size = 'md' }: LevelBadgeProps) {
  const level = getLevelForXP(totalXP);

  const sizes = {
    sm: { icon: 14, text: 'text-xs', padding: 'px-2 py-0.5', gap: 'gap-1' },
    md: { icon: 16, text: 'text-sm', padding: 'px-2.5 py-1', gap: 'gap-1.5' },
    lg: { icon: 20, text: 'text-base', padding: 'px-3 py-1.5', gap: 'gap-2' },
  };

  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.padding} rounded-full font-semibold ${s.text}`}
      style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
    >
      <Award size={s.icon} />
      {level.name}
    </span>
  );
}
