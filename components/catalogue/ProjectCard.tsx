'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Scissors, Heart } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import type { Project } from '@/lib/types/database';
import { CATEGORIES } from '@/lib/constants';

/**
 * ProjectCard
 *
 * Displays a single project in the catalogue grid.
 * Shows cover image (or placeholder), title, category, difficulty, and time.
 */

// Craft-themed SVG placeholders based on category
const categoryIcons: Record<string, typeof Scissors> = {
  sewing: Scissors,
  knitting: Heart,
  crochet: Heart,
  embroidery: Heart,
};

const categoryColours: Record<string, string> = {
  sewing: '#C67B5C',
  knitting: '#8BA888',
  crochet: '#D4A0A0',
  embroidery: '#D4A843',
};

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const Icon = categoryIcons[project.category] ?? Scissors;
  const bgColour = categoryColours[project.category] ?? '#C67B5C';
  const categoryLabel = CATEGORIES.find((c) => c.key === project.category)?.label ?? project.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/explore/${project.id}`} className="block">
        <div className="card overflow-hidden transition-transform active:scale-[0.98]">
          {/* Cover image / placeholder */}
          <div
            className="h-36 flex items-center justify-center relative"
            style={{ backgroundColor: `${bgColour}15` }}
          >
            <Icon size={48} style={{ color: bgColour }} strokeWidth={1.2} />
            {/* Category tag */}
            <span
              className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: bgColour,
                color: '#fff',
              }}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Content */}
          <div className="p-3.5">
            <h3
              className="font-semibold text-sm mb-1.5 line-clamp-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              {project.title}
            </h3>

            <div className="flex items-center gap-3">
              <DifficultyBadge difficulty={project.difficulty} />
              {project.estimated_time && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Clock size={12} />
                  {project.estimated_time}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
