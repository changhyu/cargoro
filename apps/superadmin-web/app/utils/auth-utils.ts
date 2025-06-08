'use client';

/**
 * 사용자가 특정 권한을 가지고 있는지 확인합니다
 */
export function hasPermission(permissions: string[], requiredPermission: string): boolean {
  return permissions.includes(requiredPermission);
}

/**
 * 사용자가 관리자 권한을 가지고 있는지 확인합니다
 */
export function isAdmin(role: string): boolean {
  return role === 'admin' || role === 'superadmin';
}

/**
 * 사용자가 슈퍼 관리자 권한을 가지고 있는지 확인합니다
 */
export function isSuperAdmin(role: string): boolean {
  return role === 'superadmin';
}

/**
 * 권한 문자열을 파싱하여 리소스와 액션으로 분리합니다
 */
export function parsePermission(permission: string): { resource: string; action: string } {
  const [resource, action] = permission.split(':');
  return { resource, action };
}

/**
 * 사용자가 특정 리소스에 대한 액션을 수행할 수 있는지 확인합니다
 */
export function canPerformAction(permissions: string[], resource: string, action: string): boolean {
  const requiredPermission = `${resource}:${action}`;
  return hasPermission(permissions, requiredPermission);
}

// 권한이 있는지 확인합니다 (배열 기반)
export function checkPermission(permissions: string[], requiredPermission: string): boolean {
  return hasPermission(permissions, requiredPermission);
}

// 여러 권한 중 하나라도 가지고 있는지 확인합니다 (배열 기반)
export function hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => permissions.includes(permission));
}

// 모든 권한을 가지고 있는지 확인합니다 (배열 기반)
export function hasAllPermissions(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => permissions.includes(permission));
}

// 클라이언트 컴포넌트에서 사용할 수 있는 권한 관련 유틸리티

// 권한 정의 - 서버 컴포넌트의 PERMISSIONS와 동일하게 유지
export const CLIENT_PERMISSIONS = {
  USER_VIEW: { id: 'users:read', description: '사용자 조회 권한' },
  USER_CREATE: { id: 'users:create', description: '사용자 생성 권한' },
  USER_UPDATE: { id: 'users:update', description: '사용자 정보 수정 권한' },
  USER_DELETE: { id: 'users:delete', description: '사용자 삭제 권한' },
  AUDIT_VIEW: { id: 'audit:read', description: '감사 로그 조회 권한' },
  ADMIN_ACCESS: { id: 'admin:access', description: '관리자 접근 권한' },
};

// 로컬 상태 또는 Context로부터 사용자 권한 확인
export function checkUserPermission(userPermissions: string[], permissionId: string): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;

  // admin 사용자는 모든 권한 허용
  if (userPermissions.includes('admin:all')) return true;

  return userPermissions.includes(permissionId);
}

// 로컬 상태 또는 Context로부터 여러 권한 중 하나라도 가지고 있는지 확인
export function checkUserPermissions(userPermissions: string[], permissionIds: string[]): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;

  // admin 사용자는 모든 권한 허용
  if (userPermissions.includes('admin:all')) return true;

  // 하나라도 권한이 있으면 true 반환
  return permissionIds.some(permId => userPermissions.includes(permId));
}

// 사용자 역할에 따른 기본 권한 가져오기
export function getDefaultPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'admin':
      return ['admin:all']; // 모든 권한
    case 'manager':
      return ['users:read', 'users:create', 'users:update', 'audit:read'];
    case 'user':
      return ['users:read'];
    default:
      return [];
  }
}
