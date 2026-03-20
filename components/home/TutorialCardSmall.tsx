'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CraftTutorial } from '@/lib/tutorials';

interface TutorialCardSmallProps {
  tutorial: CraftTutorial;
}

export default function TutorialCardSmall({ tutorial }: TutorialCardSmallProps) {
  return (
    <Link href={`/explore/${tutorial.id}`} className="block">
      <div
        className="rounded-xl overflow-hidden min-w-[150px] w-[150px] active:scale-[0.97] transition-transform"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="relative h-24">
          <Image
            src={tutorial.imageUrl}
            alt={tutorial.title}
            fill
            className="object-cover"
            sizes="150px"
            unoptimized
          />
        </div>
        <div className="p-2.5">
          <h3
            className="font-medium text-xs line-clamp-2 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {tutorial.title}
          </h3>
          <span className="text-[10px] mt-1 block" style={{ color: 'var(--text-muted)' }}>
            {tutorial.subcategory}
          </span>
        </div>
      </div>
    </Link>
  );
}
