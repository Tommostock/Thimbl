'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
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
  const [fullscreen, setFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [fullscreen]);

  // Track scroll position to update dots
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const newIndex = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(newIndex);
  }, []);

  return (
    <>
      {/* Hero carousel — native horizontal scroll with snap */}
      <div className="relative h-72">
        <div
          ref={scrollRef}
          className="flex h-full overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          onScroll={handleScroll}
        >
          {allImages.map((img, i) => (
            <div
              key={i}
              className="relative w-full h-full shrink-0 snap-center cursor-pointer"
              onClick={() => setFullscreen(true)}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
                priority={i === 0}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, i) => (
              <div
                key={i}
                className="h-2 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
                  width: i === index ? 16 : 8,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
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

          {/* Fullscreen images — native scroll with snap */}
          <div
            ref={fullscreenScrollRef}
            className="flex-1 flex overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            onScroll={handleScroll}
          >
            {allImages.map((img, i) => (
              <div
                key={i}
                className="relative w-full h-full shrink-0 snap-center"
                style={{ minWidth: '100%' }}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Fullscreen dots */}
          {allImages.length > 1 && (
            <div className="flex justify-center gap-2 pb-6 pt-2 shrink-0">
              {allImages.map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.35)',
                    width: i === index ? 20 : 10,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
