'use client';

import { Toaster } from 'sonner';
import { ReactNode } from 'react';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
