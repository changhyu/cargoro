/**
 * 정비 서비스 요청 API 클라이언트
 * Zod를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { z } from 'zod';
import { createSafeApiClient } from '@cargoro/utils';
import {
  ServiceRequestSchema,
  ServiceRequestCreateSchema,
  ServiceRequestUpdateSchema,
  ServiceRequestStatusSchema,
} from '@cargoro/types/schema/service-request';

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

// 타입 안전한 API 클라이언트 생성
const safeServiceRequestApi = createSafeApiClient({
  baseURL: `${API_BASE_URL}/repair/service-requests`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 래퍼 스키마
const ServiceRequestResponseSchema =
  safeServiceRequestApi.createResponseSchema(ServiceRequestSchema);
const ServiceRequestListResponseSchema = safeServiceRequestApi.createResponseSchema(
  z.array(ServiceRequestSchema)
);

// API 함수
export const serviceRequestApi = {
  /**
   * 모든 서비스 요청 목록 조회
   */
  getAllServiceRequests: async (params?: Record<string, any>) => {
    return safeServiceRequestApi.get('/', ServiceRequestListResponseSchema, { params });
  },

  /**
   * 특정 서비스 요청 조회
   */
  getServiceRequestById: async (id: string) => {
    return safeServiceRequestApi.get(`/${id}`, ServiceRequestResponseSchema);
  },

  /**
   * 서비스 요청 생성
   */
  createServiceRequest: async (data: z.infer<typeof ServiceRequestCreateSchema>) => {
    return safeServiceRequestApi.post(
      '/',
      data,
      ServiceRequestCreateSchema,
      ServiceRequestResponseSchema
    );
  },

  /**
   * 서비스 요청 업데이트
   */
  updateServiceRequest: async (id: string, data: z.infer<typeof ServiceRequestUpdateSchema>) => {
    return safeServiceRequestApi.patch(
      `/${id}`,
      data,
      ServiceRequestUpdateSchema,
      ServiceRequestResponseSchema
    );
  },

  /**
   * 서비스 요청 상태 변경
   */
  updateServiceRequestStatus: async (
    id: string,
    status: z.infer<typeof ServiceRequestStatusSchema>
  ) => {
    return safeServiceRequestApi.patch(
      `/${id}/status`,
      { status },
      z.object({ status: ServiceRequestStatusSchema }),
      ServiceRequestResponseSchema
    );
  },

  /**
   * 서비스 요청 삭제
   */
  deleteServiceRequest: async (id: string) => {
    // 삭제 API는 성공 시 204 No Content를 반환한다고 가정
    return safeServiceRequestApi.delete(`/${id}`, z.void());
  },
};

// 타입 추출
export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;
export type ServiceRequestCreate = z.infer<typeof ServiceRequestCreateSchema>;
export type ServiceRequestUpdate = z.infer<typeof ServiceRequestUpdateSchema>;
export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusSchema>;
