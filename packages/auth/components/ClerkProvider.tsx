/**
 * Clerk 인증 제공자 컴포넌트
 *
 * 웹 애플리케이션에서 Clerk 인증을 사용하기 위한 제공자 컴포넌트입니다.
 * 모든 Next.js 앱에서 재사용 가능한 설정을 제공합니다.
 */

'use client';

import React from 'react';
import { ClerkProvider as NextClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { clerkPublishableKey } from '../lib/clerk';

/**
 * ClerkProvider 프로퍼티 정의
 */
interface ClerkProviderProps {
  children: React.ReactNode;
  appearance?: {
    baseTheme?: typeof dark;
    elements?: Record<string, React.CSSProperties>;
  };
  localization?: Record<string, any>;
  navigate?: (to: string) => void;
  routing?: 'hash' | 'path' | 'virtual';
  darkMode?: boolean;

  // 최신 리다이렉트 URL 설정
  signInFallbackRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
  signInForceRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  afterSignOutUrl?: string;
}

/**
 * 인증 오류 처리 함수
 */
const handleClerkError = (err: Error) => {
  console.error('Clerk 인증 오류:', err);

  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    // "Unable to complete action at this time" 오류 처리
    if (err.message && err.message.includes('Unable to complete action at this time')) {
      console.log('Clerk 인증 상태 초기화 중...');

      // 로컬 스토리지에서 Clerk 관련 데이터 삭제
      Object.keys(window.localStorage)
        .filter(key => key.startsWith('clerk.'))
        .forEach(key => window.localStorage.removeItem(key));

      // Clerk 관련 쿠키 삭제
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=').map(c => c.trim());
        if (name.startsWith('__clerk') || name.startsWith('__session')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });

      // 페이지 새로고침
      window.location.reload();
    }
  }
};

/**
 * 웹 환경용 Clerk 제공자 (Next.js)
 */
export function WebClerkProvider({
  children,
  appearance,
  darkMode = false,
  signInFallbackRedirectUrl = '/',
  signUpFallbackRedirectUrl = '/',
  signInForceRedirectUrl,
  signUpForceRedirectUrl,
  afterSignOutUrl = '/sign-in',
}: ClerkProviderProps) {
  // 다크 모드 설정
  const baseTheme = darkMode ? dark : undefined;

  // 통합 모양 설정
  const mergedAppearance = {
    baseTheme,
    ...appearance,
  };

  return (
    <NextClerkProvider
      appearance={mergedAppearance}
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
      signInForceRedirectUrl={signInForceRedirectUrl}
      signUpForceRedirectUrl={signUpForceRedirectUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      {children}
    </NextClerkProvider>
  );
}

/**
 * 리액트 앱용 Clerk 제공자 (비 Next.js 환경)
 */
export function ReactClerkProvider({
  children,
  appearance,
  navigate,
  routing = 'path',
  darkMode = false,
  signInFallbackRedirectUrl = '/',
  signUpFallbackRedirectUrl = '/',
  signInForceRedirectUrl,
  signUpForceRedirectUrl,
  afterSignOutUrl = '/sign-in',
}: ClerkProviderProps) {
  // 다크 모드 설정
  const baseTheme = darkMode ? dark : undefined;

  // 통합 모양 설정
  const mergedAppearance = {
    baseTheme,
    ...appearance,
  };

  // Clerk 키가 없으면 에러 표시
  if (!clerkPublishableKey) {
    console.error('Clerk publishable key가 설정되지 않았습니다. 환경 변수를 확인하세요.');
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Clerk 설정 오류</h2>
        <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 환경 변수가 설정되지 않았습니다.</p>
      </div>
    );
  }

  return (
    <NextClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={mergedAppearance}
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
      signInForceRedirectUrl={signInForceRedirectUrl}
      signUpForceRedirectUrl={signUpForceRedirectUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      {children}
    </NextClerkProvider>
  );
}

/**
 * 기본 Clerk 제공자 - 자동으로 환경에 맞는 제공자 선택
 */
export function CustomClerkProvider(props: ClerkProviderProps) {
  // Next.js 환경 감지 (typeof window가 아닌 process.env.NEXT_PUBLIC_APP_ENV로 구분)
  const isNextJs = true; // Next.js 환경으로 고정

  if (isNextJs) {
    return <WebClerkProvider {...props} />;
  }

  return <ReactClerkProvider {...props} />;
}

export default CustomClerkProvider;
