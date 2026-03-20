'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import type { PatternImage } from '@/lib/types/pattern';

interface PatternImageCarouselProps {
  images: PatternImage[];
  fallbackImage: string;
  title: string;
}

const SWIPE_THRESHOLD = 40;

export default function PatternImageCarousel({
  images,
  fallbackImage,
  title,
}: PatternImageCarouselProps) {
  const allImages = images.length > 0 ? images : [{ url: fallbackImage, alt: title }];
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const dragRef = useRef(false);

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [fullscreen]);

  const goTo = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(i, allImages.length - 1)));
    },
    [allImages.length],
  );

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      dragRef.current = true;
      setTimeout(() => { dragRef.current = false; }, 100);
      if (info.offset.x < -SWIPE_THRESHOLD && index < allImages.length - 1) {
        goTo(index + 1);
      } else if (info.offset.x > SWIPE_THRESHOLD && index > 0) {
        goTo(index - 1);
      }
    },
    [index, allImages.length, goTo],
  );

  const handleTap = useCallback(() => {
    if (!dragRef.current) setFullscreen(true);
  }, []);

  // Shared carousel strip renderer
  const renderStrip = (height: string, objectFit: 'cover' | 'contain') => (
    <motion.div
      className="flex h-full"
      animate={{ x: `-${index * 100}%` }}
      transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
      drag={allImages.length > 1 ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      style={{ width: `${allImages.length * 100}%` }}
    >
      {allImages.map((img, i) => (
        <div
          key={i}
          className="relative shrink-0"
          style={{ width: `${100 / allImages.length}%`, height }}
        >
          <Image
            src={img.url}
            alt={img.alt}
            fill
            className={`pointer-events-none ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
            sizes="100vw"
            unoptimized
            priority={i === 0}
            draggable={false}
          />
        </div>
      ))}
    </motion.div>
  );

  return (
    <>
      {/* Hero carousel */}
      <div className="relative h-72 overflow-hidden" onClick={handleTap}>
        {renderStrip('100%', 'cover')}

        {/* Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className="h-2 rounded-full transition-all duration-200"
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
      {fullscreen && (
        <div
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

          {/* Full image — swipeable strip */}
          <div className="flex-1 relative mx-4 mb-4 overflow-hidden">
            {renderStrip('100%', 'contain')}
          </div>

          {/* Fullscreen dots */}
          {allImages.length > 1 && (
            <div className="flex justify-center gap-2 pb-6 shrink-0">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-2.5 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.35)',
                    width: i === index ? 20 : 10,
                  }}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
