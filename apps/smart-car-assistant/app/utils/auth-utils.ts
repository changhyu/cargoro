/**
 * Auth 유틸리티 함수들
 * Clerk 기반 인증을 위한 헬퍼 함수들
 */

import { useAuth, useUser } from '@cargoro/auth/mobile';

// 인증 관련 커스텀 Hook
export const useAuthUtils = () => {
  const { isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();

  // 인증 상태 확인
  const isAuthenticated = () => {
    return isSignedIn || false;
  };

  // 사용자 역할 가져오기
  const getUserRole = () => {
    return user?.publicMetadata?.role || 'user';
  };

  // 사용자 정보 가져오기
  const getUserInfo = () => {
    if (!user) return null;

    return {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: user.fullName || '',
    };
  };

  // 인증 토큰 가져오기
  const getAuthToken = async () => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  };

  // 인증 상태 초기화
  const clearAuthState = async () => {
    try {
      await signOut();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing auth state:', error);
    }
  };

  return {
    isAuthenticated,
    getUserRole,
    getUserInfo,
    getAuthToken,
    clearAuthState,
  };
};

// 기존 호환성을 위한 주의사항 추가
// 아래 함수들은 사용하지 않는 것을 권장합니다. 대신 useAuthUtils Hook을 사용하세요.
export const authUtils = {
  // @deprecated useAuthUtils Hook을 사용하세요
  isAuthenticated: () => {
    throw new Error(
      'This function cannot be used outside of React components. Use useAuthUtils hook instead.'
    );
  },
  // @deprecated useAuthUtils Hook을 사용하세요
  getUserRole: () => {
    throw new Error(
      'This function cannot be used outside of React components. Use useAuthUtils hook instead.'
    );
  },
  // @deprecated useAuthUtils Hook을 사용하세요
  getUserInfo: () => {
    throw new Error(
      'This function cannot be used outside of React components. Use useAuthUtils hook instead.'
    );
  },
  // @deprecated useAuthUtils Hook을 사용하세요
  getAuthToken: async () => {
    throw new Error(
      'This function cannot be used outside of React components. Use useAuthUtils hook instead.'
    );
  },
  // @deprecated useAuthUtils Hook을 사용하세요
  clearAuthState: async () => {
    throw new Error(
      'This function cannot be used outside of React components. Use useAuthUtils hook instead.'
    );
  },
};

// 기존 호환성을 위한 개별 export (deprecated)
export const { isAuthenticated, getUserRole, getUserInfo, getAuthToken, clearAuthState } =
  authUtils;

export default useAuthUtils;
