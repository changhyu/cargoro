import { ApiClient } from '../api-client';
import { CargoroGraphQLClient } from '../graphql-client';

// API 기본 URL (Next.js 환경변수 또는 기본값 사용)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';

// 기본 API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient(API_BASE_URL, {
  timeout: 30000,
});

// 기본 GraphQL 클라이언트 인스턴스 생성
export const graphqlClient = new CargoroGraphQLClient({
  endpoint: GRAPHQL_URL,
});

// API 클라이언트 초기화 옵션
export interface InitializeOptions {
  baseURL?: string;
  graphqlURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API 클라이언트 초기화 함수 (React Query 5.75.8 최적화)
 * @param token 인증 토큰 (선택사항)
 * @param options 초기화 옵션 (선택사항)
 * @returns 초기화된 클라이언트들
 */
export function initializeApiClient(token?: string, options?: InitializeOptions) {
  // 옵션이 제공된 경우 새로운 클라이언트 인스턴스 생성
  const finalApiClient = options?.baseURL
    ? new ApiClient(options.baseURL, {
        timeout: options.timeout || 30000,
        headers: options.headers,
      })
    : apiClient;

  const finalGraphQLClient = options?.graphqlURL
    ? new CargoroGraphQLClient({
        endpoint: options.graphqlURL,
        headers: options.headers,
      })
    : graphqlClient;

  // 토큰 설정
  if (token) {
    finalApiClient.setAuthToken(token);
    finalGraphQLClient.setAuthToken(token);
  }

  return {
    apiClient: finalApiClient,
    graphqlClient: finalGraphQLClient,
  };
}
