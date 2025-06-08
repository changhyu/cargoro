import { ReservationStatus, ReservationStatusType } from '@cargoro/types/schema/reservation';

export interface ExtendedReservation {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status: ReservationStatusType;
  purpose: string;
  destination: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // 확장 필드들
  user?: {
    name: string;
    email: string;
  };
  vehicle?: {
    licensePlate: string;
    model: string;
    type: string;
  };
  // 추가 필드들
  customerName?: string;
  plateNumber?: string;
  contactNumber?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  type?: ReservationType;
}

export enum ReservationType {
  BUSINESS = 'business',
  PERSONAL = 'personal',
  MAINTENANCE = 'maintenance',
  EMERGENCY = 'emergency',
  INSPECTION = 'inspection',
  REPAIR = 'repair',
}

export const reservationTypeText: Record<ReservationType, string> = {
  [ReservationType.BUSINESS]: '업무용',
  [ReservationType.PERSONAL]: '개인용',
  [ReservationType.MAINTENANCE]: '정비용',
  [ReservationType.EMERGENCY]: '응급용',
  [ReservationType.INSPECTION]: '점검용',
  [ReservationType.REPAIR]: '수리용',
};

export default ExtendedReservation;
