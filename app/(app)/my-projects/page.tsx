'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useUserProjects } from '@/hooks/useProjects';
import DifficultyBadge from '@/components/catalogue/DifficultyBadge';

/**
 * My Projects Page
 *
 * Shows the user's in-progress and completed projects.
 * Tabbed view: In Progress | Completed.
 */

export default function MyProjectsPage() {
  const { userProjects, loading } = useUserProjects();
  const [tab, setTab] = useState<'in_progress' | 'completed'>('in_progress');

  const inProgress = userProjects.filter((up) => up.status === 'in_progress');
  const completed = userProjects.filter((up) => up.status === 'completed');
  const displayed = tab === 'in_progress' ? inProgress : completed;

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          My Projects
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Track your crafting progress
        </p>
      </motion.div>

      {/* Tabs */}
      <div
        className="flex rounded-xl p-1 mb-5"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {(['in_progress', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
            style={{
              backgroundColor: tab === t ? 'var(--bg-card)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === t ? '0 1px 3px var(--shadow-colour)' : 'none',
            }}
          >
            {t === 'in_progress' ? `In Progress (${inProgress.length})` : `Completed (${completed.length})`}
          </button>
        ))}
      </div>

      {/* Project list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 w-3/4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }} />
              <div className="h-3 w-1/2 rounded mt-2" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12">
          <Scissors size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            {tab === 'in_progress' ? 'No projects in progress' : 'No completed projects yet'}
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {tab === 'in_progress'
              ? 'Start a project from the catalogue!'
              : 'Complete your first project to see it here'}
          </p>
          {tab === 'in_progress' && (
            <Link
              href="/explore"
              className="inline-flex px-5 py-2.5 rounded-xl text-white text-sm font-semibold min-h-[44px] items-center"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Browse Catalogue
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((up, index) => {
            const project = up.project;
            if (!project) return null;
            const totalSteps = (project.steps as unknown[])?.length ?? 1;
            const progress = totalSteps > 0 ? Math.round((up.current_step / totalSteps) * 100) : 0;

            return (
              <motion.div
                key={up.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/my-projects/${up.id}`}>
                  <div className="card p-4 active:scale-[0.98] transition-transform">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={project.difficulty} />
                          {up.hours_logged > 0 && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <Clock size={12} />
                              {up.hours_logged}h
                            </span>
                          )}
                        </div>
                      </div>
                      {up.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star size={14} fill="var(--golden, #D4A843)" style={{ color: 'var(--golden, #D4A843)' }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                            {up.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress bar (only for in-progress) */}
                    {up.status === 'in_progress' && (
                      <div className="flex items-center gap-2 mt-3">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: 'var(--accent-primary)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
                          Step {up.current_step}/{totalSteps}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
