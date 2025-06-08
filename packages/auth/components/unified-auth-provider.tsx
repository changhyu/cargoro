'use client';

import { ReactNode, useEffect } from 'react';

import { initializeApiClient } from '@cargoro/api-client';

interface UnifiedAuthProviderProps {
  children: ReactNode;
  apiUrl?: string;
  appType?: 'web' | 'mobile';
  token?: string;
  userId?: string;
  userInfo?: unknown;
}

/**
 * 통합된 인증 프로바이더 컴포넌트
 * 인증 토큰을 관리하고 API 클라이언트를 초기화합니다.
 *
 * 이 컴포넌트는 토큰을 직접 전달받는 방식으로 변경되어, ClerkProvider 외부에서도 사용 가능합니다.
 */
export function UnifiedAuthProvider({
  children,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  appType = 'web',
  token,
  userId,
  userInfo,
}: UnifiedAuthProviderProps) {
  // 토큰이 있으면 API 클라이언트 초기화
  useEffect(() => {
    if (token) {
      initializeApiClient(apiUrl, token);
    }
  }, [token, apiUrl]);

  return <>{children}</>;
}
