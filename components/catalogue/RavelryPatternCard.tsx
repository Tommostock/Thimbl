'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import { getPatternImageUrl, getDifficultyLabel, getCraftEmoji } from '@/lib/ravelry';
import type { RavelryPatternSearchResult } from '@/lib/ravelry';

interface RavelryPatternCardProps {
  pattern: RavelryPatternSearchResult;
  index?: number;
}

export default function RavelryPatternCard({ pattern, index = 0 }: RavelryPatternCardProps) {
  const imageUrl = getPatternImageUrl(pattern, 'medium');
  const diffLabel = getDifficultyLabel(pattern.difficulty_average);
  const craftEmoji = getCraftEmoji(pattern.craft?.name ?? '');

  const diffColour =
    pattern.difficulty_average <= 2
      ? '#4CAF50'
      : pattern.difficulty_average <= 4
        ? '#FF9800'
        : pattern.difficulty_average <= 6
          ? '#F44336'
          : '#9C27B0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/explore/${pattern.id}`} className="block">
        <div className="card overflow-hidden transition-transform active:scale-[0.98]">
          {/* Cover image */}
          <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={pattern.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                {craftEmoji}
              </div>
            )}

            {/* Free badge */}
            {pattern.free && (
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
                FREE
              </span>
            )}

            {/* Craft badge */}
            <span
              className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}
            >
              {craftEmoji} {pattern.craft?.name}
            </span>
          </div>

          {/* Content */}
          <div className="p-3">
            <h3
              className="font-semibold text-sm mb-1 line-clamp-2 leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {pattern.name}
            </h3>

            <p className="text-xs mb-2 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
              by {pattern.designer?.name}
            </p>

            <div className="flex items-center gap-2">
              {/* Difficulty */}
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${diffColour}20`, color: diffColour }}
              >
                {diffLabel}
              </span>

              {/* Rating */}
              {pattern.rating_average > 0 && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                  {pattern.rating_average.toFixed(1)}
                </span>
              )}

              {/* Favorites */}
              {pattern.favorites_count > 0 && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] ml-auto"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Heart size={10} />
                  {pattern.favorites_count > 999
                    ? `${(pattern.favorites_count / 1000).toFixed(1)}k`
                    : pattern.favorites_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
