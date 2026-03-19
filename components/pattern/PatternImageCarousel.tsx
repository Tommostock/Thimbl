'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PatternImage } from '@/lib/types/pattern';

interface PatternImageCarouselProps {
  images: PatternImage[];
  fallbackImage: string;
  title: string;
}

export default function PatternImageCarousel({
  images,
  fallbackImage,
  title,
}: PatternImageCarouselProps) {
  const allImages = images.length > 0 ? images : [{ url: fallbackImage, alt: title }];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const navigate = (dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + allImages.length) % allImages.length);
  };

  if (allImages.length === 1) {
    return (
      <div className="relative h-72">
        <Image
          src={allImages[0].url}
          alt={allImages[0].alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative h-72 overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0"
        >
          <Image
            src={allImages[index].url}
            alt={allImages[index].alt}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
        aria-label="Previous image"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => navigate(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
        aria-label="Next image"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {allImages.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
            className="w-2 h-2 rounded-full transition-colors"
            style={{ backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.5)' }}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
