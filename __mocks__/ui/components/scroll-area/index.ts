import React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollArea = ({ children, className }: ScrollAreaProps) =>
  React.createElement('div', { 'data-testid': 'ui-scroll-area', className }, children);

ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
export type { ScrollAreaProps };
