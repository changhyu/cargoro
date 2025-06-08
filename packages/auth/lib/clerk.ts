/**
 * Clerk 인증을 위한 유틸리티 함수 모음
 *
 * 클라이언트 및 서버 측 Clerk 관련 설정을 중앙화하여 관리합니다.
 */

import { type UserResource } from '@clerk/types';
import type { ClerkUserRole } from '@cargoro/types';

// ClerkUserRole을 re-export
export type { ClerkUserRole } from '@cargoro/types';

// UserProfile 타입을 직접 정의 (types 패키지에 없음)
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  role: ClerkUserRole;
  status: UserStatus;
  profileId?: string;
  organizationId?: string;
  permissions: string[];
  createdAt: number;
}

/**
 * 사용자 역할 타입 정의 (로컬)
 */
// export type UserRole은 제거하고 ClerkUserRole 사용

/**
 * 사용자 상태 타입 정의
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * 사용자 공개 메타데이터 타입 (Clerk에 저장)
 */
export interface ClerkPublicMetadata {
  role?: ClerkUserRole;
  status?: UserStatus;
  profileId?: string;
  organizationId?: string;
  permissions?: string[];
}

/**
 * 사용자 비공개 메타데이터 타입 (Clerk에 저장)
 */
export interface ClerkPrivateMetadata {
  lastLogin?: string;
  internalId?: string;
  customFields?: Record<string, unknown>;
}

/**
 * Clerk 사용자에서 프로필 정보 추출
 */
export function extractUserProfile(user: UserResource): UserProfile {
  const metadata = user.publicMetadata as ClerkPublicMetadata;

  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.emailAddresses[0]?.emailAddress || '',
    imageUrl: user.imageUrl,
    role: metadata.role || 'customer',
    status: metadata.status || 'active',
    profileId: metadata.profileId,
    organizationId: metadata.organizationId,
    permissions: metadata.permissions || [],
    createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
  };
}

/**
 * 역할 기반 권한 검사
 */
export function hasRole(user: UserResource | null, allowedRoles: ClerkUserRole[]): boolean {
  if (!user) return false;

  const userRole = (user.publicMetadata as ClerkPublicMetadata).role;
  if (!userRole) return false;

  return allowedRoles.includes(userRole as ClerkUserRole);
}

/**
 * 권한 기반 접근 제어
 */
export function hasPermission(user: UserResource | null, requiredPermission: string): boolean {
  if (!user) return false;

  const metadata = user.publicMetadata as ClerkPublicMetadata;
  const permissions = metadata.permissions || [];

  return permissions.includes(requiredPermission);
}

/**
 * Clerk 서명 검증을 위한 비밀키 (서버용)
 */
export const clerkSecretKey = process.env.CLERK_SECRET_KEY || '';

/**
 * 공개 Clerk 키 (클라이언트용)
 */
export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  '';

/**
 * 리다이렉트 URL 설정
 */
export const clerkSignInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in';
export const clerkSignUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up';
export const clerkAfterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard';
export const clerkAfterSignUpUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard';
