/**
 * API 관련 타입 정의
 */

/**
 * API 오류 인터페이스
 * API 요청 중 발생하는 오류에 대한 표준화된 형식
 */
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
  originalError?: unknown;
}

/**
 * API 응답 인터페이스
 * 백엔드 API 응답의 공통 형식
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
}

/**
 * 페이지네이션 메타데이터 인터페이스
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * 페이지네이션된 API 응답 인터페이스
 */
export interface PaginatedResponse<T = unknown> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * API 필터 옵션 인터페이스
 * 목록 조회 API에서 사용되는 필터링 옵션
 */
export interface ApiFilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: unknown;
}

/**
 * 정렬 방향 타입
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 옵션 인터페이스
 */
export interface SortOption {
  field: string;
  direction: SortDirection;
}
