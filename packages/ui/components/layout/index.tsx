'use client';

// 레이아웃 컴포넌트 내보내기
// 여기에 추가적인 레이아웃 컴포넌트를 추가할 수 있습니다.

import { cn } from '../../lib/utils';
import * as React from 'react';

// 컨테이너 컴포넌트
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-3xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full px-4', sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

// 그리드 컴포넌트
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 12, gap = 'md', ...props }, ref) => {
    const colsClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12',
    };

    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn('grid', colsClasses[cols], gapClasses[gap], className)}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

// 섹션 컴포넌트
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = 'md', ...props }, ref) => {
    const spacingClasses = {
      sm: 'py-4',
      md: 'py-8',
      lg: 'py-12',
      xl: 'py-16',
    };

    return <section ref={ref} className={cn(spacingClasses[spacing], className)} {...props} />;
  }
);
Section.displayName = 'Section';

// 플렉스 박스 컴포넌트
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = 'row',
      align = 'start',
      justify = 'start',
      gap = 'none',
      wrap = false,
      ...props
    },
    ref
  ) => {
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          gapClasses[gap],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      />
    );
  }
);
Flex.displayName = 'Flex';
