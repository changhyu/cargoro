/**
 * 일정 관리 API 클라이언트
 * Zod를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { z } from 'zod';
import { createSafeApiClient } from '@cargoro/utils';
import {
  ScheduleSchema,
  ScheduleCreateSchema,
  ScheduleUpdateSchema,
} from '@cargoro/types/schema/schedule';

// 일정 API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

// 타입 안전한 API 클라이언트 생성
const safeScheduleApi = createSafeApiClient({
  baseURL: `${API_BASE_URL}/repair/schedules`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 래퍼 스키마
const ScheduleResponseSchema = safeScheduleApi.createResponseSchema(ScheduleSchema);
const ScheduleListResponseSchema = safeScheduleApi.createResponseSchema(z.array(ScheduleSchema));

// API 함수
export const scheduleApi = {
  /**
   * 모든 일정 목록 조회
   */
  getAllSchedules: async (params?: Record<string, any>) => {
    return safeScheduleApi.get('/schedules', ScheduleListResponseSchema, { params });
  },

  /**
   * 특정 날짜 일정 조회
   */
  getSchedulesByDate: async (date: string, params?: Record<string, any>) => {
    return safeScheduleApi.get(`/date/${date}`, ScheduleListResponseSchema, { params });
  },

  /**
   * 특정 정비사의 일정 조회
   */
  getTechnicianSchedules: async (technicianId: string, params?: Record<string, any>) => {
    return safeScheduleApi.get(`/technician/${technicianId}`, ScheduleListResponseSchema, {
      params,
    });
  },

  /**
   * 특정 일정 조회
   */
  getScheduleById: async (id: string) => {
    return safeScheduleApi.get(`/${id}`, ScheduleResponseSchema);
  },

  /**
   * 일정 생성
   */
  createSchedule: async (data: z.infer<typeof ScheduleCreateSchema>) => {
    return safeScheduleApi.post('/', data, ScheduleCreateSchema, ScheduleResponseSchema);
  },

  /**
   * 일정 업데이트
   */
  updateSchedule: async (id: string, data: z.infer<typeof ScheduleUpdateSchema>) => {
    return safeScheduleApi.patch(`/${id}`, data, ScheduleUpdateSchema, ScheduleResponseSchema);
  },

  /**
   * 일정 삭제
   */
  deleteSchedule: async (id: string) => {
    // 삭제 API는 성공 시 204 No Content를 반환한다고 가정
    return safeScheduleApi.delete(`/${id}`, z.void());
  },
};

// 타입 추출
export type Schedule = z.infer<typeof ScheduleSchema>;
export type ScheduleCreate = z.infer<typeof ScheduleCreateSchema>;
export type ScheduleUpdate = z.infer<typeof ScheduleUpdateSchema>;
