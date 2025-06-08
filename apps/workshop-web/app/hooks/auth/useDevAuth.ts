'use client';

import { useState, useEffect } from 'react';
import { AuthUser, AuthContextType } from './AuthContext';

// 개발용 인증 훅
export function useDevAuth(): AuthContextType {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 개발 환경에서 자동 로그인
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setUser({
          email: 'dev@example.com',
          name: '개발자',
          role: 'admin',
          isAuthenticated: true,
        });
        setIsLoading(false);
      }, 500);
    }
  }, []);

  const signIn = async (email: string, _password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 개발 환경에서는 항상 성공
      await new Promise(resolve => setTimeout(resolve, 500));

      if (email === 'error@example.com') {
        setError('인증 오류가 발생했습니다');
        setIsLoading(false);
        return { success: false, error: '인증 오류가 발생했습니다' };
      }

      // 유저 데이터 생성
      const userData: AuthUser = {
        email,
        // 이메일의 첫 부분을 이름으로 사용
        name: email.split('@')[0],
        // 항상 문자열 값을 제공
        role: 'admin',
        isAuthenticated: true,
      };

      setUser(userData);
      setIsLoading(false);

      return {
        success: true,
        user: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
        isAuthenticated: true,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    // 개발 환경에서는 즉시 로그아웃
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setIsLoading(false);
  };

  // AuthContextType에 맞춰 isAuthenticated 추가
  const isAuthenticated = !!user;

  return {
    isAuthenticated,
    user,
    signIn,
    signOut,
    isLoading,
    error,
  };
}
