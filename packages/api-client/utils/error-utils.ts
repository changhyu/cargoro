import { AxiosError } from 'axios';
import { GraphQLError } from 'graphql';
import { ClientError } from 'graphql-request';

// ApiError 인터페이스 이름을 ApiErrorDetail로 변경하여 충돌 해결
export interface ApiErrorDetail {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}

/**
 * REST 및 GraphQL API 에러를 일관되게 처리하는 유틸리티 함수
 */
export function handleApiError(
  error: Error | GraphQLError | AxiosError | unknown,
  fallbackMessage = '알 수 없는 에러가 발생했습니다'
): ApiErrorDetail {
  // Axios 에러 처리 (REST API)
  if (error instanceof AxiosError && error.response) {
    return {
      code: `HTTP_${error.response.status}`,
      message: error.message || fallbackMessage,
      status: error.response.status,
      details: error.response.data,
    };
  }

  // GraphQL 에러 처리 - ClientError 인스턴스 및 유사 객체 모두 처리
  if (
    error instanceof ClientError ||
    (typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { errors?: Array<{ message: string }> } }).response ===
        'object' &&
      (error as { response: { errors?: Array<{ message: string }> } }).response?.errors &&
      Array.isArray(
        (error as { response: { errors: Array<{ message: string }> } }).response.errors
      ))
  ) {
    const errorObj = error as ClientError | { response: { errors: Array<{ message: string }> } };
    const { response } = errorObj;
    const errors = response?.errors;

    let message = fallbackMessage;
    if (errors && Array.isArray(errors) && errors.length > 0) {
      message = errors[0].message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      code: 'GRAPHQL_ERROR',
      message: message,
      details: errors,
    };
  }

  // 그 외 일반 에러
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : fallbackMessage,
    details: error,
  };
}

/**
 * 에러 디버깅을 위한 로깅 유틸리티
 */
export function logApiError(error: unknown, context?: string): void {
  const apiError = handleApiError(error, '알 수 없는 에러가 발생했습니다');
  const contextString = context ? `[${context}]` : '';
  console.error(`API 에러 ${contextString}:`, apiError);
}
