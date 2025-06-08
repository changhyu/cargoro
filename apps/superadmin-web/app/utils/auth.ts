/**
 * 인증 유틸리티 함수들
 */

import { auth, currentUser } from '@clerk/nextjs/server';

// 사용자 역할 정의
export enum UserRole {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// 권한 타입 정의
export interface Permission {
  id: string;
  description: string;
}

// 권한 정의
export const PERMISSIONS = {
  USER_VIEW: { id: 'users:read', description: '사용자 조회 권한' },
  USER_CREATE: { id: 'users:create', description: '사용자 생성 권한' },
  USER_UPDATE: { id: 'users:update', description: '사용자 정보 수정 권한' },
  USER_DELETE: { id: 'users:delete', description: '사용자 삭제 권한' },
  AUDIT_VIEW: { id: 'audit:read', description: '감사 로그 조회 권한' },
  ADMIN_ACCESS: { id: 'admin:access', description: '관리자 접근 권한' },
};

// 역할별 기본 권한 정의
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [PERMISSIONS.USER_VIEW],
  [UserRole.MANAGER]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [UserRole.ADMIN]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.ADMIN_ACCESS,
  ],
  [UserRole.SUPER_ADMIN]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.ADMIN_ACCESS,
  ],
};

// Clerk 서비스 인터페이스
const clerkService = {
  async getUserPermissions(userId: string): Promise<string[]> {
    // 실제로는 Clerk API나 DB에서 사용자 권한을 가져와야 함
    // 여기서는 간단한 예시로 하드코딩 처리
    return ['users:read', 'users:create'];
  },
};

/**
 * 현재 사용자의 권한 목록을 가져옵니다
 */
export async function getCurrentUserPermissions(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    // 1. 사용자 역할 기반 권한
    const role = await getUserRole();
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    const rolePermissionIds = rolePermissions.map(permission => permission.id);

    // 2. 사용자 개별 권한 (Clerk 메타데이터)
    const userPermissions = await clerkService.getUserPermissions(userId);

    // 3. 중복 제거하여 반환
    return [...new Set([...rolePermissionIds, ...userPermissions])];
  } catch (error) {
    console.error('사용자 권한 조회 오류:', error);
    return [];
  }
}

/**
 * 현재 사용자가 특정 권한을 가지고 있는지 확인합니다
 */
export async function checkPermission(permissionId: string): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions.includes(permissionId);
}

/**
 * 현재 사용자가 여러 권한 중 하나라도 가지고 있는지 확인합니다
 */
export async function checkAnyPermission(permissionIds: string[]): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissionIds.some(id => permissions.includes(id));
}

/**
 * 현재 사용자가 모든 권한을 가지고 있는지 확인합니다
 */
export async function checkAllPermissions(permissionIds: string[]): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissionIds.every(id => permissions.includes(id));
}

/**
 * 사용자 역할을 가져옵니다
 */
export async function getUserRole(): Promise<UserRole> {
  const { userId } = await auth();
  if (!userId) return UserRole.USER;

  try {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as UserRole | undefined;

    return role || UserRole.USER;
  } catch (error) {
    console.error('사용자 역할 조회 오류:', error);
    return UserRole.USER;
  }
}

/**
 * 사용자가 관리자 권한을 가지고 있는지 확인합니다
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

/**
 * 사용자가 슈퍼 관리자 권한을 가지고 있는지 확인합니다
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === UserRole.SUPER_ADMIN;
}

/**
 * 사용자 권한 목록을 가져옵니다
 */
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
    console.error('권한 목록 조회 오류:', error);
    return [];
  }
}
