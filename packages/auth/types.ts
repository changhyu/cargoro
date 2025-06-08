/**
 * 인증 관련 타입 정의
 */

export enum AuthRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DRIVER = 'driver',
  USER = 'user',
}

// UserRole 타입 에일리어스 추가 (하위 호환성 유지)
export type UserRole = AuthRole;

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  role: AuthRole;
  organizationId?: string;
  organizationName?: string;
  permissions?: string[];
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}
