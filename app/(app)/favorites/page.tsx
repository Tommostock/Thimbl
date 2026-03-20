'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import type { FavoritePatternMeta } from '@/lib/storage';

export default function FavoritesPage() {
  const { favoritePatterns, toggleFavorite } = useFavorites();

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
      </div>

      {/* Favorites list or empty state */}
      {favoritePatterns.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 text-center">
          <Heart size={48} style={{ color: 'var(--text-muted)' }} />
          <h2
            className="text-lg font-semibold mt-4"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            No favourites yet
          </h2>
          <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Browse patterns and tap the heart to save them here
          </p>
          <Link
            href="/dashboard"
            className="mt-6 px-6 py-3 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Browse Patterns
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {favoritePatterns.map((pattern) => (
              <FavoriteCard
                key={pattern.id}
                pattern={pattern}
                onRemove={() => toggleFavorite(pattern.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FavoriteCard({ pattern, onRemove }: { pattern: FavoritePatternMeta; onRemove: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const craftEmoji = pattern.craft === 'knitting' ? '🧶' : pattern.craft === 'crochet' ? '🪝' : '🧵';

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
        className="relative rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-colour)',
          touchAction: 'pan-y',
        }}
      >
        <Link
          href={`/explore/${pattern.id}`}
          onClick={(e) => { if (isDragging) e.preventDefault(); }}
          className="flex items-center gap-3 p-3"
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
            {pattern.imageUrl ? (
              <Image
                src={pattern.imageUrl}
                alt={pattern.name}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                {craftEmoji}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {pattern.name}
            </h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              by {pattern.designer}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                {craftEmoji} {pattern.craft}
              </span>
              {pattern.free && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
                  FREE
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
