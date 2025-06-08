import {
  Maintenance,
  MaintenancePart,
  MaintenanceFilters,
  MaintenanceListResponse,
  MaintenanceStatus,
} from '../../services/api';

// 정비 타입
export const MaintenanceType = {
  REGULAR: 'scheduled',
  REPAIR: 'repair',
  EMERGENCY: 'emergency',
  INSPECTION: 'inspection',
} as const;

export type MaintenanceType = (typeof MaintenanceType)[keyof typeof MaintenanceType];

// api.ts에서 MaintenanceStatus를 import해서 사용
export type { MaintenanceStatus };

export type { Maintenance, MaintenancePart, MaintenanceFilters, MaintenanceListResponse };

// 정비 폼 데이터 - API의 Maintenance 타입과 일치하도록 수정
export interface MaintenanceFormData {
  vehicleId: string;
  title: string;
  description?: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string; // startDate를 scheduledDate로 변경
  completedDate?: string; // endDate를 completedDate로 변경
  cost?: number;
  serviceCenterId?: string;
  serviceCenterName?: string;
  technician?: string;
  notes?: string;
  parts?: Omit<MaintenancePart, 'id' | 'maintenanceId'>[];
}

// 정비 일정 요약 (차량, 정비소 정보 포함)
export interface MaintenanceScheduleSummary {
  id: string;
  title: string;
  description?: string;
  scheduledDate: string; // startDate를 scheduledDate로 변경
  completedDate?: string; // endDate를 completedDate로 변경
  status: MaintenanceStatus;
  type: MaintenanceType;
  vehicle: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
  };
  serviceCenter?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
}
