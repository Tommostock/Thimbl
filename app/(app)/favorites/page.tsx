'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import { SORT_OPTIONS, DIFFICULTIES, CATEGORIES } from '@/lib/constants';
import type { Project } from '@/lib/types/database';

function parseTime(est: string | null): number {
  if (!est) return 999;
  const match = est.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}

const DIFFICULTY_ORDER: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

function getDifficultyColour(difficulty: string): string {
  return DIFFICULTIES.find((d) => d.key === difficulty)?.colour ?? 'var(--text-muted)';
}

function getCategoryEmoji(category: string): string {
  return CATEGORIES.find((c) => c.key === category)?.emoji ?? '🧵';
}

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const [sortKey, setSortKey] = useState<string>('recent');

  const sorted = useMemo(() => {
    const list = [...favorites];
    switch (sortKey) {
      case 'name':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'difficulty':
        list.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0));
        break;
      case 'time':
        list.sort((a, b) => parseTime(a.estimated_time) - parseTime(b.estimated_time));
        break;
      default:
        break;
    }
    return list;
  }, [favorites, sortKey]);

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Favourites
        </h1>
        {favorites.length > 0 && (
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border-none outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-colour)',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Favorites list or empty state */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 text-center">
          <Heart size={48} style={{ color: 'var(--text-muted)' }} />
          <h2
            className="text-lg font-semibold mt-4"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            No favourites yet
          </h2>
          <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Browse projects and tap the heart to save them here
          </p>
          <Link
            href="/search"
            className="mt-6 px-6 py-3 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {sorted.map((project) => (
              <FavoriteCard
                key={project.id}
                project={project}
                onRemove={() => toggleFavorite(project.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FavoriteCard({ project, onRemove }: { project: Project; onRemove: () => void }) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    setIsDragging(false);
    if (info.offset.x < -80) {
      onRemove();
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ x: -300, opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative"
    >
      {/* Delete zone behind the card */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-6 rounded-xl"
        style={{ backgroundColor: '#ef4444' }}
      >
        <Trash2 size={24} color="white" />
      </div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        className="relative rounded-xl p-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-colour)',
          touchAction: 'pan-y',
        }}
      >
        <Link
          href={`/explore/${project.id}`}
          onClick={(e) => {
            if (isDragging) e.preventDefault();
          }}
          className="flex items-center gap-3"
        >
          <span className="text-2xl">{getCategoryEmoji(project.category)}</span>
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: getDifficultyColour(project.difficulty) + '20',
                  color: getDifficultyColour(project.difficulty),
                }}
              >
                {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
              </span>
              {project.estimated_time && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {project.estimated_time}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
