/**
 * 정비 API 클라이언트
 * Zod를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { z } from 'zod';
import { createSafeApiClient } from '@cargoro/utils';

// 정비 API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

// 타입 안전한 API 클라이언트 생성
const safeRepairApi = createSafeApiClient({
  baseURL: `${API_BASE_URL}/repair`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 정비 상태 스키마
export const RepairStatusSchema = z.enum([
  'pending',
  'in_progress',
  'waiting_parts',
  'completed',
  'cancelled',
]);

// 정비 유형 스키마
export const RepairTypeSchema = z.enum([
  'regular',
  'repair',
  'emergency',
  'inspection',
  'parts_replacement',
]);

// 정비 작업 스키마
export const RepairSchema = z.object({
  id: z.string(),
  vehicle_id: z.string(),
  repair_type: RepairTypeSchema,
  description: z.string(),
  estimated_hours: z.number(),
  technician_id: z.string().optional(),
  reservation_id: z.string().optional(),
  start_time: z.string().optional(),
  completion_time: z.string().optional(),
  status: RepairStatusSchema,
  parts_required: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  notes: z.string().optional(),
});

// 정비 작업 생성 요청 스키마
export const RepairCreateSchema = z.object({
  vehicle_id: z.string(),
  repair_type: RepairTypeSchema,
  description: z.string(),
  estimated_hours: z.number(),
  technician_id: z.string().optional(),
  reservation_id: z.string().optional(),
  start_time: z.string().optional(),
  parts_required: z.boolean().default(false),
});

// 정비 작업 업데이트 요청 스키마
export const RepairUpdateSchema = z.object({
  vehicle_id: z.string().optional(),
  repair_type: RepairTypeSchema.optional(),
  description: z.string().optional(),
  estimated_hours: z.number().optional(),
  technician_id: z.string().optional(),
  reservation_id: z.string().optional(),
  start_time: z.string().optional(),
  completion_time: z.string().optional(),
  status: RepairStatusSchema.optional(),
  parts_required: z.boolean().optional(),
  notes: z.string().optional(),
});

// 정비 작업 상태 업데이트 요청 스키마
export const RepairStatusUpdateSchema = z.object({
  status: RepairStatusSchema,
  notes: z.string().optional(),
});

// 응답 래퍼 스키마
const RepairResponseSchema = safeRepairApi.createResponseSchema(RepairSchema);
const RepairListResponseSchema = safeRepairApi.createResponseSchema(z.array(RepairSchema));

// API 함수
export const repairApi = {
  /**
   * 모든 정비 작업 목록 조회
   */
  getAllRepairs: async (params?: Record<string, any>) => {
    return safeRepairApi.get('/repairs', RepairListResponseSchema, { params });
  },

  /**
   * 특정 정비 작업 조회
   */
  getRepairById: async (id: string) => {
    return safeRepairApi.get(`/repairs/${id}`, RepairResponseSchema);
  },

  /**
   * 정비 작업 생성
   */
  createRepair: async (data: z.infer<typeof RepairCreateSchema>) => {
    return safeRepairApi.post('/repairs', data, RepairCreateSchema, RepairResponseSchema);
  },

  /**
   * 정비 작업 업데이트
   */
  updateRepair: async (id: string, data: z.infer<typeof RepairUpdateSchema>) => {
    return safeRepairApi.patch(`/repairs/${id}`, data, RepairUpdateSchema, RepairResponseSchema);
  },

  /**
   * 정비 작업 상태 업데이트
   */
  updateRepairStatus: async (id: string, data: z.infer<typeof RepairStatusUpdateSchema>) => {
    return safeRepairApi.patch(
      `/repairs/${id}/status`,
      data,
      RepairStatusUpdateSchema,
      RepairResponseSchema
    );
  },

  /**
   * 정비 작업 삭제
   */
  deleteRepair: async (id: string) => {
    // 삭제 API는 성공 시 204 No Content를 반환한다고 가정
    return safeRepairApi.delete(`/repairs/${id}`, z.void());
  },
};

// 타입 추출 (필요한 경우 다른 파일에서 가져다 사용)
export type RepairStatus = z.infer<typeof RepairStatusSchema>;
export type RepairType = z.infer<typeof RepairTypeSchema>;
export type Repair = z.infer<typeof RepairSchema>;
export type RepairCreate = z.infer<typeof RepairCreateSchema>;
export type RepairUpdate = z.infer<typeof RepairUpdateSchema>;
export type RepairStatusUpdate = z.infer<typeof RepairStatusUpdateSchema>;
