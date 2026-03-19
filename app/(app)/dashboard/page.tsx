'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { PROJECTS } from '@/lib/data';
import { getCurrentSeason, getSeasonalProjects } from '@/lib/seasonal';
import { getRecentlyViewed } from '@/lib/storage';
import { CATEGORIES } from '@/lib/constants';
import CategoryPills from '@/components/home/CategoryPills';
import SectionHeader from '@/components/home/SectionHeader';
import ProjectCardSmall from '@/components/home/ProjectCardSmall';
import ProjectCard from '@/components/catalogue/ProjectCard';

/**
 * Dashboard / Home Page
 *
 * BakeBook-style home with category pills, horizontal scroll sections,
 * seasonal highlights, featured projects, quick & easy, recently viewed,
 * and a filterable "All Projects" grid.
 */

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Seasonal projects
  const season = getCurrentSeason();
  const seasonalProjects = useMemo(() => getSeasonalProjects(PROJECTS), []);

  // Featured projects
  const featuredProjects = useMemo(
    () => PROJECTS.filter((p) => p.isFeatured),
    []
  );

  // Quick & Easy: beginner + short time
  const quickProjects = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          p.difficulty === 'beginner' &&
          p.estimated_time &&
          (/\b1\b/.test(p.estimated_time) || /45/.test(p.estimated_time))
      ),
    []
  );

  // Recently viewed
  const recentlyViewedProjects = useMemo(() => {
    const ids = getRecentlyViewed();
    return ids
      .map((id) => PROJECTS.find((p) => p.id === id))
      .filter(Boolean) as typeof PROJECTS;
  }, []);

  // All projects filtered by category
  const allProjects = useMemo(
    () =>
      selectedCategory
        ? PROJECTS.filter((p) => p.category === selectedCategory)
        : PROJECTS,
    [selectedCategory]
  );

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Logo bar */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Thimbl
        </h1>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Category pills */}
      <div className="mb-6">
        <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Seasonal highlights */}
      {seasonalProjects.length > 0 && (
        <div className="mb-6">
          <SectionHeader title={`${season.emoji} ${season.label}`} />
          <div
            className="flex gap-3 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {seasonalProjects.map((project) => (
              <ProjectCardSmall key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Featured" href="/explore" />
          <div
            className="flex gap-3 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {featuredProjects.map((project) => (
              <ProjectCardSmall key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Quick & Easy */}
      {quickProjects.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Quick & Easy" />
          <div
            className="flex gap-3 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {quickProjects.map((project) => (
              <ProjectCardSmall key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Recently viewed */}
      {recentlyViewedProjects.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Recently Viewed" />
          <div
            className="flex gap-3 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {recentlyViewedProjects.map((project) => (
              <ProjectCardSmall key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* All Projects grid */}
      <div className="mb-6">
        <SectionHeader title="All Projects" count={allProjects.length} />
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          {allProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
