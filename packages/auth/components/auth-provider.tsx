import { createContext, ReactNode, useContext, useEffect, useState, useMemo } from 'react';

import { useCurrentUser } from '@cargoro/api-client';
import { User, AuthContextType } from '@cargoro/types';

// API 클라이언트의 User 타입을 @cargoro/types User 타입으로 변환
const transformUser = (apiUser: any): User | null => {
  if (!apiUser) return null;

  return {
    id: apiUser.id,
    clerkId: apiUser.clerkId || '',
    email: apiUser.email,
    fullName:
      apiUser.name ||
      `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() ||
      'Unknown User',
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    phone: apiUser.phoneNumber,
    phoneNumber: apiUser.phoneNumber,
    role: apiUser.role || 'CUSTOMER',
    organizationId: apiUser.organizationId,
    profileImageUrl: apiUser.profileImageUrl,
    profileImage: apiUser.profileImageUrl,
    isActive: apiUser.active !== false,
    active: apiUser.active !== false,
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
    updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : new Date(),
    lastLogin: apiUser.lastLogin ? new Date(apiUser.lastLogin) : undefined,
  };
};

// 기본 컨텍스트 값
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  login: () => {},
  logout: () => {},
};

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(defaultContext);

// 인증 컨텍스트 사용 훅
export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 인증 상태를 관리하는 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [_token, setToken] = useState<string | null>(null);
  const { user, isLoading, error } = useCurrentUser();

  // 로컬 스토리지에서 토큰 로드
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  /**
   * 로그인 처리
   */
  const login = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  /**
   * 로그아웃 처리
   */
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
  };

  // 인증 컨텍스트 값
  const value: AuthContextType = useMemo(
    () => ({
      isAuthenticated: !!user,
      isLoading,
      user: transformUser(user),
      error: error ? new Error(error) : null,
      login,
      logout,
    }),
    [user, isLoading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
