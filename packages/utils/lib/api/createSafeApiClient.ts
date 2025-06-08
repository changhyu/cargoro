// import { z } from 'zod';

interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export function createSafeApiClient(config: ApiClientConfig) {
  const { baseUrl, timeout = 10000, headers = {} } = config;

  async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return {
    get: <T>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      }),

    put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: 'DELETE' }),
  };
}
