'use client';

import { ClerkProvider } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { ToastProvider } from './toast-provider';

// 클러크 프로바이더 props 타입 문제 해결을 위한 타입 정의
interface CustomClerkProviderProps {
  children: React.ReactNode;
  publishableKey?: string;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
}

const CustomClerkProvider = ClerkProvider as React.FC<CustomClerkProviderProps>;

/**
 * 인증 제공자 컴포넌트
 *
 * Clerk을 사용한 인증 로직을 제공합니다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <CustomClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <ToastProvider>{children}</ToastProvider>
    </CustomClerkProvider>
  );
}
