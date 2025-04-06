import { cn } from '@/services/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-50/60', className)}
      {...props}
    />
  );
}

export { Skeleton };
