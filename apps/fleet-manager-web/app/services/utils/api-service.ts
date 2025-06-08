/**
 * API 서비스 래퍼
 *
 * 모든 API 호출에 일관된 오류 처리, 로깅, 재시도 메커니즘을 적용합니다.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '../../constants/constants';

import errorUtils from './error-utils';
import logger from './logger';

// API 서비스 기본 옵션 타입
export interface ApiServiceOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryBackoffFactor?: number;
  headers?: Record<string, string>;
}

// 기본 API 옵션
const DEFAULT_OPTIONS: ApiServiceOptions = {
  baseURL: API_BASE_URL,
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
  retryBackoffFactor: 2,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API 서비스 클래스
 * 모든 API 통신을 처리하고 일관된 오류 처리 및 로깅을 제공합니다.
 */
export class ApiService {
  private axios: AxiosInstance;
  private options: ApiServiceOptions;

  constructor(options: ApiServiceOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Axios 인스턴스 생성
    this.axios = axios.create({
      baseURL: this.options.baseURL,
      timeout: this.options.timeout,
      headers: this.options.headers,
    });

    // 요청 인터셉터 설정
    this.axios.interceptors.request.use(
      config => {
        // API 요청 로그
        logger.debug(`API 요청: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
        return config;
      },
      error => {
        logger.error('API 요청 오류:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 설정
    this.axios.interceptors.response.use(
      response => {
        // API 응답 로그 (개발 환경에서만 상세 정보 포함)
        logger.debug(
          `API 응답: ${response.status} ${response.config.url}`,
          process.env.NODE_ENV === 'development' ? response.data : undefined
        );
        return response;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * HTTP GET 요청
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return errorUtils.withRetry(
      async () => {
        try {
          const response = await this.axios.get<T>(url, config);
          return response.data;
        } catch (error) {
          throw errorUtils.handleApiError(error, `GET ${url}`);
        }
      },
      this.options.retries,
      this.options.retryDelay,
      this.options.retryBackoffFactor
    );
  }

  /**
   * HTTP POST 요청
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return errorUtils.withRetry(
      async () => {
        try {
          const response = await this.axios.post<T>(url, data, config);
          return response.data;
        } catch (error) {
          throw errorUtils.handleApiError(error, `POST ${url}`);
        }
      },
      this.options.retries,
      this.options.retryDelay,
      this.options.retryBackoffFactor
    );
  }

  /**
   * HTTP PUT 요청
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return errorUtils.withRetry(
      async () => {
        try {
          const response = await this.axios.put<T>(url, data, config);
          return response.data;
        } catch (error) {
          throw errorUtils.handleApiError(error, `PUT ${url}`);
        }
      },
      this.options.retries,
      this.options.retryDelay,
      this.options.retryBackoffFactor
    );
  }

  /**
   * HTTP PATCH 요청
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return errorUtils.withRetry(
      async () => {
        try {
          const response = await this.axios.patch<T>(url, data, config);
          return response.data;
        } catch (error) {
          throw errorUtils.handleApiError(error, `PATCH ${url}`);
        }
      },
      this.options.retries,
      this.options.retryDelay,
      this.options.retryBackoffFactor
    );
  }

  /**
   * HTTP DELETE 요청
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return errorUtils.withRetry(
      async () => {
        try {
          const response = await this.axios.delete<T>(url, config);
          return response.data;
        } catch (error) {
          throw errorUtils.handleApiError(error, `DELETE ${url}`);
        }
      },
      this.options.retries,
      this.options.retryDelay,
      this.options.retryBackoffFactor
    );
  }
}

// 기본 API 서비스 인스턴스 생성
export const apiService = new ApiService();

export default apiService;
