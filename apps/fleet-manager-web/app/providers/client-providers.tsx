'use client';

import { Toaster } from '@cargoro/ui';

import { AppProvider } from './app-provider';
import { QueryProvider } from './query-provider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        {children}
        <Toaster />
      </AppProvider>
    </QueryProvider>
  );
}
