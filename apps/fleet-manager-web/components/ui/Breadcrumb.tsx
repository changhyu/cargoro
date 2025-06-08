import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@cargoro/ui';

export interface BreadcrumbProps {
  className?: string;
  children: React.ReactNode;
}

export interface BreadcrumbItemProps {
  className?: string;
  children: React.ReactNode;
}

export interface BreadcrumbLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </nav>
  )
);
Breadcrumb.displayName = 'Breadcrumb';

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...props }, ref) => (
    <li ref={ref} className={cn('flex items-center', className)} {...props}>
      {children}
    </li>
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ href, className, children, ...props }, ref) => (
    <>
      <Link
        ref={ref}
        href={href}
        className={cn('transition-colors hover:text-foreground', className)}
        {...props}
      >
        {children}
      </Link>
      <ChevronRight className="mx-1 h-4 w-4" />
    </>
  )
);
BreadcrumbLink.displayName = 'BreadcrumbLink';
