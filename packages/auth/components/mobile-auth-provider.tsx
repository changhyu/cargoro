/**
 * 모바일 앱용 Clerk 인증 Provider
 * 이 컴포넌트는 Clerk Authentication을 사용하여 모바일 앱의 인증 상태를 관리합니다.
 */
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// 기본값 설정
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
});

export const useMobileAuth = () => useContext(AuthContext);

interface MobileAuthProviderProps {
  children: ReactNode;
}

export const MobileAuthProvider: React.FC<MobileAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 초기 인증 상태 설정
    const checkAuthState = async () => {
      try {
        setLoading(true);

        // AsyncStorage에서 토큰 확인 또는 Clerk SDK의 모바일 호환 버전 사용
        // 실제 구현은 Clerk Mobile SDK 통합 방식에 따라 달라질 수 있음

        // 개발용 임시 코드
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // 로그인 함수
  const signIn = async (email: string, _password: string) => {
    try {
      setLoading(true);
      // Clerk API를 사용하여 로그인 처리
      console.log('Clerk 로그인 시도:', email);

      // API 호출 성공 후 사용자 정보 설정
      // 실제 구현에서는 Clerk Mobile SDK 또는 Clerk API를 호출

      // 개발용 임시 코드
      setTimeout(() => {
        setUser({
          id: '123456',
          email: email,
          firstName: '테스트',
          lastName: '사용자',
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      console.error('로그인 오류:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const signOut = async () => {
    try {
      setLoading(true);
      // Clerk API를 사용하여 로그아웃 처리
      console.log('Clerk 로그아웃 시도');

      // 개발용 임시 코드
      setTimeout(() => {
        setUser(null);
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };

  // 회원가입 함수
  const signUp = async (email: string, _password: string) => {
    try {
      setLoading(true);
      // Clerk API를 사용하여 회원가입 처리
      console.log('Clerk 회원가입 시도:', email);

      // 개발용 임시 코드
      setTimeout(() => {
        setUser({
          id: '123456',
          email: email,
          firstName: '신규',
          lastName: '사용자',
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      console.error('회원가입 오류:', error);
      throw error;
    }
  };

  // 비밀번호 재설정 함수
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // Clerk API를 사용하여 비밀번호 재설정 처리
      console.log('Clerk 비밀번호 재설정 시도:', email);

      // 개발용 임시 코드
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      console.error('비밀번호 재설정 오류:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
