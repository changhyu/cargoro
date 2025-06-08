'use client';

import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { ToastProvider } from '@cargoro/ui';

export function Toaster() {
  return (
    <ToastProvider>
      <SonnerToaster />
    </ToastProvider>
  );
}
