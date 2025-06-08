'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { SWRProvider } from '@cargoro/auth/components/SWRProvider';
import RootProvider from './providers/root-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <SWRProvider>
          <RootProvider>{children}</RootProvider>
        </SWRProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
