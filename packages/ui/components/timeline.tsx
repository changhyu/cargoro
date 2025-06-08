'use client';

import React, { createContext, useContext } from 'react';
import { cn } from '../lib/utils';

interface TimelineContextValue {
  compact?: boolean;
}

const TimelineContext = createContext<TimelineContextValue>({
  compact: false,
});

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  children?: React.ReactNode;
}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ compact = false, className, children, ...props }, ref) => {
    return (
      <TimelineContext.Provider value={{ compact }}>
        <div ref={ref} className={cn('space-y-4', className)} {...props}>
          {children}
        </div>
      </TimelineContext.Provider>
    );
  }
);
Timeline.displayName = 'Timeline';

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

// TimelineItem 컴포넌트 타입 정의 - 서브 컴포넌트를 포함하기 위한 확장
interface TimelineItemComponent
  extends React.ForwardRefExoticComponent<TimelineItemProps & React.RefAttributes<HTMLDivElement>> {
  Header: typeof TimelineHeader;
  Icon: typeof TimelineIcon;
  Title: typeof TimelineTitle;
  Time: typeof TimelineTime;
  Content: typeof TimelineContent;
}

// 서브 컴포넌트들을 먼저 정의
interface TimelineIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ className, children, ...props }, ref) => {
    const { compact } = useContext(TimelineContext);
    return (
      <div
        ref={ref}
        className={cn(
          'absolute -left-[0.4rem] top-1 flex h-3 w-3 items-center justify-center rounded-full border border-background bg-primary',
          compact ? '-left-[0.3rem] h-2 w-2' : '-left-[0.4rem] h-3 w-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineIcon.displayName = 'TimelineIcon';

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col space-y-1 pb-2', className)} {...props}>
        {children}
      </div>
    );
  }
);
TimelineHeader.displayName = 'TimelineHeader';

interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

const TimelineTitle = React.forwardRef<HTMLHeadingElement, TimelineTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h4 ref={ref} className={cn('text-sm font-semibold leading-snug', className)} {...props}>
        {children}
      </h4>
    );
  }
);
TimelineTitle.displayName = 'TimelineTitle';

interface TimelineTimeProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

const TimelineTime = React.forwardRef<HTMLParagraphElement, TimelineTimeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn('text-xs text-muted-foreground', className)} {...props}>
        {children}
      </p>
    );
  }
);
TimelineTime.displayName = 'TimelineTime';

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
        {children}
      </div>
    );
  }
);
TimelineContent.displayName = 'TimelineContent';

// TimelineItem 컴포넌트 정의
const TimelineItemBase = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => {
    const { compact } = useContext(TimelineContext);
    return (
      <div
        ref={ref}
        className={cn('relative pb-4 pl-6 last:pb-0', compact ? 'pl-4' : 'pl-6', className)}
        {...props}
      >
        <span className="absolute left-0 top-1 h-full w-px bg-border" />
        {children}
      </div>
    );
  }
);
TimelineItemBase.displayName = 'TimelineItem';

// TimelineItem을 TimelineItemComponent로 캐스팅하고 서브 컴포넌트를 할당
const TimelineItem = TimelineItemBase as TimelineItemComponent;
TimelineItem.Header = TimelineHeader;
TimelineItem.Icon = TimelineIcon;
TimelineItem.Title = TimelineTitle;
TimelineItem.Time = TimelineTime;
TimelineItem.Content = TimelineContent;

export { TimelineItem };
