'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { getPatternImageUrl, getDifficultyLabel, getCraftEmoji } from '@/lib/ravelry';
import type { RavelryPatternSearchResult } from '@/lib/ravelry';

interface RavelryCardSmallProps {
  pattern: RavelryPatternSearchResult;
}

export default function RavelryCardSmall({ pattern }: RavelryCardSmallProps) {
  const imageUrl = getPatternImageUrl(pattern, 'small');
  const craftEmoji = getCraftEmoji(pattern.craft?.name ?? '');

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Link href={`/explore/${pattern.id}`} className="block">
        <div className="rounded-xl overflow-hidden min-w-[150px] w-[150px]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {/* Image */}
          <div className="relative h-24">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={pattern.name}
                fill
                className="object-cover"
                sizes="150px"
                unoptimized
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                {craftEmoji}
              </div>
            )}
            {pattern.free && (
              <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
                FREE
              </span>
            )}
          </div>

          {/* Text */}
          <div className="p-2.5">
            <h3
              className="font-medium text-xs line-clamp-2 leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {pattern.name}
            </h3>

            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}
              >
                {getDifficultyLabel(pattern.difficulty_average)}
              </span>
              {pattern.rating_average > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <Star size={9} fill="#F59E0B" stroke="#F59E0B" />
                  {pattern.rating_average.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
