export enum ReservationType {
  INSPECTION = 'inspection',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  EMERGENCY = 'emergency',
}

// ReservationStatus를 직접 타입으로 정의
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';

// ReservationStatus 객체 정의 (이전의 import된 enum을 대체)
export const ReservationStatus = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  IN_PROGRESS: 'in_progress' as const,
};

export interface ExtendedReservation {
  id: string;
  customerName: string;
  contactNumber: string;
  plateNumber: string;
  type: ReservationType;
  scheduledDate: string;
  scheduledTime: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const reservationTypeText = {
  [ReservationType.INSPECTION]: '점검',
  [ReservationType.MAINTENANCE]: '정비',
  [ReservationType.REPAIR]: '수리',
  [ReservationType.EMERGENCY]: '응급',
} as const;
