'use client';

import { ReactNode } from 'react';

import { Toaster } from 'sonner';

import ApiProvider from './api-provider';

interface RootProviderProps {
  children: ReactNode;
}

export default function RootProvider({ children }: RootProviderProps) {
  return (
    <ApiProvider>
      {children}
      <Toaster position="top-right" />
    </ApiProvider>
  );
}
