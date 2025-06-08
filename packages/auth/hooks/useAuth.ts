/**
 * 인증 관련 훅
 *
 * 사용자 인증 정보와 권한 관리를 위한 커스텀 훅 모음
 */

'use client';

import { useUser as useClerkUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useCallback, useMemo } from 'react';
import { extractUserProfile, hasPermission, hasRole } from '../lib/clerk';
import type { ClerkUserRole, UserProfile } from '@cargoro/types';

/**
 * 사용자 인증 정보 훅
 *
 * Clerk의 기본 useUser 훅을 확장하여 추가 기능 제공:
 * - 사용자 프로필 정보 추출
 * - 권한 및 역할 확인 헬퍼 함수
 * - 로그아웃 함수
 *
 * 주의: 이 훅은 반드시 <ClerkProvider> 내부에서 사용해야 합니다.
 */
export function useAuth() {
  try {
    const { user, isLoaded, isSignedIn } = useClerkUser();
    const { signOut } = useClerkAuth();

    // 프로필 정보 추출 및 메모이제이션
    const profile: UserProfile | null = useMemo(() => {
      if (!user) return null;
      return extractUserProfile(user);
    }, [user]);

    // 역할 확인 함수
    const checkRole = useCallback(
      (allowedRoles: ClerkUserRole | ClerkUserRole[]) => {
        if (!user) return false;

        const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        return hasRole(user, rolesToCheck);
      },
      [user]
    );

    // 권한 확인 함수
    const checkPermission = useCallback(
      (requiredPermission: string) => {
        if (!user) return false;
        return hasPermission(user, requiredPermission);
      },
      [user]
    );

    // 로그아웃 함수
    const logout = useCallback(async () => {
      try {
        await signOut();
        return true;
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        return false;
      }
    }, [signOut]);

    return {
      user,
      profile,
      isLoaded,
      isSignedIn,
      checkRole,
      checkPermission,
      logout,
    };
  } catch (error) {
    // ClerkProvider 외부에서 호출된 경우의 오류 처리
    console.error('useAuth는 ClerkProvider 내부에서만 사용해야 합니다:', error);

    // 기본 값 반환
    return {
      user: null,
      profile: null,
      isLoaded: false,
      isSignedIn: false,
      checkRole: () => false,
      checkPermission: () => false,
      logout: async () => false,
    };
  }
}

/**
 * 관리자 권한 확인 훅
 */
export function useIsAdmin() {
  try {
    const { checkRole } = useAuth();
    return checkRole(['admin', 'super_admin']);
  } catch (error) {
    console.error('useIsAdmin 훅 오류:', error);
    return false;
  }
}

/**
 * 워크숍 관리자 확인 훅
 */
export function useIsWorkshopManager() {
  try {
    const { checkRole } = useAuth();
    return checkRole(['workshop_manager']);
  } catch (error) {
    console.error('useIsWorkshopManager 훅 오류:', error);
    return false;
  }
}

export default useAuth;
