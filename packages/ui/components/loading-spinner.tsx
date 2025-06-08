import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils';

const spinnerVariants = cva('animate-spin rounded-full border-current border-t-transparent', {
  variants: {
    size: {
      xs: 'h-3 w-3 border-[2px]',
      sm: 'h-4 w-4 border-[2px]',
      md: 'h-6 w-6 border-[3px]',
      lg: 'h-8 w-8 border-[3px]',
      xl: 'h-12 w-12 border-[4px]',
    },
    variant: {
      default: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-green-500',
      warning: 'text-amber-500',
      danger: 'text-red-500',
      info: 'text-blue-500',
      light: 'text-gray-200',
      dark: 'text-gray-800',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  srOnly?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    { className, size, variant, label, labelPosition = 'bottom', srOnly = false, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={srOnly && !label ? '로딩 중' : undefined}
        className={cn(
          'inline-flex items-center justify-center',
          labelPosition === 'top' && 'flex-col-reverse gap-2',
          labelPosition === 'bottom' && 'flex-col gap-2',
          labelPosition === 'left' && 'flex-row-reverse gap-3',
          labelPosition === 'right' && 'flex-row gap-3',
          className
        )}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))}>
          <span className="sr-only">로딩 중...</span>
        </div>

        {label && !srOnly ? (
          <span className="text-sm font-medium">{label}</span>
        ) : (
          <span className="sr-only">로딩 중...</span>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };

// Spinner라는 이름으로 동일한 컴포넌트를 내보냄
export const Spinner = LoadingSpinner;

// 풀스크린 로딩 오버레이
export interface LoadingOverlayProps extends Omit<LoadingSpinnerProps, 'labelPosition'> {
  fullPage?: boolean;
  backdropBlur?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    { className, size, variant, label, srOnly, fullPage = false, backdropBlur = false, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          fullPage ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
          backdropBlur
            ? 'bg-white/60 backdrop-blur-sm dark:bg-gray-900/60'
            : 'bg-white/80 dark:bg-gray-900/80',
          className
        )}
        {...props}
      >
        <LoadingSpinner size={size} variant={variant} label={label} srOnly={srOnly} />
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

export { LoadingOverlay };
