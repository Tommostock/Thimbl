'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import type { PatternImage } from '@/lib/types/pattern';

interface PatternImageCarouselProps {
  images: PatternImage[];
  fallbackImage: string;
  title: string;
}

const SWIPE_THRESHOLD = 50;

export default function PatternImageCarousel({
  images,
  fallbackImage,
  title,
}: PatternImageCarouselProps) {
  const allImages = images.length > 0 ? images : [{ url: fallbackImage, alt: title }];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [fullscreen]);

  const navigate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + allImages.length) % allImages.length);
    },
    [allImages.length],
  );

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -SWIPE_THRESHOLD) navigate(1);
      else if (info.offset.x > SWIPE_THRESHOLD) navigate(-1);
    },
    [navigate],
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
            drag={allImages.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            onClick={() => openFullscreen(index)}
          >
            <Image
              src={allImages[index].url}
              alt={allImages[index].alt}
              fill
              className="object-cover pointer-events-none"
              sizes="100vw"
              unoptimized
              priority={index === 0}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setDirection(i > index ? 1 : -1); setIndex(i); }}
                className="w-2 h-2 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
                  width: i === index ? 16 : 8,
                }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden touch-none"
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

            {/* Full image — swipeable */}
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
                  drag={allImages.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={handleDragEnd}
                >
                  <Image
                    src={allImages[index].url}
                    alt={allImages[index].alt}
                    fill
                    className="object-contain pointer-events-none"
                    sizes="100vw"
                    unoptimized
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fullscreen dots */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 pb-6 shrink-0">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.35)',
                      width: i === index ? 20 : 10,
                    }}
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
