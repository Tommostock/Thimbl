'use client';

import { motion } from 'framer-motion';
import { Scissors, Heart, Sparkles, Sun, Moon, TrendingUp, Clock, Camera, Award } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProjects } from '@/hooks/useProjects';
import Link from 'next/link';

/**
 * Dashboard / Home Page
 *
 * Shows welcome message, stats, in-progress projects, and quick actions.
 */

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { userProjects } = useUserProjects();

  const displayName = user?.user_metadata?.display_name || 'Crafter';
  const inProgress = userProjects.filter((up) => up.status === 'in_progress');
  const completed = userProjects.filter((up) => up.status === 'completed');

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Welcome back,
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {displayName}
          </h1>
        </motion.div>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { icon: TrendingUp, label: 'In Progress', value: inProgress.length, colour: 'var(--accent-primary)' },
          { icon: Award, label: 'Completed', value: completed.length, colour: 'var(--accent-secondary)' },
          { icon: Clock, label: 'Hours', value: userProjects.reduce((sum, p) => sum + (p.hours_logged || 0), 0).toFixed(0), colour: 'var(--accent-tertiary)' },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <stat.icon size={20} className="mx-auto mb-1" style={{ color: stat.colour }} />
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Continue crafting */}
      {inProgress.length > 0 && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className="text-lg font-bold mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Continue Crafting
          </h2>
          <div className="space-y-3">
            {inProgress.slice(0, 3).map((up) => {
              const project = up.project;
              if (!project) return null;
              const totalSteps = (project.steps as unknown[])?.length ?? 1;
              const progress = totalSteps > 0 ? Math.round((up.current_step / totalSteps) * 100) : 0;

              return (
                <Link key={up.id} href={`/my-projects/${up.id}`}>
                  <div className="card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <Scissors size={20} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-sm truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: 'var(--accent-primary)',
                            }}
                          />
                        </div>
                        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2
          className="text-lg font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/explore', icon: Sparkles, label: 'Discover Projects', colour: 'var(--accent-primary)' },
            { href: '/my-projects', icon: Scissors, label: 'My Projects', colour: 'var(--accent-secondary)' },
            { href: '/shopping-list', icon: Heart, label: 'Shopping List', colour: 'var(--accent-tertiary)' },
            { href: '/achievements', icon: Award, label: 'Achievements', colour: 'var(--golden, #D4A843)' },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="card p-4 text-center active:scale-[0.97] transition-transform min-h-[44px]">
                <action.icon size={24} className="mx-auto mb-2" style={{ color: action.colour }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Empty state for new users */}
      {userProjects.length === 0 && (
        <motion.div
          className="mt-8 text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Your crafting journey begins here!
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Explore our catalogue and start your first project
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm min-h-[44px]"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Sparkles size={18} />
            Browse Projects
          </Link>
        </motion.div>
      )}
    </div>
  );
}
