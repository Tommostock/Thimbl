'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/catalogue/ProjectCard';
import CategoryFilter from '@/components/catalogue/CategoryFilter';

/**
 * Explore Page — Project Catalogue
 *
 * Displays the hardcoded project catalogue with search and category filtering.
 */

export default function ExplorePage() {
  const { projects } = useProjects();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

  const filtered = projects.filter((p) => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Explore
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {projects.length} projects to discover
        </p>
      </motion.div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-colour)',
        }}
      >
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="search"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No projects found</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
