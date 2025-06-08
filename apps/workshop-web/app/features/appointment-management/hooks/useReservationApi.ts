/**
 * 예약 관리 API 통신용 훅
 * Zod와 React Query를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reservationApi,
  Reservation,
  ReservationCreate,
  ReservationUpdate,
  ReservationStatus,
} from '@cargoro/api-client/lib/reservation-api';

// 백엔드 스네이크 케이스를 프론트엔드 카멜 케이스로 변환하는 유틸리티 함수
const transformReservation = (reservation: Reservation) => {
  return {
    id: reservation.id,
    customerId: reservation.customer_id,
    vehicleId: reservation.vehicle_id,
    serviceType: reservation.service_type,
    date: reservation.date,
    status: reservation.status,
    notes: reservation.notes,
    createdAt: reservation.created_at,
    updatedAt: reservation.updated_at,
  };
};

/**
 * 모든 예약 조회 훅
 */
export function useReservations(filter = {}) {
  return useQuery({
    queryKey: ['reservations', filter],
    queryFn: async () => {
      const response = await reservationApi.getAllReservations(filter);
      return {
        reservations: response.data.map(transformReservation),
        page: response.page,
        perPage: response.per_page,
        totalItems: response.total_items,
        totalPages: response.total_pages,
      };
    },
  });
}

/**
 * 특정 예약 조회 훅
 */
export function useReservation(id: string | undefined) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: async () => {
      if (!id) throw new Error('예약 ID가 필요합니다.');
      const response = await reservationApi.getReservationById(id);
      return transformReservation(response.data);
    },
    enabled: !!id,
  });
}

/**
 * 예약 생성 훅
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationData: ReservationCreate) => {
      const response = await reservationApi.createReservation(reservationData);
      return transformReservation(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

/**
 * 예약 업데이트 훅
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      updateData,
    }: {
      reservationId: string;
      updateData: ReservationUpdate;
    }) => {
      const response = await reservationApi.updateReservation(reservationId, updateData);
      return transformReservation(response.data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', data.id] });
    },
  });
}

/**
 * 예약 상태 변경 훅
 */
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      status,
    }: {
      reservationId: string;
      status: ReservationStatus;
    }) => {
      const response = await reservationApi.updateReservationStatus(reservationId, status);
      return transformReservation(response.data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', data.id] });
    },
  });
}

/**
 * 예약 취소 훅
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      await reservationApi.cancelReservation(reservationId);
      return { id: reservationId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

// 타입 재정의 (프론트엔드 친화적인 카멜 케이스)
export interface ReservationData {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationApiHookReturn {
  // TODO: 예약 관리 API 훅 반환 타입 정의 필요
  reservations: unknown[];
  createReservation: (data: unknown) => Promise<unknown>;
  updateReservation: (id: string, data: unknown) => Promise<unknown>;
  deleteReservation: (id: string) => Promise<void>;
}
