import type React from 'react';
import { classnames } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={classnames('animate-pulse rounded-md bg-muted', className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={classnames('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="flex gap-4">
          {[100, 200, 80, 120, 60].map((width, i) => (
            <Skeleton key={i} className="h-3" style={{ width }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b px-4 py-3 last:border-0">
          <div className="flex gap-4">
            {[100, 200, 80, 120, 60].map((width, j) => (
              <Skeleton key={j} className="h-3" style={{ width }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
