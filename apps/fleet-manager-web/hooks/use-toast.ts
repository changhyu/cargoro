import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = useCallback(({ title, description, variant }: ToastOptions) => {
    if (variant === 'destructive') {
      sonnerToast.error(title || '', {
        description,
      });
    } else {
      sonnerToast.success(title || '', {
        description,
      });
    }
  }, []);

  return { toast };
}
