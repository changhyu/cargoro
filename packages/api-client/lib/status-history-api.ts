/**
 * 상태 이력 API 클라이언트
 * Zod를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { z } from 'zod';
import { createSafeApiClient } from '@cargoro/utils';
import {
  StatusHistorySchema,
  StatusHistoryCreateSchema,
} from '@cargoro/types/schema/status-history';

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

// 타입 안전한 API 클라이언트 생성
const safeStatusHistoryApi = createSafeApiClient({
  baseURL: `${API_BASE_URL}/repair/repairs`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 래퍼 스키마
const StatusHistoryResponseSchema = safeStatusHistoryApi.createResponseSchema(StatusHistorySchema);
const StatusHistoryListResponseSchema = safeStatusHistoryApi.createResponseSchema(
  z.object({
    statusHistory: z.array(StatusHistorySchema),
  })
);

// API 함수
export const statusHistoryApi = {
  /**
   * 정비 작업의 상태 이력 조회
   */
  getStatusHistory: async (repairId: string) => {
    return safeStatusHistoryApi.get(`/${repairId}/status-history`, StatusHistoryListResponseSchema);
  },

  /**
   * 정비 작업에 상태 이력 추가
   */
  addStatusHistory: async (repairId: string, data: z.infer<typeof StatusHistoryCreateSchema>) => {
    return safeStatusHistoryApi.post(
      `/${repairId}/status-history`,
      data,
      StatusHistoryCreateSchema,
      StatusHistoryResponseSchema
    );
  },
};

// 타입 추출
export type StatusHistory = z.infer<typeof StatusHistorySchema>;
export type StatusHistoryCreate = z.infer<typeof StatusHistoryCreateSchema>;
