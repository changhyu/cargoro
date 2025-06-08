'use client';

import React from 'react';
import { ToastProvider } from '@cargoro/ui';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <ToastProvider>
      <SonnerToaster />
    </ToastProvider>
  );
}
