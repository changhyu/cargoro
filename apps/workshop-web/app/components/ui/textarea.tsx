'use client';

/* eslint-disable react/prop-types */
import * as React from 'react';
import { cn } from '@cargoro/ui';

// TextareaProps는 React.TextareaHTMLAttributes<HTMLTextAreaElement>를 확장합니다
// 추가 속성이 필요한 경우 여기에 추가할 수 있습니다
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * 추가 CSS 클래스명
   */
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
