// 사용자 관리 관련 타입 정의

export interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  organizations: Organization[];
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // 시스템 기본 역할 여부
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'workshop' | 'fleet' | 'supplier' | 'admin';
  status: 'active' | 'inactive';
  subscription?: {
    plan: 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'trial' | 'expired';
    expiresAt: string;
  };
  members: OrganizationMember[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  roleId: string;
  organizationId?: string;
  sendInvite?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  roleId?: string;
  status?: SystemUser['status'];
  permissions?: string[]; // permission IDs
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: string[]; // permission IDs
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> {
  id?: string;
}

export interface UserFilter {
  search?: string;
  roleId?: string;
  organizationId?: string;
  status?: SystemUser['status'] | 'all';
  sortBy?: 'name' | 'email' | 'lastLogin' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Array<{
    roleId: string;
    roleName: string;
    count: number;
  }>;
  usersByOrganization: Array<{
    organizationId: string;
    organizationName: string;
    count: number;
  }>;
  userGrowthTrend: Array<{
    date: string;
    count: number;
  }>;
  loginActivity: Array<{
    date: string;
    logins: number;
    uniqueUsers: number;
  }>;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change';
  resource: string;
  resourceId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// 권한 템플릿
export const PERMISSION_TEMPLATES = {
  workshop: [
    { resource: 'repairs', action: 'read', name: '정비 조회' },
    { resource: 'repairs', action: 'create', name: '정비 생성' },
    { resource: 'repairs', action: 'update', name: '정비 수정' },
    { resource: 'repairs', action: 'delete', name: '정비 삭제' },
    { resource: 'customers', action: 'read', name: '고객 조회' },
    { resource: 'customers', action: 'create', name: '고객 생성' },
    { resource: 'invoices', action: 'read', name: '송장 조회' },
    { resource: 'invoices', action: 'create', name: '송장 생성' },
  ],
  fleet: [
    { resource: 'vehicles', action: 'read', name: '차량 조회' },
    { resource: 'vehicles', action: 'create', name: '차량 등록' },
    { resource: 'vehicles', action: 'update', name: '차량 수정' },
    { resource: 'drivers', action: 'read', name: '운전자 조회' },
    { resource: 'drivers', action: 'create', name: '운전자 등록' },
    { resource: 'maintenance', action: 'read', name: '정비 일정 조회' },
  ],
  parts: [
    { resource: 'parts', action: 'read', name: '부품 조회' },
    { resource: 'parts', action: 'create', name: '부품 등록' },
    { resource: 'parts', action: 'update', name: '부품 수정' },
    { resource: 'inventory', action: 'adjust', name: '재고 조정' },
    { resource: 'orders', action: 'read', name: '주문 조회' },
    { resource: 'orders', action: 'create', name: '주문 생성' },
  ],
  admin: [{ resource: '*', action: '*', name: '전체 권한' }],
};
