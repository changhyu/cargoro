/**
 * 정비 작업 관리 모듈에서 사용하는 타입 정의
 */

// 정비 작업 상태 타입
export type RepairStatus = 'pending' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';

// 정비 작업 우선순위 타입
export type RepairPriority = 'low' | 'normal' | 'high' | 'urgent';

// 정비 작업 유형 타입
export type RepairType = 'regular' | 'repair' | 'warranty' | 'recall' | 'custom';

// 정비사 역할 타입
export type TechnicianRole = 'junior' | 'senior' | 'master';

// 정비사 정보 타입
export interface TechnicianInfo {
  id: string;
  name: string;
  role: string;
  department?: string;
}

// 정비사 상세 정보 타입 (useRepairJobs에서 사용)
export interface Technician {
  id: string;
  name: string;
  role: 'junior' | 'senior' | 'master';
  specialties: string[];
  active: boolean;
  currentLoad: number;
  skills: Record<string, number>;
  availability: {
    available: boolean;
    nextAvailableTime?: string;
  };
}

// 차량 정보 타입
export interface VehicleInfo {
  id: string;
  vin: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  mileage?: number;
}

// 고객 정보 타입
export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
}

// 비용 정보 타입
export interface CostInfo {
  labor: number;
  parts: number;
  total: number;
  tax?: number;
  discount?: number;
  currency?: string; // 통화 정보 추가
}

// 부품 정보 타입
export interface PartInfo {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  cost: number;
  unitPrice?: number; // 단가 정보 추가
  totalPrice?: number; // 총가격 정보 추가
  available?: boolean;
  isAvailable?: boolean; // 대안 필드명 추가
  expectedArrival?: string;
  estimatedArrival?: string; // 대안 필드명 추가
}

// 정비 부품 타입 (useRepairJobs에서 사용)
export interface RepairPart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailable: boolean;
  estimatedArrival?: string;
}

// 진단 정보 타입
export interface DiagnosticInfo {
  id: string;
  code: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// 진단 결과 타입 (useRepairJobs에서 사용)
export interface DiagnosticResult {
  id: string;
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  diagnosedBy: string;
}

// 이미지 정보 타입
export interface ImageInfo {
  id: string;
  url: string;
  description?: string;
  timestamp: string;
}

// 정비 작업 정보 타입
export interface RepairJob {
  id: string;
  vehicleId?: string; // 차량 ID 추가
  vehicleInfo: VehicleInfo;
  customerInfo: CustomerInfo;
  technicianInfo?: TechnicianInfo;
  assignedTechnicianId?: string; // 할당된 정비사 ID 추가
  description: string;
  notes: string;
  status: RepairStatus;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  startDate?: string; // 시작일 추가
  completedDate?: string;
  completionDate?: string; // 대안 필드명 추가
  estimatedDuration?: number;
  estimatedHours?: number; // 대안 필드명 추가
  cost: CostInfo;
  usedParts?: PartInfo[];
  diagnostics?: DiagnosticInfo[];
  priority?: RepairPriority;
  type?: RepairType;
  images?: ImageInfo[]; // 이미지 배열 추가
}

// 정비 작업 생성 요청 데이터 타입
export interface RepairJobCreateData {
  vehicleInfo: VehicleInfo;
  customerInfo: CustomerInfo;
  description: string;
  notes?: string;
  priority: RepairPriority;
  type: RepairType;
  status: RepairStatus;
  scheduledDate?: string;
  estimatedDuration?: number;
  cost: CostInfo;
}

// 정비 작업 업데이트 요청 데이터 타입
export interface RepairJobUpdateData {
  description?: string;
  notes?: string;
  status?: RepairStatus;
  priority?: RepairPriority;
  type?: RepairType;
  estimatedHours?: number;
  assignedTechnicianId?: string;
  scheduledDate?: string;
  startDate?: string;
  completionDate?: string;
  usedParts?: Array<{
    id: string;
    quantity: number;
  }>;
  cost?: Partial<CostInfo>;
}

// 정비 작업 목록 조회 응답 타입
export interface RepairJobListResponse {
  jobs: RepairJob[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 정비 작업 생성 응답 타입
export interface RepairJobCreateResponse {
  success: boolean;
  data: RepairJob;
  message?: string;
}

// 정비 작업 삭제 응답 타입
export interface RepairJobDeleteResponse {
  success: boolean;
  message?: string;
}

// 정비 작업 상세 조회 응답 타입
export interface RepairJobDetailResponse {
  job: RepairJob;
}

// 정비 작업 상태 업데이트 요청 타입
export interface RepairJobStatusUpdateRequest {
  id: string;
  status: RepairStatus;
  notes?: string;
}

// 정비 작업 업데이트 응답 타입
export interface RepairJobUpdateResponse {
  job: RepairJob;
  success: boolean;
  message?: string;
}

// 정비 작업 필터 타입
export interface RepairJobFilter {
  status?: RepairStatus | 'all';
  type?: RepairType;
  priority?: RepairPriority;
  technicianId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}
