import * as React from 'react';
import { cn } from '@cargoro/ui';

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  // separator prop은 구현되지 않았지만 향후 확장을 위해 인터페이스에 유지
  separator?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="경로"
        className={cn(
          'mx-auto flex w-full items-center overflow-auto text-sm text-muted-foreground',
          className
        )}
        {...props}
      />
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn('flex flex-wrap items-center gap-1.5 break-words sm:gap-2.5', className)}
      {...props}
    />
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...props} />
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('text-muted-foreground', className)}
    {...props}
  >
    {children || '/'}
  </span>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    asChild?: boolean;
    isCurrent?: boolean;
  }
>(({ asChild, isCurrent, className, children, ...props }, ref) => {
  if (asChild) {
    return (
      <span
        aria-current={isCurrent ? 'page' : undefined}
        className={cn(
          'transition-colors hover:text-foreground',
          isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      ref={ref}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        'transition-colors hover:text-foreground',
        isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      {children || <span className="sr-only">링크</span>}
    </a>
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator };
