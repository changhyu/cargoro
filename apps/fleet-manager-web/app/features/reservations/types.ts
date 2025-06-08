// 예약 상태 타입은 @cargoro/types/schema/reservation에서 가져옴
export { ReservationStatus } from '@cargoro/types/schema/reservation';

// 예약 타입 enum
export const ReservationType = {
  RENTAL: 'rental',
  MAINTENANCE: 'maintenance',
  INSPECTION: 'inspection',
} as const;

export type ReservationType = (typeof ReservationType)[keyof typeof ReservationType];

// API의 Reservation 타입을 re-export
export type { Reservation } from '../../services/api';
