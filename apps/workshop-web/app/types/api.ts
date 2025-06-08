/**
 * API 및 에러 관련 타입 정의
 */

/**
 * API 에러 타입
 */
export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
  message: string;
  isAxiosError?: boolean;
}

/**
 * API 응답 기본 타입
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
