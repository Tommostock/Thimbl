'use client';

import { motion } from 'framer-motion';

interface SkillProgressCardProps {
  label: string;
  emoji: string;
  completed: number;
  total: number;
  percentage: number;
  colour: string;
}

export default function SkillProgressCard({
  label,
  emoji,
  completed,
  total,
  percentage,
  colour,
}: SkillProgressCardProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl p-3"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <span className="text-2xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-sm font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </span>
          <span
            className="text-xs shrink-0 ml-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {completed}/{total} projects
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: colour }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
