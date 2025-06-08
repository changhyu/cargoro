import React from 'react';

export const Dialog = ({ children, open, onOpenChange }) => (
  <div data-testid="dialog" data-open={open ? 'true' : 'false'}>
    {open && children}
  </div>
);

export const DialogContent = ({ children, className }) => (
  <div data-testid="dialog-content" className={className}>
    {children}
  </div>
);

export const DialogHeader = ({ children, className }) => (
  <div data-testid="dialog-header" className={className}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className }) => (
  <div data-testid="dialog-title" className={className}>
    {children}
  </div>
);

export const DialogDescription = ({ children, className }) => (
  <div data-testid="dialog-description" className={className}>
    {children}
  </div>
);

export const DialogFooter = ({ children, className }) => (
  <div data-testid="dialog-footer" className={className}>
    {children}
  </div>
);

export const DialogTrigger = ({ children }) => <div data-testid="dialog-trigger">{children}</div>;

export const DialogClose = ({ children }) => <div data-testid="dialog-close">{children}</div>;

export default {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
};
