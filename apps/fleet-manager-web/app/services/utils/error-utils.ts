/**
 * 예외 처리 및 오류 관리 유틸리티
 *
 * 애플리케이션 전체에서 일관된 오류 처리를 제공합니다.
 */

import logger from './logger';

// 사용자 정의 오류 타입
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  API = 'API_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTH = 'AUTHENTICATION_ERROR',
  PERMISSION = 'PERMISSION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

// 사용자 정의 오류 클래스
export class AppError extends Error {
  public type: ErrorType;
  public statusCode?: number;
  public details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;

    // 스택 트레이스 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * API 오류 처리 함수
 * API 호출 중 발생한 오류를 처리하고 적절한 사용자 정의 오류로 변환합니다.
 *
 * @param error 원본 오류 객체
 * @param context 오류 컨텍스트 정보 (예: API 엔드포인트, 관련 ID 등)
 * @returns 사용자 정의 오류 객체
 */
export function handleApiError(error: any, context: string): AppError {
  logger.error(`API 오류 (${context}):`, error);

  // axios 오류인 경우
  if (error.response) {
    const statusCode = error.response.status;
    const data = error.response.data;
    const message = data?.message || '서버에서 오류가 발생했습니다.';

    // 상태 코드에 따라 오류 타입 분류
    switch (true) {
      case statusCode === 401:
        return new AppError(message, ErrorType.AUTH, statusCode, data);
      case statusCode === 403:
        return new AppError(message, ErrorType.PERMISSION, statusCode, data);
      case statusCode === 404:
        return new AppError(message, ErrorType.NOT_FOUND, statusCode, data);
      case statusCode === 422:
        return new AppError(message, ErrorType.VALIDATION, statusCode, data);
      case statusCode >= 500:
        return new AppError(message, ErrorType.SERVER, statusCode, data);
      default:
        return new AppError(message, ErrorType.API, statusCode, data);
    }
  }

  // 네트워크 오류인 경우
  if (error.request) {
    return new AppError(
      '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
      ErrorType.NETWORK,
      0,
      { request: error.request }
    );
  }

  // 그 외 오류
  return new AppError(
    error.message || '알 수 없는 오류가 발생했습니다.',
    ErrorType.UNKNOWN,
    0,
    error
  );
}

/**
 * 오류 메시지를 사용자 친화적으로 가공하는 함수
 *
 * @param error 오류 객체
 * @returns 사용자 친화적인 오류 메시지
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (error instanceof AppError) {
    return error.message;
  }

  // 기본 오류 메시지
  return '문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

/**
 * API 요청 재시도 함수
 * 일시적인 네트워크 문제나 서버 오류로 인한 실패를 자동으로 재시도합니다.
 *
 * @param fn 실행할 비동기 함수
 * @param retries 재시도 횟수 (기본값: 3)
 * @param delay 재시도 간 지연 시간(ms) (기본값: 1000)
 * @param backoff 지수 백오프 계수 (기본값: 2)
 * @returns 원본 함수의 반환 값
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // 재시도 가능한 오류인지 확인
    const isRetryable = !(
      error instanceof AppError &&
      (error.type === ErrorType.VALIDATION ||
        error.type === ErrorType.AUTH ||
        error.type === ErrorType.PERMISSION)
    );

    if (retries <= 0 || !isRetryable) {
      throw error;
    }

    logger.warn(`API 요청 실패, ${delay}ms 후 재시도 (남은 시도: ${retries})`, error);

    // 지정된 시간만큼 대기
    await new Promise(resolve => setTimeout(resolve, delay));

    // 재귀적으로 함수 재시도
    return withRetry(fn, retries - 1, delay * backoff, backoff);
  }
}

export default {
  AppError,
  ErrorType,
  handleApiError,
  getUserFriendlyErrorMessage,
  withRetry,
};
