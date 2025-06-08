// 정비 작업 상태
export type RepairStatus =
  | 'pending' // 대기 중
  | 'in_progress' // 진행 중
  | 'completed' // 완료
  | 'cancelled' // 취소
  | 'on_hold'; // 보류

// 정비 작업 유형
export type RepairType =
  | 'regular' // 정기 점검
  | 'repair' // 수리
  | 'maintenance' // 정비
  | 'emergency' // 응급 수리
  | 'inspection'; // 검사

// 우선순위
export type Priority =
  | 'low' // 낮음
  | 'normal' // 보통
  | 'high' // 높음
  | 'urgent'; // 긴급

// 정비사 역할
export type TechnicianRole =
  | 'junior' // 주니어
  | 'senior' // 시니어
  | 'lead' // 리드
  | 'specialist'; // 전문가

// 차량 정보
export interface VehicleInfo {
  id: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year?: number;
  vin?: string;
}

// 고객 정보
export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

// 정비사 정보
export interface TechnicianInfo {
  id: string;
  name: string;
  role: TechnicianRole;
  specialties?: string[];
  experience?: number;
}

// 부품 정보
export interface PartInfo {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// 정비 작업 상세
export interface RepairJobDetail {
  id: string;
  description: string;
  status: RepairStatus;
  type: RepairType;
  priority: Priority;
  estimatedDuration?: number; // 예상 소요 시간 (분)
  actualDuration?: number; // 실제 소요 시간 (분)
  estimatedCost?: number; // 예상 비용
  actualCost?: number; // 실제 비용
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  scheduledAt?: string; // 예약 일시
  vehicle: VehicleInfo;
  customer: CustomerInfo;
  assignedTechnician?: TechnicianInfo;
  parts?: PartInfo[]; // 사용된 부품들
  notes?: string;
  images?: string[]; // 첨부 이미지
  diagnosticCodes?: string[]; // 진단 코드
  workLog?: WorkLogEntry[]; // 작업 로그
}

// 작업 로그 항목
export interface WorkLogEntry {
  id: string;
  timestamp: string;
  technicianId: string;
  technicianName: string;
  action: string;
  description: string;
  duration?: number;
}

// API 응답 타입들
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 필터 옵션들
export interface RepairJobFilters {
  status?: RepairStatus[];
  type?: RepairType[];
  priority?: Priority[];
  technicianId?: string;
  customerId?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'scheduledAt';
  sortOrder?: 'asc' | 'desc';
}

// 통계 데이터
export interface RepairJobStats {
  totalJobs: number;
  pendingJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageCompletionTime: number; // 평균 완료 시간 (분)
  totalRevenue: number;
  averageJobValue: number;
}
