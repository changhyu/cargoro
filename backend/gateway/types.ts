// 공통 타입 정의
export interface Context {
  headers: {
    authorization?: string;
    [key: string]: string | undefined;
  };
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  isAuthenticated: boolean;
}

// 페이지네이션 관련 타입
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// 사용자 관련 타입
export interface UserType {
  id: string;
  clerkId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  [key: string]: unknown;
}

export interface UserEdge {
  cursor: string;
  node: UserType;
}

export interface UserConnection {
  totalCount: number;
  pageInfo: PageInfo;
  edges: UserEdge[];
}

// 사용자 역할 타입
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  WORKSHOP_MANAGER = 'WORKSHOP_MANAGER',
  WORKSHOP_STAFF = 'WORKSHOP_STAFF',
  DRIVER = 'DRIVER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  PARTS_MANAGER = 'PARTS_MANAGER',
  CUSTOMER = 'CUSTOMER',
}

// 조직 타입
export enum OrgType {
  WORKSHOP = 'WORKSHOP',
  FLEET_COMPANY = 'FLEET_COMPANY',
  PARTS_SUPPLIER = 'PARTS_SUPPLIER',
}

// 멤버십 상태
export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
}

// 페이지네이션 파라미터
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// 인증 응답 타입
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
  };
}

// 사용자 등록 입력 타입
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
}

// 사용자 업데이트 입력 타입
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
  id?: string; // id 속성 추가
}

// 조직 생성 입력 타입
export interface CreateOrganizationInput {
  name: string;
  type: OrgType;
  description?: string;
  Logo?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown; // Record<string, unknown> 호환을 위한 인덱스 시그니처 추가
}

// 조직 업데이트 입력 타입
export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  Logo?: string;
  active?: boolean;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown; // Record<string, unknown> 호환을 위한 인덱스 시그니처 추가
}

// 사용자 초대 입력 타입
export interface InviteUserInput {
  organizationId: string;
  email: string;
  roleId: string;
  message?: string;
  [key: string]: unknown; // Record<string, unknown> 호환을 위한 인덱스 시그니처 추가
}

// 멤버십 업데이트 입력 타입
export interface UpdateMembershipInput {
  organizationId: string;
  userId: string;
  roleId?: string;
  isAdmin?: boolean;
}

// 조직 타입
export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  slug?: string;
  description?: string;
  Logo?: string;
  active: boolean;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

// OrganizationType을 Organization과 동일한 타입으로 사용할 수 있도록 타입 별칭 추가
export type OrganizationType = Organization;

// 조직 엣지 타입
export interface OrganizationEdge {
  cursor: string;
  node: Organization;
}

// 조직 커넥션 타입
export interface OrganizationConnection {
  totalCount: number;
  pageInfo: PageInfo;
  edges: OrganizationEdge[];
}

// Express 요청에 사용자 ID 필드를 추가하기 위한 타입 정의
// @typescript-eslint/no-namespace 규칙 비활성화
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      id?: string;
      userId?: string;
      email?: string;
      role?: string;
      organizationId?: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// 인증 토큰에서 추출한 정보
export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  iat: number;
  exp: number;
}

// API 응답 형식
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 차량 상태 정의
export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  RESERVED = 'reserved',
}

// 배송 상태 정의
export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKUP = 'pickup',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

// 운전자 가용성 상태
export enum DriverAvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ON_BREAK = 'on_break',
}

// 정비 작업 상태
export enum RepairStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  WAITING_PARTS = 'waiting_parts',
}

// 예약 상태
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 정비 작업 유형
export enum RepairType {
  REGULAR = 'regular',
  REPAIR = 'repair',
  EMERGENCY = 'emergency',
  INSPECTION = 'inspection',
  PARTS_REPLACEMENT = 'parts_replacement',
}

// 예약 서비스 유형
export enum ServiceType {
  OIL_CHANGE = 'oil_change',
  TIRE_ROTATION = 'tire_rotation',
  BRAKE_SERVICE = 'brake_service',
  ENGINE_TUNE_UP = 'engine_tune_up',
  FULL_INSPECTION = 'full_inspection',
  CUSTOM = 'custom',
}

// 알림 우선순위
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 알림 타입
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  ALERT = 'alert',
}

// 알림 상태
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

// 로깅 로그 레벨 정의
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// 로그 엔트리 정의
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  service?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string | number;
  };
}

// 표준 서비스 응답 타입 (FastAPI 백엔드 마이크로서비스에서 사용)
export interface ServiceResponse<T = any> {
  data?: T;
  status: 'success' | 'error';
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// 필터 파라미터
export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// 정비소 타입
export interface Workshop {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 차량 타입
export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  customerId?: string;
  fleetId?: string;
  createdAt: string;
  updatedAt: string;
}

// 고객 타입
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// 정비 작업 타입
export interface RepairJob {
  id: string;
  workshopId: string;
  vehicleId: string;
  customerId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 부품 타입
export interface Part {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  manufacturer: string;
  createdAt: string;
  updatedAt: string;
}

// 배송 타입
export interface Delivery {
  id: string;
  origin: string;
  destination: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  driverId?: string;
  vehicleId?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt: string;
  updatedAt: string;
}

// 드라이버 타입
export interface Driver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 사용자 타입
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// 정비 작업 상태 이력 타입
export interface StatusHistory {
  id: string;
  repairJobId: string;
  fromStatus: string;
  toStatus: string;
  userId: string;
  note?: string;
  createdAt: string;
}

// 일정 타입
export interface Schedule {
  id: string;
  workshopId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  userId: string;
  resourceId?: string;
  createdAt: string;
  updatedAt: string;
}

// 알림 타입
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  link?: string;
  createdAt: string;
}
