// GraphQL Context 타입 정의
export interface Context {
  headers: {
    authorization?: string;
    [key: string]: string | undefined;
  };
  request?: any;
  reply?: any;
}

// 페이지 정보 타입
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

// Edge 타입
export interface Edge<T> {
  cursor: string;
  node: T;
}

// 연결 타입 (Connection pattern)
export interface Connection<T> {
  totalCount: number;
  pageInfo: PageInfo;
  edges: Edge<T>[];
}

// 사용자 타입 정의
export interface UserType {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  roles?: Role[];
}

// 사용자 연결 타입
export type UserConnection = Connection<UserType>;

// 역할 타입 정의
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// 권한 타입 정의
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// 조직 타입 정의
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: UserType[];
}

// 조직 연결 타입
export type OrganizationConnection = Connection<Organization>;

// 조직 타입 열거형
export enum OrganizationType {
  WORKSHOP = 'WORKSHOP',
  FLEET_MANAGER = 'FLEET_MANAGER',
  PARTS_SUPPLIER = 'PARTS_SUPPLIER',
  DELIVERY_COMPANY = 'DELIVERY_COMPANY',
}

// 인증 응답 타입
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserType;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 페이지네이션 타입
export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 등록 입력 타입
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  organizationId?: string;
}

// 조직 생성 입력 타입
export interface CreateOrganizationInput {
  name: string;
  type: OrganizationType;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// 조직 업데이트 입력 타입
export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

// 사용자 초대 입력 타입
export interface InviteUserInput {
  organizationId: string;
  email: string;
  roleId?: string;
  isAdmin?: boolean;
}

// 멤버십 업데이트 입력 타입
export interface UpdateMembershipInput {
  organizationId: string;
  userId: string;
  roleId?: string;
  isAdmin?: boolean;
}

// 사용자 업데이트 입력 타입
export interface UpdateUserInput {
  id: string;
  fullName?: string;
  phone?: string;
  isActive?: boolean;
}
