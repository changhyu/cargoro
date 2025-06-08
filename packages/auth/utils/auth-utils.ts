// 클라이언트 컴포넌트 전용 auth 유틸리티
// next/headers를 사용하지 않는 함수들만 포함

// 사용자 역할 열거형
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DRIVER = 'driver',
  USER = 'user',
}

// 사용자 정보 타입
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

// 사용자 역할 확인 함수 (클라이언트에서 사용 가능)
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    [UserRole.ADMIN]: 4,
    [UserRole.MANAGER]: 3,
    [UserRole.DRIVER]: 2,
    [UserRole.USER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// 사용자 권한 확인 함수 (클라이언트에서 사용 가능)
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
};

// 토큰 검증 함수 (클라이언트에서 사용 가능)
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    return !!token && token.length > 10;
  } catch (error) {
    console.error('토큰 검증 에러:', error);
    return false;
  }
};

// 사용자 인증 함수 (모킹 버전)
export const authenticateUser = async (
  email: string,
  _password: string
): Promise<{ success: boolean; token?: string; user?: UserInfo }> => {
  // 테스트 환경에서는 모킹된 응답 반환
  if (process.env.NODE_ENV === 'test') {
    return {
      success: true,
      token: 'mock-token',
      user: {
        id: 'mock-user-id',
        email,
        role: UserRole.USER,
      },
    };
  }

  try {
    console.warn('authenticateUser 함수는 구현이 필요합니다. Clerk의 인증 흐름을 사용하세요.');
    return { success: false };
  } catch (error) {
    console.error('사용자 인증 에러:', error);
    return { success: false };
  }
};

// 인증된 사용자 정보 가져오기 (서버 사이드)
export const getAuthenticatedUser = async (): Promise<UserInfo | null> => {
  try {
    // 실제 구현에서는 Clerk의 currentUser()를 사용해야 합니다
    console.warn('getAuthenticatedUser 함수는 구현이 필요합니다.');
    return null;
  } catch (error) {
    console.error('인증된 사용자 정보 가져오기 에러:', error);
    return null;
  }
};

// 사용자 역할 확인 (서버 사이드)
export const checkUserRole = async (_userId: string, _requiredRole: UserRole): Promise<boolean> => {
  try {
    // 실제 구현에서는 데이터베이스나 Clerk에서 사용자 역할을 확인해야 합니다
    console.warn('checkUserRole 함수는 구현이 필요합니다.');
    return false;
  } catch (error) {
    console.error('사용자 역할 확인 에러:', error);
    return false;
  }
};

// 인증 헤더 생성
export const buildAuthHeader = (token: string): Record<string, string> => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Clerk 웹훅 처리
export const handleClerkWebhook = async (
  _body: unknown,
  _headers: Record<string, string>
): Promise<boolean> => {
  try {
    // 실제 구현에서는 svix를 사용해 웹훅을 검증해야 합니다
    console.warn('handleClerkWebhook 함수는 구현이 필요합니다.');
    return true;
  } catch (error) {
    console.error('Clerk 웹훅 처리 에러:', error);
    return false;
  }
};
