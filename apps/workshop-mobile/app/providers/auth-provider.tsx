import React, { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';

// View, Text, ActivityIndicator는 사용 예정

import type { User } from '@cargoro/types';

// 인증 컨텍스트 타입 정의
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

// Auth 컨텍스트 생성
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth 컨텍스트 사용 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증 제공자 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 가짜 사용자 데이터 (실제로는 API에서 가져옴)
  const mockUser: User = {
    id: 'user_2Npyz8RGytlcbftX0kJFEHQSqTc',
    email: 'test@example.com',
    fullName: '홍길동',
    role: 'WORKSHOP_STAFF',
    phone: '010-1234-5678',
    isActive: true,
    active: true, // 호환성을 위한 필드 추가
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 초기 로딩 시뮬레이션
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 실제 구현: 저장된 인증 상태 확인
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        // 개발용: 자동 로그인 상태로 설정
        setUser(mockUser);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('인증 초기화 중 오류가 발생했습니다.'));
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 로그인 처리
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // 실제 구현: API 로그인 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

      // 로그인 성공: 사용자 정보 설정
      setUser(mockUser);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('로그인 중 오류가 발생했습니다.'));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리
  const signOut = async () => {
    try {
      setLoading(true);
      // 실제 구현: API 로그아웃 호출
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      setUser(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('로그아웃 중 오류가 발생했습니다.'));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 처리
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      // 실제 구현: API 회원가입 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션

      // 회원가입 후 자동 로그인
      setUser({
        ...mockUser,
        email,
        fullName: name,
        active: true, // 호환성을 위한 필드 추가
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('회원가입 중 오류가 발생했습니다.'));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 컨텍스트 값 준비
  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signIn,
      signOut,
      signUp,
    }),
    [user, loading, error, signIn, signOut, signUp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
