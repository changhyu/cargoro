/**
 * 예약 관리 API 클라이언트
 * Zod를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { z } from 'zod';
import { createSafeApiClient } from '@cargoro/utils';
import {
  ReservationSchema,
  ReservationCreateSchema,
  ReservationUpdateSchema,
  ReservationStatusSchema,
} from '@cargoro/types/schema/reservation';

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

// 타입 안전한 API 클라이언트 생성
const safeReservationApi = createSafeApiClient({
  baseURL: `${API_BASE_URL}/repair/reservations`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 래퍼 스키마
const ReservationResponseSchema = safeReservationApi.createResponseSchema(ReservationSchema);
const ReservationListResponseSchema = safeReservationApi.createResponseSchema(
  z.array(ReservationSchema)
);

// API 함수
export const reservationApi = {
  /**
   * 모든 예약 목록 조회
   */
  getAllReservations: async (params?: Record<string, any>) => {
    return safeReservationApi.get('/', ReservationListResponseSchema, { params });
  },

  /**
   * 특정 예약 조회
   */
  getReservationById: async (id: string) => {
    return safeReservationApi.get(`/${id}`, ReservationResponseSchema);
  },

  /**
   * 예약 생성
   */
  createReservation: async (data: z.infer<typeof ReservationCreateSchema>) => {
    return safeReservationApi.post('/', data, ReservationCreateSchema, ReservationResponseSchema);
  },

  /**
   * 예약 업데이트
   */
  updateReservation: async (id: string, data: z.infer<typeof ReservationUpdateSchema>) => {
    return safeReservationApi.patch(
      `/${id}`,
      data,
      ReservationUpdateSchema,
      ReservationResponseSchema
    );
  },

  /**
   * 예약 상태 변경
   */
  updateReservationStatus: async (id: string, status: z.infer<typeof ReservationStatusSchema>) => {
    return safeReservationApi.patch(
      `/${id}/status`,
      { status },
      z.object({ status: ReservationStatusSchema }),
      ReservationResponseSchema
    );
  },

  /**
   * 예약 취소
   */
  cancelReservation: async (id: string) => {
    // 삭제 API는 성공 시 204 No Content를 반환한다고 가정
    return safeReservationApi.delete(`/${id}`, z.void());
  },
};

// 타입 추출
export type Reservation = z.infer<typeof ReservationSchema>;
export type ReservationCreate = z.infer<typeof ReservationCreateSchema>;
export type ReservationUpdate = z.infer<typeof ReservationUpdateSchema>;
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;
