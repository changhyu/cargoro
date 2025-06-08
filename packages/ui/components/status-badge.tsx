import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

// 상태 배지의 스타일 변형 정의
const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default:
          'bg-gray-50 text-gray-800 ring-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700',
        primary:
          'bg-blue-50 text-blue-800 ring-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800/30',
        secondary:
          'bg-gray-50 text-gray-800 ring-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700',
        success:
          'bg-green-50 text-green-800 ring-green-300 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-800/30',
        warning:
          'bg-yellow-50 text-yellow-800 ring-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-800/30',
        destructive:
          'bg-red-50 text-red-800 ring-red-300 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800/30',
        info: 'bg-blue-50 text-blue-800 ring-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode;
}

/**
 * StatusBadge 컴포넌트
 * 항목의 상태를 표시하는 배지 컴포넌트
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(statusBadgeVariants({ variant, size }), className)} {...props}>
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
