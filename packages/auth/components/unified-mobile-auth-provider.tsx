'use client';

import { ReactNode, useEffect } from 'react';

import { initializeApiClient } from '@cargoro/api-client';
import { useAuth, useUser } from '@clerk/clerk-react';

interface UnifiedMobileAuthProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

/**
 * 모바일용 통합 인증 프로바이더 컴포넌트
 * React Native 환경에서 Clerk 인증을 처리하며 토큰을 관리합니다.
 *
 * 주의: 이 컴포넌트는 반드시 ClerkProvider 내부에서 사용해야 합니다.
 */
export function UnifiedMobileAuthProvider({
  children,
  apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000',
}: UnifiedMobileAuthProviderProps) {
  // 모바일 환경에서는 @clerk/clerk-react 훅을 사용
  const { getToken, userId } = useAuth();
  const { user } = useUser();

  // Clerk 인증 토큰을 API 클라이언트에 설정
  useEffect(() => {
    if (userId && user) {
      const setupApiToken = async () => {
        try {
          const token = await getToken();
          if (token) {
            initializeApiClient(apiUrl, token);
          }
        } catch (error) {
          console.error('Clerk 토큰 설정 오류:', error);
        }
      };

      setupApiToken();
    }
  }, [userId, user, getToken, apiUrl]);

  return <>{children}</>;
}
