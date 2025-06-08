import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center p-6 rounded-lg',
  {
    variants: {
      variant: {
        default: 'bg-gray-50 dark:bg-gray-800',
        outline: 'border border-gray-200 dark:border-gray-700',
        ghost: '',
      },
      size: {
        sm: 'p-4 gap-2',
        md: 'p-6 gap-3',
        lg: 'p-8 gap-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  fullHeight?: boolean;
  centered?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant,
      size,
      title,
      description,
      icon,
      action,
      footer,
      fullHeight = false,
      centered = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          emptyStateVariants({ variant, size }),
          fullHeight && 'h-full min-h-[240px]',
          centered && 'h-full flex-1 justify-center',
          className
        )}
        {...props}
      >
        {icon && <div className="mb-4 text-gray-400 dark:text-gray-500">{icon}</div>}

        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
        )}

        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}

        {children && <div className="mt-2">{children}</div>}

        {action && <div className="mt-6">{action}</div>}

        {footer && (
          <div className="mt-auto pt-4 text-xs text-gray-400 dark:text-gray-500">{footer}</div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
