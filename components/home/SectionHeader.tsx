'use client';

import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  href?: string;
  count?: number;
}

export default function SectionHeader({ title, href, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2
        className="text-lg font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        {title}
        {count !== undefined && (
          <span
            className="ml-2 text-sm font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            ({count})
          </span>
        )}
      </h2>

      {href && (
        <Link
          href={href}
          className="text-sm font-medium"
          style={{ color: 'var(--accent-primary)' }}
        >
          See All &gt;
        </Link>
      )}
    </div>
  );
}
