/**
 * API 응답 및 관련 타입 정의
 */

// API 응답의 기본 구조
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  page?: number;
  per_page?: number;
  total_items?: number;
  total_pages?: number;
}

// API 에러 응답 구조
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// API 상태 코드와 에러 코드 매핑
export enum ApiErrorCode {
  // 클라이언트 에러 (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',

  // 서버 에러 (5xx)
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

// API 에러 메시지 매핑
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [ApiErrorCode.BAD_REQUEST]: '잘못된 요청입니다.',
  [ApiErrorCode.UNAUTHORIZED]: '인증이 필요합니다.',
  [ApiErrorCode.FORBIDDEN]: '접근 권한이 없습니다.',
  [ApiErrorCode.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ApiErrorCode.VALIDATION_ERROR]: '입력 데이터가 유효하지 않습니다.',
  [ApiErrorCode.CONFLICT]: '리소스 충돌이 발생했습니다.',
  [ApiErrorCode.SERVER_ERROR]: '서버 오류가 발생했습니다.',
  [ApiErrorCode.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다.',
  [ApiErrorCode.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
};

// 페이지네이션 파라미터 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 정렬 파라미터 타입
export interface SortParams {
  sort_by?: string;
  order?: 'asc' | 'desc';
}
