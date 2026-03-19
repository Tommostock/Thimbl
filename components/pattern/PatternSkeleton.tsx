'use client';

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ''}`}
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    />
  );
}

export default function PatternSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      {/* Quick info cards */}
      <div className="flex gap-3">
        <Shimmer className="h-16 flex-1" />
        <Shimmer className="h-16 flex-1" />
      </div>

      {/* Materials */}
      <Shimmer className="h-8 w-32" />
      <Shimmer className="h-24 w-full" />

      {/* Instructions */}
      <Shimmer className="h-8 w-40" />
      <Shimmer className="h-12 w-full" />
      <Shimmer className="h-12 w-full" />
      <Shimmer className="h-12 w-full" />

      {/* Tips */}
      <Shimmer className="h-8 w-24" />
      <Shimmer className="h-20 w-full" />
    </div>
  );
}
