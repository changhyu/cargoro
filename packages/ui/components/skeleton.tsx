import * as React from 'react';
import { cn } from '../utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-testid="skeleton"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/**
 * 주로 사용되는 Skeleton 컴포넌트 패턴들
 */

function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <Skeleton data-testid="avatar-skeleton" className={cn('rounded-full', sizeClasses[size])} />
  );
}

function TextSkeleton({
  width = 'full',
  height = 'md',
}: {
  width?: 'sm' | 'md' | 'lg' | 'full';
  height?: 'sm' | 'md' | 'lg';
}) {
  const widthClasses = {
    sm: 'w-20',
    md: 'w-40',
    lg: 'w-60',
    full: 'w-full',
  };

  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <Skeleton
      data-testid="text-skeleton"
      className={cn(widthClasses[width], heightClasses[height])}
    />
  );
}

function CardSkeleton() {
  return (
    <div data-testid="card-skeleton" className="space-y-3">
      <Skeleton className="h-[180px] w-full rounded-lg" />
      <div className="space-y-2">
        <TextSkeleton height="md" />
        <TextSkeleton width="sm" height="sm" />
      </div>
    </div>
  );
}

function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div data-testid="table-row-skeleton" className="flex items-center space-x-4 py-3">
      {Array(cols)
        .fill(null)
        .map((_, i) => (
          <TextSkeleton key={i} width={i === 0 ? 'sm' : i === cols - 1 ? 'lg' : 'md'} height="sm" />
        ))}
    </div>
  );
}

export { AvatarSkeleton, CardSkeleton, Skeleton, TableRowSkeleton, TextSkeleton };
