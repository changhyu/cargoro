import React from 'react';

import { toast as sonnerToast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
}

export const useToast = () => {
  const toast = React.useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    if (variant === 'destructive') {
      sonnerToast.error(title || description);
    } else {
      sonnerToast.success(title || description);
    }
  }, []);

  return { toast };
};

export const toast = (props: ToastProps) => {
  const { variant = 'default', title, description } = props;

  if (variant === 'destructive') {
    sonnerToast.error(title || description);
  } else {
    sonnerToast.success(title || description);
  }
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
