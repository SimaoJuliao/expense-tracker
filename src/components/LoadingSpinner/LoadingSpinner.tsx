import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LoadingSpinnerProps } from './LoadingSpinner.helper';

export const LoadingSpinner = ({ size = 'md', label = 'Loading...' }: LoadingSpinnerProps) => {
  const spinnerSizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3" aria-live="polite">
      <div
        className={cn(
          'border-4 border-primary border-t-transparent rounded-full animate-spin',
          spinnerSizes[size]
        )}
        role="status"
        aria-label={label}
      />
      <span className="sr-only">{label}</span>
      <Skeleton className="h-3 w-24" aria-hidden="true" />
    </div>
  );
};
