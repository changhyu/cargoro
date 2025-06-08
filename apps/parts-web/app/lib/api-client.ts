'use client';

/**
 * API 클라이언트 모듈
 *
 * 백엔드 API와의 통신을 처리하는 유틸리티 함수들
 * 현재는 항상 모킹 데이터를 반환
 */

// API 클라이언트 타입 정의
interface ApiClientConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

interface ApiClient {
  get: <T = unknown>(url: string, config?: ApiClientConfig) => Promise<{ data: T }>;
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiClientConfig
  ) => Promise<{ data: T }>;
  put: <T = unknown>(url: string, data?: unknown, config?: ApiClientConfig) => Promise<{ data: T }>;
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiClientConfig
  ) => Promise<{ data: T }>;
  delete: <T = unknown>(url: string, config?: ApiClientConfig) => Promise<{ data: T }>;
  interceptors: {
    request: {
      use: (
        onFulfilled: (config: ApiClientConfig) => ApiClientConfig,
        onRejected?: (error: unknown) => unknown
      ) => void;
    };
    response: {
      use: (
        onFulfilled: (response: { data: unknown }) => { data: unknown },
        onRejected?: (error: unknown) => unknown
      ) => void;
    };
  };
}

// API 클라이언트 팩토리 함수
export function apiClient(_baseURL: string): ApiClient {
  return {
    get: async <T = unknown>(_url: string, _config?: ApiClientConfig) => {
      return { data: {} as T };
    },
    post: async <T = unknown>(_url: string, _data?: unknown, _config?: ApiClientConfig) => {
      return { data: {} as T };
    },
    put: async <T = unknown>(_url: string, _data?: unknown, _config?: ApiClientConfig) => {
      return { data: {} as T };
    },
    patch: async <T = unknown>(_url: string, _data?: unknown, _config?: ApiClientConfig) => {
      return { data: {} as T };
    },
    delete: async <T = unknown>(_url: string, _config?: ApiClientConfig) => {
      return { data: {} as T };
    },
    interceptors: {
      request: {
        use: (
          _onFulfilled: (config: ApiClientConfig) => ApiClientConfig,
          _onRejected?: (error: unknown) => unknown
        ) => {
          // Mock implementation
        },
      },
      response: {
        use: (
          _onFulfilled: (response: { data: unknown }) => { data: unknown },
          _onRejected?: (error: unknown) => unknown
        ) => {
          // Mock implementation
        },
      },
    },
  };
}

// 기본 인스턴스도 export
export const defaultApiClient = apiClient('/api');

// API 요청 래퍼 함수 (모킹)
export async function fetchApi<T>(): Promise<T> {
  return {} as T;
}

// API 요청 래퍼 함수 (axios 버전, 모킹)
export async function fetchApiWithAxios<T>(): Promise<T> {
  return {} as T;
}
