import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ReservationStatus,
  ReservationType,
  ReservationStatusType,
} from '@cargoro/types/schema/reservation';

// 타입 별칭 정의
export type ReservationTypeType = keyof typeof ReservationType;

// 기본 예약 인터페이스
export interface Reservation {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status: ReservationStatusType;
  type: ReservationTypeType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 확장된 예약 인터페이스 (추가 정보 포함)
export interface ExtendedReservation extends Reservation {
  customerName: string;
  customerPhone: string;
  contactNumber: string;
  plateNumber: string;
  vehicleLicensePlate: string;
  scheduledDate: string;
  scheduledTime: string;
  purpose?: string;
  vehicle?: {
    id: string;
    licensePlate: string;
    model: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  history?: ReservationHistoryItem[];
}

// 예약 히스토리 아이템
export interface ReservationHistoryItem {
  id: string;
  action: string;
  timestamp: string;
  userName: string;
  oldStatus?: ReservationStatusType;
  newStatus?: ReservationStatusType;
  notes?: string;
}

// 예약 상태 업데이트 DTO
export interface UpdateReservationStatusDto {
  status: ReservationStatusType;
  notes?: string;
}

// 예약 생성 DTO
export interface CreateReservationDto {
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  type: ReservationTypeType;
  notes?: string;
}

// 예약 조회 쿼리 파라미터
export interface ReservationQueryParams {
  status?: ReservationStatusType;
  type?: ReservationTypeType;
  startDate?: string;
  endDate?: string;
  userId?: string;
  vehicleId?: string;
}

// 예약 API 서비스
class ReservationService {
  private baseUrl = '/api/reservations';

  async getReservations(params?: ReservationQueryParams): Promise<ExtendedReservation[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    if (!response.ok) {
      throw new Error('예약 목록을 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async getReservation(id: string): Promise<ExtendedReservation> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('예약 정보를 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('예약 생성에 실패했습니다.');
    }
    return response.json();
  }

  async updateReservationStatus(
    id: string,
    data: UpdateReservationStatusDto
  ): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('예약 상태 업데이트에 실패했습니다.');
    }
    return response.json();
  }

  async cancelReservation(id: string, reason?: string): Promise<Reservation> {
    const response = await fetch(`${this.baseUrl}/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('예약 취소에 실패했습니다.');
    }
    return response.json();
  }
}

export const reservationService = new ReservationService();

// React Query 훅들
export function useReservations(params?: ReservationQueryParams) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationService.getReservations(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useReservationsQuery(params?: ReservationQueryParams) {
  return useReservations(params);
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationService.getReservation(id),
    enabled: !!id,
  });
}

export function useReservationQuery(id: string) {
  return useReservation(id);
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationDto) => reservationService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationStatusDto }) =>
      reservationService.updateReservationStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', id] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reservationService.cancelReservation(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', id] });
    },
  });
}

// 예약 상태별 색상 헬퍼
export function getReservationStatusColor(status: ReservationStatusType): string {
  switch (status) {
    case ReservationStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case ReservationStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800';
    case ReservationStatus.IN_PROGRESS:
      return 'bg-green-100 text-green-800';
    case ReservationStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case ReservationStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 예약 상태별 라벨
export function getReservationStatusLabel(status: ReservationStatusType): string {
  switch (status) {
    case ReservationStatus.PENDING:
      return '대기중';
    case ReservationStatus.CONFIRMED:
      return '확정';
    case ReservationStatus.IN_PROGRESS:
      return '진행중';
    case ReservationStatus.COMPLETED:
      return '완료';
    case ReservationStatus.CANCELLED:
      return '취소';
    default:
      return '알 수 없음';
  }
}

// 예약 타입별 라벨
export function getReservationTypeLabel(type: ReservationTypeType): string {
  switch (type) {
    case 'INSPECTION':
      return '점검';
    case 'MAINTENANCE':
      return '정비';
    case 'REPAIR':
      return '수리';
    case 'EMERGENCY':
      return '긴급수리';
    case 'REGULAR':
      return '정기점검';
    default:
      return '알 수 없음';
  }
}
