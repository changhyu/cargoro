'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useEffect } from 'react';
import { useAuth, useSignIn } from '@clerk/nextjs';

/**
 * 개발 환경에서 자동 로그인 처리를 위한 컴포넌트
 * 반드시 ClerkProvider 내부에 배치해야 함
 */
export function AutoLoginHandler({ email, password }: { email: string; password: string }) {
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();

  useEffect(() => {
    // 개발 환경에서만 실행
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // 이미 로그인된 상태면 스킵
    if (isSignedIn) {
      return;
    }

    // 자동 로그인 시도
    const attemptLogin = async () => {
      try {
        if (signIn) {
          await signIn.create({
            identifier: email,
            password,
          });
          console.log('✅ 개발 환경 자동 로그인 성공:', email);
        }
      } catch (error) {
        console.error('❌ 개발 환경 자동 로그인 실패:', error);
      }
    };

    attemptLogin();
  }, [email, password, isSignedIn, signIn]);

  // UI를 렌더링하지 않음
  return null;
}

/**
 * 클락 인증 제공자와 자동 로그인 기능을 함께 제공하는 컴포넌트
 */
export function ClerkAuthProvider({
  children,
  publishableKey,
  darkMode = false,
  appearance,
  signInFallbackRedirectUrl = '/dashboard',
  signUpFallbackRedirectUrl = '/dashboard',
  signInForceRedirectUrl,
  signUpForceRedirectUrl,
  afterSignOutUrl = '/sign-in',
  autoLogin = true,
  autoLoginEmail = 'admin@cargoro-dev.com',
  autoLoginPassword = 'test1234',
}: {
  children: React.ReactNode;
  publishableKey?: string;
  darkMode?: boolean;
  appearance?: any;
  signInFallbackRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
  signInForceRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  afterSignOutUrl?: string;
  autoLogin?: boolean;
  autoLoginEmail?: string;
  autoLoginPassword?: string;
}) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={
        appearance || {
          baseTheme: darkMode ? dark : undefined,
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          },
        }
      }
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
      signInForceRedirectUrl={signInForceRedirectUrl}
      signUpForceRedirectUrl={signUpForceRedirectUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      {/* 개발 환경에서 자동 로그인 처리 (ClerkProvider 내부에 있어야 함) */}
      {process.env.NODE_ENV === 'development' && autoLogin && (
        <AutoLoginHandler email={autoLoginEmail} password={autoLoginPassword} />
      )}
      {children}
    </ClerkProvider>
  );
}
