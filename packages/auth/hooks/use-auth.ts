import { useEffect, useMemo, useCallback } from 'react';

import { apiClient } from '@cargoro/api-client';
import { AuthUserRole, UseAuthResult, User } from '@cargoro/types';
import { useAuth as useClerkAuth, useOrganization, useUser } from '@clerk/clerk-expo';

import type { OrganizationResource, UserResource } from '@clerk/types';

// UseAuthResult 타입을 re-export
export type { UseAuthResult } from '@cargoro/types';

// Clerk 역할 키와 CarGoro 역할 매핑 (org_<역할>_<동작> 형식 사용)
const ROLE_MAPPING: Record<string, AuthUserRole> = {
  org_admin_full: 'ADMIN',
  org_workshop_owner: 'WORKSHOP_OWNER',
  org_workshop_staff: 'WORKSHOP_STAFF',
  org_customer_basic: 'CUSTOMER',
  org_delivery_driver: 'DRIVER',
  org_fleet_manager: 'FLEET_MANAGER',
  org_parts_manager: 'PARTS_MANAGER',
};

// Clerk 타입 보강
interface OrganizationWithMembership extends OrganizationResource {
  membership?: {
    role: string;
    permissions: string[];
  };
  publicMetadata: {
    role?: string;
    [key: string]: unknown;
  };
}

// UserResource를 User 타입으로 변환하는 헬퍼 함수
const transformClerkUser = (clerkUser: UserResource | null | undefined): User | null => {
  if (!clerkUser) return null;

  return {
    id: clerkUser.id,
    clerkId: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
    firstName: clerkUser.firstName || undefined,
    lastName: clerkUser.lastName || undefined,
    phone: clerkUser.primaryPhoneNumber?.phoneNumber,
    phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber,
    role: 'CUSTOMER', // 기본값, 실제로는 role에서 결정됨
    organizationId: undefined,
    profileImageUrl: clerkUser.imageUrl,
    profileImage: clerkUser.imageUrl,
    isActive: true,
    active: true,
    createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : new Date(),
    updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt) : new Date(),
    lastLogin: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : undefined,
  };
};

// 유저 인증 훅
export function useAuth(): UseAuthResult {
  const { isLoaded, userId, getToken } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();

  // 로딩 상태
  const isLoading = !isLoaded || !isUserLoaded || !isOrgLoaded;

  // 인증 상태 - 사용하기 전에 선언
  const isAuthenticated = !!userId;

  // organization 객체를 확장된 타입으로 처리
  const orgWithMembership = organization as unknown as OrganizationWithMembership;

  // 사용자 역할 (기본값: CUSTOMER)
  const role = useMemo((): AuthUserRole => {
    // 1. 조직 역할이 있는지 확인 (우선순위 1)
    if (orgWithMembership?.membership?.role) {
      const mappedRole = ROLE_MAPPING[orgWithMembership.membership.role];
      if (mappedRole) return mappedRole;
    }

    // 조직의 publicMetadata에서 역할 확인
    const orgMetadataRole = orgWithMembership?.publicMetadata?.role;
    if (orgMetadataRole && typeof orgMetadataRole === 'string') {
      return orgMetadataRole as AuthUserRole;
    }

    // 2. 레거시: 유저의 publicMetadata에서 역할 확인 (우선순위 2)
    const userRole = user?.publicMetadata?.role;
    if (userRole && typeof userRole === 'string') {
      return userRole as AuthUserRole;
    }

    // 3. 기본 역할
    return 'CUSTOMER';
  }, [user?.publicMetadata, orgWithMembership]);

  // 사용자 권한 목록 가져오기
  const permissions = useMemo(() => {
    if (!isAuthenticated) return [];

    return orgWithMembership?.membership?.permissions || [];
  }, [orgWithMembership, isAuthenticated]);

  // 조직 정보
  const organizationId = organization?.id || null;
  const organizationName = organization?.name || null;

  // 역할 검사
  const hasRole = (requiredRole: AuthUserRole | AuthUserRole[]) => {
    if (!isAuthenticated) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }

    return role === requiredRole;
  };

  // 권한 검사 함수
  const hasPermission = (permission: string | string[]) => {
    if (!isAuthenticated) return false;

    // 관리자는 모든 권한을 가짐
    if (role === 'ADMIN') return true;

    // 권한 배열 확인
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    }

    // 단일 권한 확인
    return permissions.includes(permission);
  };

  // 권한 검사 (관리자)
  const isAdmin = useMemo(() => {
    return role === 'ADMIN';
  }, [role]);

  // API 토큰 설정
  useEffect(() => {
    const setAuthToken = async () => {
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
      } else {
        apiClient.clearAuthToken();
      }
    };

    setAuthToken();
  }, [isAuthenticated, getToken]);

  return {
    isLoading,
    isAuthenticated,
    isLoaded,
    isSignedIn: isAuthenticated,
    userId: userId ?? null,
    user: transformClerkUser(user),
    role,
    hasRole,
    isAdmin,
    getToken,
    organizationId,
    organizationName,
    hasPermission,
    permissions,
  };
}
