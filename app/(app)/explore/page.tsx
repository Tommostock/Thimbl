'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import CategoryFilter from '@/components/catalogue/CategoryFilter';
import ProjectCard from '@/components/catalogue/ProjectCard';
import type { Project } from '@/lib/types/database';
import { useProjects } from '@/hooks/useProjects';

/**
 * Explore / Catalogue Page
 *
 * Browse all craft projects with search and category filtering.
 * Projects are fetched from Supabase (or shown from local cache).
 */

export default function ExplorePage() {
  const { projects, loading } = useProjects();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  // Filter projects by search term and category
  const filtered = useMemo(() => {
    let result = projects;

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false)
      );
    }

    return result;
  }, [projects, category, search]);

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
          Explore Projects
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Discover your next crafting adventure
        </p>
      </motion.div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-colour)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Category filter */}
      <div className="mb-5">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {/* Project grid */}
      {loading ? (
        // Loading skeleton
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-36" style={{ backgroundColor: 'var(--bg-secondary)' }} />
              <div className="p-3.5 space-y-2">
                <div className="h-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', width: '80%' }} />
                <div className="h-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        // Empty state
        <div className="text-center py-12">
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            No projects found
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((project: Project, index: number) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
