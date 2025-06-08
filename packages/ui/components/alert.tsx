import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import { AlertCircleIcon, CheckIcon, CloseIcon } from '../icons';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-blue-400 bg-blue-50 text-blue-800 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200',
        warning:
          'border-yellow-400 bg-yellow-50 text-yellow-800 dark:border-yellow-400 dark:bg-yellow-950 dark:text-yellow-200',
        success:
          'border-green-400 bg-green-50 text-green-800 dark:border-green-400 dark:bg-green-950 dark:text-green-200',
        error:
          'border-red-400 bg-red-50 text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, children, variant, onClose, icon, ...props }, ref) => {
    const getDefaultIcon = () => {
      if (!icon) {
        switch (variant) {
          case 'info':
            return <AlertCircleIcon className="h-4 w-4 text-blue-500" />;
          case 'warning':
            return <AlertCircleIcon className="h-4 w-4 text-yellow-500" />;
          case 'success':
            return <CheckIcon className="h-4 w-4 text-green-500" />;
          case 'error':
            return <AlertCircleIcon className="h-4 w-4 text-red-500" />;
          default:
            return null;
        }
      }
      return icon;
    };

    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        {getDefaultIcon()}
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <CloseIcon className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {props.children}
    </h5>
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
