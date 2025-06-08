import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReservationStatusType } from '@cargoro/types/schema/reservation';

export interface ReservationHistory {
  id: string;
  action: string;
  oldStatus?: ReservationStatusType;
  newStatus?: ReservationStatusType;
  notes?: string;
  userName: string;
  timestamp: string;
}

export interface Reservation {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: ReservationStatusType;
  purpose: string;
  destination: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  history?: ReservationHistory[];
}

export interface UpdateReservationStatusDto {
  status: ReservationStatusType;
  notes?: string;
}

// Mock API 함수들
const reservationApi = {
  async getReservations(): Promise<Reservation[]> {
    // Mock implementation
    return [];
  },

  async getReservation(id: string): Promise<Reservation | null> {
    // Mock implementation
    return {
      id,
      userId: 'user-1',
      vehicleId: 'vehicle-1',
      vehicleLicensePlate: '12가3456',
      customerName: '김철수',
      customerPhone: '010-1234-5678',
      startDate: '2023-06-01',
      endDate: '2023-06-02',
      status: 'confirmed' as ReservationStatusType,
      purpose: '업무용',
      destination: '서울역',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: 'h1',
          action: '예약 생성',
          newStatus: 'pending' as ReservationStatusType,
          userName: '김관리자',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'h2',
          action: '예약 상태 변경',
          oldStatus: 'pending' as ReservationStatusType,
          newStatus: 'confirmed' as ReservationStatusType,
          userName: '김관리자',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  },

  async createReservation(
    data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Reservation> {
    // Mock implementation
    return {
      ...data,
      id: 'new-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async updateReservationStatus(
    id: string,
    data: UpdateReservationStatusDto
  ): Promise<Reservation> {
    // Mock implementation
    const existing = await this.getReservation(id);
    if (!existing) throw new Error('Reservation not found');

    return {
      ...existing,
      status: data.status,
      notes: data.notes || existing.notes,
      updatedAt: new Date().toISOString(),
    };
  },

  async cancelReservation(_data: { id: string; reason: string }): Promise<void> {
    // Mock implementation
    // 예약 취소 처리 로직
  },
};

// React Query 훅들
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationApi.createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationStatusDto }) =>
      reservationApi.updateReservationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useReservationsQuery() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: reservationApi.getReservations,
  });
}

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: reservationApi.getReservations,
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => reservationApi.getReservation(id),
    enabled: !!id,
  });
}

// 누락된 함수들 추가
export function useReservationQuery(id: string) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => reservationApi.getReservation(id),
    enabled: !!id,
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationApi.cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
