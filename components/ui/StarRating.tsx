'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (n: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ rating, onRate, size = 20, readonly = false }: StarRatingProps) {
  return (
    <div className="flex flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const starEl = (
          <Star
            key={star}
            size={size}
            fill={filled ? 'var(--accent-primary)' : 'none'}
            stroke={filled ? 'var(--accent-primary)' : 'var(--text-muted)'}
            style={{ cursor: readonly ? 'default' : 'pointer' }}
            onClick={() => {
              if (!readonly && onRate) onRate(star);
            }}
          />
        );

        if (readonly) {
          return <span key={star}>{starEl}</span>;
        }

        return (
          <motion.span key={star} whileTap={{ scale: 1.2 }}>
            {starEl}
          </motion.span>
        );
      })}
    </div>
  );
}
