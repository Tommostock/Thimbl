'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CraftTutorial } from '@/lib/tutorials';

interface TutorialCardProps {
  tutorial: CraftTutorial;
  index?: number;
}

const craftBadgeColour: Record<string, string> = {
  knitting: '#8BA888',
  crochet: '#D4A0A0',
};

// Difficulty heuristic based on subcategory
function getDifficulty(sub: string): { label: string; colour: string } {
  const lower = sub.toLowerCase();
  if (['scarves', 'hats', 'baby', 'toys', 'christmas'].some((s) => lower.includes(s))) {
    return { label: 'Beginner', colour: '#8BA888' };
  }
  if (['sweaters', 'cardigans', "men's"].some((s) => lower.includes(s))) {
    return { label: 'Advanced', colour: '#C67B5C' };
  }
  return { label: 'Intermediate', colour: '#D4A843' };
}

export default function TutorialCard({ tutorial }: TutorialCardProps) {
  const difficulty = getDifficulty(tutorial.subcategory);

  return (
    <Link href={`/explore/${tutorial.id}`} className="block">
      <div className="card overflow-hidden active:scale-[0.98] transition-transform">
        {/* Cover image */}
        <div className="relative h-40">
          <Image
            src={tutorial.imageUrl}
            alt={tutorial.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
          />
          {/* Category badge */}
          <span
            className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: craftBadgeColour[tutorial.category] ?? '#8BA888',
              color: '#fff',
            }}
          >
            {tutorial.category === 'knitting' ? '🧶' : '🪝'} {tutorial.category}
          </span>
          {/* Difficulty badge */}
          <span
            className="absolute bottom-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: difficulty.colour, color: '#fff' }}
          >
            {difficulty.label}
          </span>
          {/* Subcategory badge */}
          <span
            className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}
          >
            {tutorial.subcategory}
          </span>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3
            className="font-semibold text-sm mb-1 line-clamp-2 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {tutorial.title}
          </h3>
          <p className="text-xs line-clamp-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {tutorial.description}
          </p>
          <span className="text-[10px] font-medium" style={{ color: 'var(--accent-primary)' }}>
            {tutorial.sourceName}
          </span>
        </div>
      </div>
    </Link>
  );
}
