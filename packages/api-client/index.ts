// API 클라이언트 코어 모듈
export * from './lib/api-client';

// React 프로바이더와 훅들
export { ApiProvider, useApiClient } from './lib/provider';
export { useCurrentUser } from './hooks/useCurrentUser';

// 사용자 정의 타입들
export type { ApiClientConfig } from './lib/api-client';

// 기본 ApiClient 클래스 명시적 export
import { ApiClient } from './lib/api-client';
export { ApiClient };

/**
 * API 클라이언트 초기화 함수
 */
export function initializeApiClient(apiUrl: string, authToken?: string): ApiClient {
  const client = new ApiClient(apiUrl);
  if (authToken) {
    client.setAuthToken(authToken);
  }
  return client;
}

// 기본 클라이언트 인스턴스 관리
let defaultClient: ApiClient | null = null;

/**
 * 기본 API 클라이언트 설정
 */
export function configureApiClient(apiUrl: string, authToken?: string): ApiClient {
  defaultClient = new ApiClient(apiUrl);
  if (authToken) {
    defaultClient.setAuthToken(authToken);
  }
  return defaultClient;
}

/**
 * 기본 API 클라이언트 가져오기
 */
export function getApiClient(): ApiClient {
  if (!defaultClient) {
    throw new Error('API 클라이언트가 설정되지 않았습니다. configureApiClient를 먼저 호출하세요.');
  }
  return defaultClient;
}

// 기본 클라이언트 인스턴스 export (auth 패키지에서 사용)
export const apiClient = {
  setAuthToken: (token: string) => {
    if (defaultClient) {
      defaultClient.setAuthToken(token);
    }
  },
  clearAuthToken: () => {
    if (defaultClient) {
      defaultClient.clearAuthToken();
    }
  },
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    if (!defaultClient) {
      throw new Error('API 클라이언트가 설정되지 않았습니다.');
    }
    return defaultClient.get<T>(url, params);
  },
  post: async <T>(url: string, data?: Record<string, unknown>): Promise<T> => {
    if (!defaultClient) {
      throw new Error('API 클라이언트가 설정되지 않았습니다.');
    }
    return defaultClient.post<T>(url, data);
  },
  put: async <T>(url: string, data?: Record<string, unknown>): Promise<T> => {
    if (!defaultClient) {
      throw new Error('API 클라이언트가 설정되지 않았습니다.');
    }
    return defaultClient.put<T>(url, data);
  },
  delete: async <T>(url: string, config?: any): Promise<T> => {
    if (!defaultClient) {
      throw new Error('API 클라이언트가 설정되지 않았습니다.');
    }
    return defaultClient.delete<T>(url, config);
  },
};
