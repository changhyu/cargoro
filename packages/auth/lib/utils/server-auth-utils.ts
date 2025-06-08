import * as clerkServer from '@clerk/nextjs/server';
import { cookies, headers } from 'next/headers';

// 서버 컴포넌트 전용 auth 유틸리티
// next/headers를 사용하는 함수들을 여기에 분리

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DRIVER = 'driver',
  USER = 'user',
}

export interface UserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  permissions?: string[];
}

interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, unknown>;
}

// 현재 인증된 사용자 정보 가져오기 (서버 컴포넌트에서 사용)
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    const user = (await clerkServer.currentUser()) as ClerkUser | null;
    if (!user) return null;

    const userData: UserInfo = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      imageUrl: user.imageUrl,
      role: (user.publicMetadata?.role as UserRole) || UserRole.USER,
      organizationId: user.publicMetadata?.organizationId as string,
      organizationName: user.publicMetadata?.organizationName as string,
      permissions: user.publicMetadata?.permissions as string[],
    };

    return userData;
  } catch (error) {
    console.error('사용자 정보 조회 에러:', error);
    return null;
  }
};

// 서버 컴포넌트에서 인증 상태 확인
export const getServerAuth = () => {
  return clerkServer.auth();
};

// API 호출시 사용할 인증 헤더를 반환하는 유틸리티 함수 (서버 컴포넌트용)
export const getAuthHeader = async (): Promise<Record<string, string>> => {
  const authResult = await clerkServer.auth();
  const token = await authResult.getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// 사용자 로그인 상태 확인 (서버 컴포넌트)
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await clerkServer.currentUser();
  return !!user;
};

// 사용자 역할 확인 함수
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    [UserRole.ADMIN]: 4,
    [UserRole.MANAGER]: 3,
    [UserRole.DRIVER]: 2,
    [UserRole.USER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// 사용자 권한 확인 함수
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
};

// 사용자 역할 확인 (서버 컴포넌트)
export const checkUserRole = async (requiredRole: UserRole): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  return hasRole(user.role, requiredRole);
};

// 사용자 권한 확인 (서버 컴포넌트)
export const checkUserPermission = async (requiredPermission: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user || !user.permissions) return false;

  return hasPermission(user.permissions, requiredPermission);
};

// 토큰 검증 함수
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    return !!token && token.length > 10;
  } catch (error) {
    console.error('토큰 검증 에러:', error);
    return false;
  }
};

// 서버 사이드 인증 토큰 가져오기
export const getServerAuthToken = async (): Promise<string | null> => {
  const authResult = await clerkServer.auth();
  return await authResult.getToken();
};

// 서버 사이드 사용자 데이터 가져오기
export const getServerUserData = async () => {
  return await getCurrentUser();
};

// 서버 사이드 사용자 역할 가져오기
export const getServerUserRole = async (): Promise<UserRole | null> => {
  const user = await getCurrentUser();
  return user?.role || null;
};

// 서버 사이드 인증 상태 확인 (명확한 이름)
export const isServerAuthenticated = isAuthenticated;
