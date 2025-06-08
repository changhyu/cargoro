'use client';

import React, { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Suspense fallback={<div>인증 로딩 중...</div>}>
      <ClerkProvider
        signInFallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            footerActionLink: 'text-blue-600 hover:text-blue-700',
          },
        }}
        dynamic
      >
        {children}
      </ClerkProvider>
    </Suspense>
  );
}
