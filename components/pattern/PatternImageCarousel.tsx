'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  const [fullscreen, setFullscreen] = useState(false);

  const navigate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + allImages.length) % allImages.length);
    },
    [allImages.length],
  );

  const openFullscreen = useCallback((i: number) => {
    setIndex(i);
    setFullscreen(true);
  }, []);

  return (
    <>
      {/* Carousel */}
      <div className="relative h-72 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => openFullscreen(index)}
          >
            <Image
              src={allImages[index].url}
              alt={allImages[index].alt}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setDirection(i > index ? 1 : -1); setIndex(i); }}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.5)' }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Tap to view hint */}
        <div className="absolute bottom-3 right-3 z-10 text-[10px] font-medium px-2 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
        >
          Tap to view full image
        </div>
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          >
            {/* Close + counter */}
            <div className="flex items-center justify-between p-4 shrink-0">
              <span className="text-sm font-medium text-white/70">
                {index + 1} / {allImages.length}
              </span>
              <button
                onClick={() => setFullscreen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                aria-label="Close fullscreen"
              >
                <X size={20} />
              </button>
            </div>

            {/* Full image */}
            <div className="flex-1 relative mx-4 mb-4">
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
                    className="object-contain"
                    sizes="100vw"
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>

              {/* Fullscreen nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 min-h-[44px] min-w-[44px]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 min-h-[44px] min-w-[44px]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Fullscreen dots */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 pb-6 shrink-0">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                    className="w-2.5 h-2.5 rounded-full transition-colors"
                    style={{ backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.35)' }}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
