import * as React from 'react';
import { cn } from '../utils';

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = '/', ...props }, ref) => {
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
    children?: React.ReactNode;
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

const BreadcrumbEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
    <span className="sr-only">더 많은 페이지</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// 편의를 위한 복합 컴포넌트 및 유틸리티
export interface BreadcrumbItemType {
  href: string;
  label: string;
  isCurrent?: boolean;
}

interface SimpleBreadcrumbsProps {
  items: BreadcrumbItemType[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

const SimpleBreadcrumbs = ({
  items,
  separator,
  maxItems = 5, // 표시할 최대 아이템 수
  className,
}: SimpleBreadcrumbsProps) => {
  // 아이템이 maxItems보다 많을 경우 중간 부분 생략
  const visibleItems =
    items.length > maxItems
      ? [
          ...items.slice(0, Math.max(1, Math.floor(maxItems / 2) - 1)),
          { href: '', label: '', isCurrent: false }, // 생략 아이템
          ...items.slice(items.length - Math.ceil(maxItems / 2), items.length),
        ]
      : items;

  return (
    <Breadcrumb separator={separator} className={className}>
      <BreadcrumbList>
        {visibleItems.map((item, index) => (
          <React.Fragment key={item.href || `ellipsis-${index}`}>
            {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
            <BreadcrumbItem>
              {item.href === '' ? (
                <BreadcrumbEllipsis />
              ) : (
                <BreadcrumbLink href={item.href} isCurrent={item.isCurrent}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  SimpleBreadcrumbs,
};
