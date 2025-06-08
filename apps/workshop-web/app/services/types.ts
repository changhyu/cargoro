import {
  RepairJob,
  RepairPriority,
  RepairStatus,
  RepairType,
  Technician,
} from '../features/repair-management/types';

// API 에러 타입
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 네트워크 에러 타입
export class NetworkError extends ApiError {
  constructor(message: string = 'Network connection failed') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// 인증 에러 타입
export class AuthError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

// 권한 에러 타입
export class PermissionError extends ApiError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'PERMISSION_ERROR');
    this.name = 'PermissionError';
  }
}

// 검증 에러 타입
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// 예약 상태 타입
export enum ReservationStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// 예약 기본 타입
export interface Reservation {
  id: string;
  customer_id: string;
  vehicle_id: string;
  repair_type: RepairType;
  description: string;
  preferred_date: string;
  preferred_time: string;
  scheduled_date: string;
  scheduled_time: string;
  estimated_duration: number;
  status: ReservationStatus;
  contact_phone: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

// 공통 API 응답 타입
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  page?: number;
  per_page?: number;
  total_items?: number;
  total_pages?: number;
}

// 정비 작업 API 응답 타입
export type RepairJobListResponse = ApiResponse<RepairJob[]>;
export type RepairJobDetailResponse = ApiResponse<RepairJob>;
export type RepairJobCreateResponse = ApiResponse<RepairJob>;
export type RepairJobUpdateResponse = ApiResponse<RepairJob>;
export type RepairJobDeleteResponse = ApiResponse<null>;

// 예약 API 응답 타입
export type ReservationListResponse = ApiResponse<Reservation[]>;
export type ReservationDetailResponse = ApiResponse<Reservation>;
export type ReservationCreateResponse = ApiResponse<Reservation>;
export type ReservationUpdateResponse = ApiResponse<Reservation>;
export type ReservationDeleteResponse = ApiResponse<null>;

// 정비사 API 응답 타입
export type TechnicianListResponse = ApiResponse<Technician[]>;
export type TechnicianDetailResponse = ApiResponse<Technician>;

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 정비 작업 필터 타입
export interface RepairJobFilterParams extends PaginationParams {
  status?: RepairStatus;
  type?: RepairType;
  priority?: RepairPriority;
  technician_id?: string;
  start_date?: string;
  end_date?: string;
  search_query?: string;
}

// 예약 필터 타입
export interface ReservationFilterParams extends PaginationParams {
  status?: ReservationStatus;
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  vehicle_id?: string;
}

// 이 타입들은 실제 구현 시 @cargoro/types 패키지의 타입들을 가져와서 사용하는 것으로 대체합니다.
