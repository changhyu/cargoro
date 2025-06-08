'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import dynamic from 'next/dynamic';

// Toaster를 동적으로 로드하여 SSR 문제 방지
const Toaster = dynamic(() => import('./components/ui/toaster').then(mod => mod.Toaster), {
  ssr: false,
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkProvider
        dynamic
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#8b5cf6',
            colorText: '#f3f4f6',
            colorBackground: '#111827',
            colorInputBackground: '#1f2937',
            colorInputText: '#f3f4f6',
          },
        }}
      >
        {children}
      </ClerkProvider>
      <Toaster />
    </>
  );
}
