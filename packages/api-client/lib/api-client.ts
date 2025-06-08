import { ApiResponse } from '@cargoro/types/schema/api';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { handleApiError } from '../utils/api-error';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  protected axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30초 타임아웃
      ...config,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 요청 인터셉터
    this.axiosInstance.interceptors.request.use(
      config => {
        // 개발 환경에서 API 요청 로깅
        if (
          typeof (globalThis as any).__DEV__ !== 'undefined' ? (globalThis as any).__DEV__ : false
        ) {
          // eslint-disable-next-line no-console
          console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
          // eslint-disable-next-line no-console
          if (config.params) console.log('파라미터:', config.params);
          // eslint-disable-next-line no-console
          if (config.data) console.log('요청 데이터:', config.data);
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.axiosInstance.interceptors.response.use(
      response => {
        // 개발 환경에서 API 응답 로깅
        if (
          typeof (globalThis as any).__DEV__ !== 'undefined' ? (globalThis as any).__DEV__ : false
        ) {
          // eslint-disable-next-line no-console
          console.log(`API 응답: ${response.status} ${response.config.url}`);
          // eslint-disable-next-line no-console
          console.log('응답 데이터:', response.data);
        }
        return response;
      },
      error => {
        // 개발 환경에서 API 에러 로깅
        if (
          typeof (globalThis as any).__DEV__ !== 'undefined' ? (globalThis as any).__DEV__ : false
        ) {
          // eslint-disable-next-line no-console
          console.error('API 에러:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  // GET 요청 메서드
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // POST 요청 메서드
  async post<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // PUT 요청 메서드
  async put<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // PATCH 요청 메서드
  async patch<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // DELETE 요청 메서드
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 전체 응답을 가져오는 메서드
  async getFullResponse<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 인스턴스 헤더 설정 메서드
  setHeader(name: string, value: string): void {
    this.axiosInstance.defaults.headers.common[name] = value;
  }

  // 인증 토큰 설정 메서드
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // 인증 토큰 제거 메서드
  removeAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // 인증 토큰 제거를 위한 별칭 메서드 (호환성 유지)
  clearAuthToken(): void {
    this.removeAuthToken();
  }
}
