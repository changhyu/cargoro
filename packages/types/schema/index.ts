// 사용자 타입 - user.ts에서 User 임포트
export type { User } from './user';
export type { UserRole as UpperUserRole } from './user'; // 대문자 UserRole은 별칭으로
import type { User } from './user'; // 내부 타입 정의에서 사용하기 위한 import

// 인증 관련 타입들 - auth.ts에서 가져오기
export type {
  AuthUserRole,
  ClerkUserRole,
  UserProfile,
  FirebaseConfig,
  AuthContextType,
  UseAuthResult,
} from './auth';

// 조직 타입
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  Logo?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  tier: string;
  settings?: Record<string, unknown>;
  members?: OrganizationMember[];
}

// 역할 타입
export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
}

// 권한 타입
export interface Permission {
  id: number;
  name: string;
  description?: string;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

// 조직 멤버십 타입
export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  roleId: number;
  isOwner: boolean;
  isAdmin: boolean;
  joinedAt: Date;
  updatedAt: Date;
  invitedBy?: string;
  status: MembershipStatus;
  user?: User;
  organization?: Organization;
  role?: Role;
}

// 역할별 권한 관계
export interface RolePermission {
  roleId: number;
  permissionId: number;
}

// 사용자별 권한 관계
export interface UserPermission {
  userId: string;
  permissionId: number;
  grantedAt: Date;
  grantedBy?: string;
}

// 인증 로그
export interface AuthLog {
  id: number;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, unknown>;
}

// 열거형
export enum MembershipStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

// 입력 타입
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface CreateOrganizationInput {
  name: string;
  description?: string;
  Logo?: string;
  tier?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  Logo?: string;
  active?: boolean;
  tier?: string;
  settings?: Record<string, unknown>;
}

export interface InviteUserInput {
  organizationId: string;
  email: string;
  roleId: number;
  message?: string;
}

export interface UpdateMembershipInput {
  organizationId: string;
  userId: string;
  roleId?: number;
  isAdmin?: boolean;
}

// 페이지네이션 관련 타입
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface UserConnection {
  totalCount: number;
  pageInfo: PageInfo;
  edges: UserEdge[];
}

export interface UserEdge {
  cursor: string;
  node: User;
}

export interface OrganizationConnection {
  totalCount: number;
  pageInfo: PageInfo;
  edges: OrganizationEdge[];
}

export interface OrganizationEdge {
  cursor: string;
  node: Organization;
}

// API 관련 타입 내보내기
export * from './api';

// 차량 관련 타입 내보내기
export * from './vehicle';

// 계약 관련 타입 내보내기
export * from './contract';

// 운전자 관련 타입 내보내기
export * from './driver';

// 공급업체 관련 타입 내보내기
export * from './supplier';
