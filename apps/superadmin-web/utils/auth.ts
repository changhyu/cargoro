import { auth, currentUser } from '@clerk/nextjs/server';

import * as clerkService from '../app/server-actions/clerk-api';

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const PERMISSIONS = {
  // 사용자 관리 권한
  USER_VIEW: {
    id: 'users:read',
    name: '사용자 정보 보기',
    description: '사용자 정보 읽기 권한',
    category: '사용자',
  },
  USER_CREATE: {
    id: 'users:create',
    name: '사용자 생성',
    description: '새로운 사용자 생성 권한',
    category: '사용자',
  },
  USER_UPDATE: {
    id: 'users:update',
    name: '사용자 정보 수정',
    description: '사용자 정보 업데이트 권한',
    category: '사용자',
  },
  USER_DELETE: {
    id: 'users:delete',
    name: '사용자 삭제',
    description: '사용자 삭제 권한',
    category: '사용자',
  },
  USER_IMPERSONATE: {
    id: 'users:impersonate',
    name: '사용자 대리 로그인',
    description: '다른 사용자로 로그인하는 권한',
    category: '사용자',
  },

  // 시스템 관리 권한
  SYSTEM_VIEW: {
    id: 'system:read',
    name: '시스템 정보 보기',
    description: '시스템 정보 읽기 권한',
    category: '시스템',
  },
  SYSTEM_UPDATE: {
    id: 'system:update',
    name: '시스템 설정 변경',
    description: '시스템 설정 변경 권한',
    category: '시스템',
  },

  // 모니터링 권한
  MONITORING_VIEW: {
    id: 'monitoring:read',
    name: '모니터링 정보 보기',
    description: '시스템 모니터링 정보 보기 권한',
    category: '모니터링',
  },
  MONITORING_MANAGE: {
    id: 'monitoring:manage',
    name: '모니터링 관리',
    description: '모니터링 설정 관리 권한',
    category: '모니터링',
  },
};

export const PERMISSION_GROUPS = [
  {
    id: 'user-management',
    name: '사용자 관리',
    description: '사용자 및 계정 관리 권한',
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_IMPERSONATE,
    ],
  },
  {
    id: 'system-management',
    name: '시스템 관리',
    description: '시스템 설정 및 관리 권한',
    permissions: [PERMISSIONS.SYSTEM_VIEW, PERMISSIONS.SYSTEM_UPDATE],
  },
  {
    id: 'monitoring',
    name: '모니터링',
    description: '시스템 모니터링 권한',
    permissions: [PERMISSIONS.MONITORING_VIEW, PERMISSIONS.MONITORING_MANAGE],
  },
];

export const ROLE_PERMISSIONS = {
  [UserRole.USER]: [PERMISSIONS.USER_VIEW],
  [UserRole.ADMIN]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.SYSTEM_VIEW,
    PERMISSIONS.MONITORING_VIEW,
  ],
  [UserRole.SUPER_ADMIN]: [
    // 슈퍼 관리자는 모든 권한을 가짐
    ...Object.values(PERMISSIONS),
  ],
};

export async function getUserRole(): Promise<UserRole> {
  const { userId } = await auth();
  if (!userId) return UserRole.USER;

  try {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as UserRole | undefined;

    return role || UserRole.USER;
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return UserRole.USER;
  }
}

export async function hasPermission(permissionId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    // 1. 사용자 역할 기반 권한 확인
    const role = await getUserRole();
    const rolePermissions = ROLE_PERMISSIONS[role] || [];

    if (rolePermissions.some(permission => permission.id === permissionId)) {
      return true;
    }

    // 2. 사용자 개별 권한 확인 (Clerk 메타데이터)
    return await clerkService.hasPermission(userId, permissionId);
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return false;
  }
}

export async function hasPermissions(permissionIds: string[]): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    // 1. 사용자 역할 기반 권한 확인
    const role = await getUserRole();
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    const rolePermissionIds = rolePermissions.map(permission => permission.id);

    const hasAllPermissionsFromRole = permissionIds.every(id => rolePermissionIds.includes(id));
    if (hasAllPermissionsFromRole) return true;

    // 2. 사용자 개별 권한 확인 (Clerk 메타데이터)
    const userPermissions = await clerkService.getUserPermissions(userId);
    return permissionIds.every(id => userPermissions.includes(id));
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return false;
  }
}

export async function getPermissions(): Promise<Permission[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    // 1. 사용자 역할 기반 권한
    const role = await getUserRole();
    const rolePermissions = ROLE_PERMISSIONS[role] || [];

    // 2. 사용자 개별 권한 (Clerk 메타데이터)
    const userPermissionIds = await clerkService.getUserPermissions(userId);

    // 3. 사용자 개별 권한에 해당하는 권한 객체 가져오기
    const individualPermissions = userPermissionIds
      .map(id => Object.values(PERMISSIONS).find(p => p.id === id))
      .filter((p): p is Permission => p !== undefined);

    // 4. 중복 제거하여 반환
    const allPermissions = [...rolePermissions, ...individualPermissions];
    const uniquePermissions = Array.from(new Map(allPermissions.map(p => [p.id, p])).values());

    return uniquePermissions;
  } catch (error) {
    // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
    return [];
  }
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === UserRole.SUPER_ADMIN;
}
