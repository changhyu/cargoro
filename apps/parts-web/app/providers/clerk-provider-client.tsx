'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

interface ClerkProviderClientProps {
  children: ReactNode;
}

/**
 * 클라이언트 측 Clerk 프로바이더
 *
 * 서버 컴포넌트에서 ClerkProvider를 직접 사용할 때 발생하는 타입 오류를 피하기 위해
 * 클라이언트 컴포넌트로 분리합니다.
 */
export function ClerkProviderClient({ children }: ClerkProviderClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 미디어 쿼리로 다크 모드 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 마운트되기 전에는 렌더링하지 않음
  if (!isMounted) {
    return null;
  }

  // ClerkProvider의 타입 오류를 해결하기 위해 타입 정의
  interface ClerkProviderProps {
    children: React.ReactNode;
    publishableKey?: string;
    appearance?: {
      baseTheme?: unknown;
      elements?: Record<string, unknown>;
    };
    signInUrl?: string;
    signUpUrl?: string;
    afterSignInUrl?: string;
    afterSignUpUrl?: string;
  }

  const ClerkProviderTyped = ClerkProvider as React.FC<ClerkProviderProps>;

  return (
    <ClerkProviderTyped
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dummy'}
      appearance={{
        baseTheme: isDarkMode ? dark : undefined,
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          card: 'bg-background',
          footerActionLink: 'text-primary hover:text-primary/90',
          formFieldInput: {
            'border-radius': '0.5rem',
            'box-shadow': 'none',
            'border-width': '1px',
          },
          formFieldInputPassword: {
            'border-radius': '0.5rem',
            'box-shadow': 'none',
            'border-width': '1px',
            autocomplete: 'current-password',
            id: 'current-password',
          },
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      {children}
    </ClerkProviderTyped>
  );
}
