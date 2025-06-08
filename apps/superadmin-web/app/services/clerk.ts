'use client';

import { useAuth } from '@clerk/nextjs';

/**
 * 클라이언트 컴포넌트에서 사용할 인증 정보를 가져오는 훅
 * 클라이언트 전용 함수입니다.
 */
export function useClerkAuth() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  return {
    isAuthenticated: isLoaded && isSignedIn,
    userId,
    isLoaded,
  };
}
