'use client';

import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useDevAuth } from '@/app/hooks/auth/useDevAuth';

// 인증 사용자 타입 (AuthContext와 일치시킴)
export interface AuthUser {
  id?: string;
  email: string;
  name?: string; // 이름 필드를 옵셔널로 설정
  role: string;
  isAuthenticated: boolean;
}

// 인증 컨텍스트 타입
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean }>;
}

// 기본 컨텍스트 값
const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => ({ success: false, error: '인증 컨텍스트가 초기화되지 않았습니다' }),
  signOut: async () => ({ success: false }),
};

// 간단한 라우터 구현
const useRouter = () => {
  return {
    push: (url: string) => {
      window.location.href = url;
    },
  };
};

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// 인증 컨텍스트 훅
export const useAuth = () => useContext(AuthContext);

/**
 * 인증 제공자 컴포넌트
 *
 * Clerk을 사용한 인증 로직을 제공합니다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const devAuth = useDevAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 세션 스토리지에서 사용자 정보 확인 (개발 환경용)
        const storedUser = sessionStorage.getItem('auth_user');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // TODO: 에러 처리 및 로깅 구현
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인 처리
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const result = await devAuth.signIn(email, password);

      if (result.success && result.user) {
        // 타입 안전한 객체 생성
        const authUser: AuthUser = {
          email: result.user.email,
          name: result.user.name || undefined, // 명시적으로 undefined 허용
          // role이 undefined일 경우 기본값 'user'를 사용
          role: result.user.role || 'user',
          isAuthenticated: true,
        };

        setUser(authUser);
        setIsAuthenticated(true);

        // 개발 환경용 세션 저장
        sessionStorage.setItem('auth_user', JSON.stringify(authUser));

        return { success: true };
      }

      return { success: false, error: '인증에 실패했습니다.' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '인증 중 오류가 발생했습니다.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 처리
  const signOut = async () => {
    setIsLoading(true);

    try {
      await devAuth.signOut();
      setUser(null);
      setIsAuthenticated(false);

      // 개발 환경용 세션 제거
      sessionStorage.removeItem('auth_user');

      // 로그인 페이지로 리디렉션
      router.push('/login');

      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
