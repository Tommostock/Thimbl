'use client';

import { DIFFICULTIES } from '@/lib/constants';

/**
 * DifficultyBadge
 *
 * Shows the difficulty level as a coloured pill badge.
 * Beginner = sage green, Intermediate = golden, Advanced = terracotta.
 */

interface DifficultyBadgeProps {
  difficulty: string;
  size?: 'sm' | 'md';
}

export default function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const config = DIFFICULTIES.find((d) => d.key === difficulty) ?? DIFFICULTIES[0];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      style={{
        backgroundColor: `${config.colour}20`,
        color: config.colour,
      }}
    >
      {config.label}
    </span>
  );
}
