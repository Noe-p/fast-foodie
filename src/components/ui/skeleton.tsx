import { cn } from '@/services/utils';
import React from 'react';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-md bg-background/60', className)}
      {...props}
    />
  );
}

export { Skeleton };
