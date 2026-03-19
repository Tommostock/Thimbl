'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { CATEGORIES, DIFFICULTIES } from '@/lib/constants';
import type { Project } from '@/lib/types/database';

interface ProjectCardSmallProps {
  project: Project;
}

export default function ProjectCardSmall({ project }: ProjectCardSmallProps) {
  const category = CATEGORIES.find((c) => c.key === project.category);
  const emoji = category?.emoji ?? '🧵';
  const diffConfig = DIFFICULTIES.find((d) => d.key === project.difficulty) ?? DIFFICULTIES[0];

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Link href={`/explore/${project.id}`} className="block">
        <div
          className="rounded-xl p-3 min-w-[160px]"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <span className="text-2xl">{emoji}</span>

          <h3
            className="font-medium text-sm line-clamp-2 mt-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.title}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${diffConfig.colour}20`,
                color: diffConfig.colour,
              }}
            >
              {diffConfig.label}
            </span>
          </div>

          {project.estimated_time && (
            <span
              className="flex items-center gap-1 text-xs mt-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <Clock size={11} />
              {project.estimated_time}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
