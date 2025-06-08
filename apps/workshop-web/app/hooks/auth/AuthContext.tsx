'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useDevAuth } from './useDevAuth';

/**
 * 인증된 사용자 타입
 */
export interface AuthUser {
  id?: string;
  email: string;
  name?: string;
  role: string;
  isAuthenticated?: boolean;
}

/**
 * 인증 컨텍스트 타입
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    user?: {
      email: string;
      name?: string;
      role?: string;
    };

    isAuthenticated?: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
}

// 기본값과 함께 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => ({ success: false, error: '인증 컨텍스트가 초기화되지 않았습니다.' }),
  signOut: async () => {},
});

/**
 * 인증 컨텍스트 프로바이더
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // 개발 환경용 인증 훅 사용
  const auth = useDevAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * 인증 컨텍스트 사용 훅
 */
export function useAuth() {
  return useContext(AuthContext);
}
