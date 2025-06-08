'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkPublishableKey } from '../lib/clerk';
import { koKR } from '@clerk/localizations';

interface ClerkWebProviderProps {
  children: React.ReactNode;
}

export function ClerkWebProvider({ children }: ClerkWebProviderProps) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} localization={koKR}>
      {children}
    </ClerkProvider>
  );
}

// 개발 환경 자동 로그인 컴포넌트
export function DevAutoLogin() {
  // 개발 환경에서만 작동
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return null; // 실제 자동 로그인 로직은 ClerkAuthProvider에서 처리
}
