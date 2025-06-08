/**
 * 타입 안전한 API 클라이언트 생성 유틸리티
 * Zod 스키마를 사용하여 요청과 응답을 검증합니다.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';

// 응답 래퍼 타입 (API 응답이 일관된 구조를 가진다고 가정)
const ApiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: schema,
    page: z.number().optional(),
    per_page: z.number().optional(),
    total_items: z.number().optional(),
    total_pages: z.number().optional(),
  });

// API 오류 응답 타입
const ApiErrorSchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  details: z.any().optional(),
});

type ApiClientOptions = {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
};

/**
 * 타입 안전한 API 클라이언트 생성 함수
 */
export function createSafeApiClient(options: ApiClientOptions) {
  // 기본 Axios 인스턴스 생성
  const axiosInstance = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  /**
   * 응답 데이터를 Zod 스키마로 검증하는 함수
   */
  function validateResponse<T extends z.ZodTypeAny>(
    response: AxiosResponse,
    schema: T
  ): z.infer<T> {
    try {
      return schema.parse(response.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('API 응답 검증 오류:', error.format());
        throw new Error('API 응답이 예상된 형식과 일치하지 않습니다.');
      }
      throw error;
    }
  }

  /**
   * GET 요청 함수
   */
  async function get<T extends z.ZodTypeAny>(
    url: string,
    responseSchema: T,
    config?: AxiosRequestConfig
  ): Promise<z.infer<T>> {
    const response = await axiosInstance.get(url, config);
    return validateResponse(response, responseSchema);
  }

  /**
   * POST 요청 함수
   */
  async function post<R extends z.ZodTypeAny, T extends z.ZodTypeAny>(
    url: string,
    data: z.infer<R>,
    requestSchema: R,
    responseSchema: T,
    config?: AxiosRequestConfig
  ): Promise<z.infer<T>> {
    // 요청 데이터 검증
    const validData = requestSchema.parse(data);
    const response = await axiosInstance.post(url, validData, config);
    return validateResponse(response, responseSchema);
  }

  /**
   * PUT 요청 함수
   */
  async function put<R extends z.ZodTypeAny, T extends z.ZodTypeAny>(
    url: string,
    data: z.infer<R>,
    requestSchema: R,
    responseSchema: T,
    config?: AxiosRequestConfig
  ): Promise<z.infer<T>> {
    const validData = requestSchema.parse(data);
    const response = await axiosInstance.put(url, validData, config);
    return validateResponse(response, responseSchema);
  }

  /**
   * PATCH 요청 함수
   */
  async function patch<R extends z.ZodTypeAny, T extends z.ZodTypeAny>(
    url: string,
    data: z.infer<R>,
    requestSchema: R,
    responseSchema: T,
    config?: AxiosRequestConfig
  ): Promise<z.infer<T>> {
    const validData = requestSchema.parse(data);
    const response = await axiosInstance.patch(url, validData, config);
    return validateResponse(response, responseSchema);
  }

  /**
   * DELETE 요청 함수
   */
  async function del<T extends z.ZodTypeAny>(
    url: string,
    responseSchema: T,
    config?: AxiosRequestConfig
  ): Promise<z.infer<T>> {
    const response = await axiosInstance.delete(url, config);
    return validateResponse(response, responseSchema);
  }

  /**
   * 응답 래퍼 스키마 생성 함수
   */
  function createResponseSchema<T extends z.ZodTypeAny>(schema: T) {
    return ApiResponseSchema(schema);
  }

  return {
    instance: axiosInstance,
    get,
    post,
    put,
    patch,
    delete: del,
    createResponseSchema,
    ApiErrorSchema,
  };
}

export type SafeApiClient = ReturnType<typeof createSafeApiClient>;
