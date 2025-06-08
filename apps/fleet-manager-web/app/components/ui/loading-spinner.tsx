import * as React from 'react';

import { cn } from '../../../lib/utils';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-3',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-solid border-gray-300 border-t-transparent',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
export { LoadingSpinner as Spinner };
