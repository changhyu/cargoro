'use client';

import { useState, useEffect } from 'react';

// 안전하게 Clerk의 인증 상태를 확인하는 훅
export function useSafeAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 쿠키 또는 localStorage에서 로그인 상태를 확인하는 방법
        // 여기서는 간단한 예시로 localStorage를 사용하지만,
        // 실제로는 Clerk의 상태를 더 정확하게 반영하는 방법이 필요합니다
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('__clerk_session='));

        setIsSignedIn(!!authCookie);
      } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        setIsSignedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isSignedIn, isLoading };
}
