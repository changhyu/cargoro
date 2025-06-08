import { ApiError, ApiErrorCode, API_ERROR_MESSAGES } from '@cargoro/types';
import { AxiosError } from 'axios';

// API 에러 클래스 정의
export class ApiException extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: Record<string, string>;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number = 500,
    details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * AxiosError 타입 체크 함수
 * 테스트에서 모킹이 쉽도록 직접 구현
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

// Axios 에러를 ApiException으로 변환하는 함수
export function handleApiError(error: unknown): ApiException {
  // Axios 에러인 경우
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // 백엔드에서 정의된 에러 응답 형식인 경우
    if (axiosError.response?.data && 'code' in axiosError.response.data) {
      const apiError = axiosError.response.data;
      return new ApiException(
        apiError.code as ApiErrorCode,
        apiError.message,
        axiosError.response.status,
        apiError.details
      );
    }

    // 응답이 있지만 정의된 형식이 아닌 경우
    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      let errorCode: ApiErrorCode;

      switch (Math.floor(statusCode / 100)) {
        case 4:
          if (statusCode === 400) errorCode = ApiErrorCode.BAD_REQUEST;
          else if (statusCode === 401) errorCode = ApiErrorCode.UNAUTHORIZED;
          else if (statusCode === 403) errorCode = ApiErrorCode.FORBIDDEN;
          else if (statusCode === 404) errorCode = ApiErrorCode.NOT_FOUND;
          else if (statusCode === 409) errorCode = ApiErrorCode.CONFLICT;
          else if (statusCode === 422) errorCode = ApiErrorCode.VALIDATION_ERROR;
          else errorCode = ApiErrorCode.BAD_REQUEST;
          break;
        case 5:
          errorCode = ApiErrorCode.SERVER_ERROR;
          break;
        default:
          errorCode = ApiErrorCode.SERVER_ERROR;
      }

      return new ApiException(errorCode, API_ERROR_MESSAGES[errorCode], statusCode);
    }

    // 네트워크 오류
    if (axiosError.code === 'ECONNABORTED') {
      return new ApiException(ApiErrorCode.SERVICE_UNAVAILABLE, '요청 시간이 초과되었습니다.', 503);
    }

    // 기타 네트워크 에러
    return new ApiException(ApiErrorCode.SERVICE_UNAVAILABLE, '서버에 연결할 수 없습니다.', 503);
  }

  // 일반 에러인 경우
  if (error instanceof Error) {
    return new ApiException(ApiErrorCode.SERVER_ERROR, error.message, 500);
  }

  // 알 수 없는 에러
  return new ApiException(ApiErrorCode.SERVER_ERROR, '알 수 없는 오류가 발생했습니다.', 500);
}

// 오류 메시지 포맷팅 함수
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

// 특정 API 에러 코드인지 확인하는 함수
export function isApiErrorCode(error: unknown, code: ApiErrorCode): boolean {
  return error instanceof ApiException && error.code === code;
}

// 인증 관련 에러인지 확인하는 함수
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof ApiException &&
    (error.code === ApiErrorCode.UNAUTHORIZED || error.code === ApiErrorCode.FORBIDDEN)
  );
}
