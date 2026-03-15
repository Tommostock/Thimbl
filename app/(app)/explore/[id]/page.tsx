'use client';

import { use } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  PoundSterling,
  Scissors,
  Heart,
  Lightbulb,
  ShoppingBag,
  Play,
  Loader2,
  Check,
} from 'lucide-react';
import { useProject, useUserProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/hooks/useXP';
import { useAchievements } from '@/hooks/useAchievements';
import DifficultyBadge from '@/components/catalogue/DifficultyBadge';
import { CATEGORIES } from '@/lib/constants';
import type { MaterialItem, StepItem } from '@/lib/types/database';

/**
 * Project Detail Page
 *
 * Shows full project info: description, materials, steps, tips.
 * Users can start the project from here.
 */

const categoryColours: Record<string, string> = {
  sewing: '#C67B5C',
  knitting: '#8BA888',
  crochet: '#D4A0A0',
  embroidery: '#D4A843',
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { project, loading } = useProject(id);
  const { user } = useAuth();
  const { userProjects, startProject } = useUserProjects();
  const { award } = useXP();
  const { checkAchievements } = useAchievements();
  const [starting, setStarting] = useState(false);

  // Check if user has already started this project
  const existingUserProject = userProjects.find((up) => up.project_id === id);

  const handleStart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setStarting(true);
    const result = await startProject(id);
    if (result) {
      // Award XP for starting a project
      await award('START_PROJECT');
      checkAchievements();
      router.push(`/my-projects/${result.id}`);
    }
    setStarting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-4 pt-12 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Project not found.</p>
      </div>
    );
  }

  const bgColour = categoryColours[project.category] ?? '#C67B5C';
  const categoryLabel = CATEGORIES.find((c) => c.key === project.category)?.label ?? project.category;
  const materials = (project.materials ?? []) as MaterialItem[];
  const steps = (project.steps ?? []) as StepItem[];

  return (
    <div className="pb-8">
      {/* Header image / placeholder */}
      <div
        className="relative h-48 flex items-center justify-center"
        style={{ backgroundColor: `${bgColour}15` }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <Scissors size={64} style={{ color: bgColour }} strokeWidth={1} />
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        <motion.div
          className="card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Title & meta */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: bgColour, color: '#fff' }}
              >
                {categoryLabel}
              </span>
              <DifficultyBadge difficulty={project.difficulty} />
            </div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {project.title}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 mb-5">
            {project.estimated_time && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Clock size={16} />
                <span>{project.estimated_time}</span>
              </div>
            )}
            {project.cost_estimate && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                <PoundSterling size={16} />
                <span>{project.cost_estimate}</span>
              </div>
            )}
          </div>

          {/* Start / Continue button */}
          {existingUserProject ? (
            <button
              onClick={() => router.push(`/my-projects/${existingUserProject.id}`)}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-secondary)', color: '#fff' }}
            >
              <Play size={18} />
              {existingUserProject.status === 'completed' ? 'View Completed Project' : 'Continue Project'}
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {starting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Play size={18} />
                  Start Project
                </>
              )}
            </button>
          )}
        </motion.div>

        {/* Materials section */}
        {materials.length > 0 && (
          <motion.div
            className="card p-5 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              <ShoppingBag size={18} style={{ color: 'var(--accent-primary)' }} />
              Materials Needed
            </h2>
            <ul className="space-y-2">
              {materials.map((material, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between text-sm py-1.5 border-b last:border-0"
                  style={{ borderColor: 'var(--border-colour-light)' }}
                >
                  <div>
                    <span style={{ color: 'var(--text-primary)' }}>{material.name}</span>
                    {material.quantity && (
                      <span className="ml-1.5" style={{ color: 'var(--text-muted)' }}>
                        ({material.quantity})
                      </span>
                    )}
                  </div>
                  {material.estimated_cost != null && (
                    <span className="shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                      £{material.estimated_cost.toFixed(2)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Steps section */}
        {steps.length > 0 && (
          <motion.div
            className="card p-5 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              <Check size={18} style={{ color: 'var(--accent-secondary)' }} />
              Steps ({steps.length})
            </h2>
            <ol className="space-y-4">
              {steps.map((step) => (
                <li key={step.order} className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor: `${bgColour}20`,
                      color: bgColour,
                    }}
                  >
                    {step.order}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-sm mb-0.5"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {step.description}
                    </p>
                    {step.tip && (
                      <div
                        className="mt-2 p-2.5 rounded-lg text-xs flex gap-2"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Lightbulb size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                        <span>{step.tip}</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Tips section */}
        {project.tips && (
          <motion.div
            className="card p-5 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              <Lightbulb size={18} style={{ color: 'var(--golden, #D4A843)' }} />
              Tips & Tricks
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {project.tips}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
