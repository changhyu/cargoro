/**
 * 정비 작업 관리 모듈에서 사용하는 타입 정의
 */

// 정비 작업 상태 타입
export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'waiting_parts';

// 정비 유형 타입
export type RepairType = 'regular' | 'emergency' | 'inspection' | 'warranty' | 'recall' | 'repair';

// 정비 우선순위 타입
export type RepairPriority = 'low' | 'normal' | 'high' | 'urgent';

// 정비사 역할 타입
export type TechnicianRole = 'junior' | 'senior' | 'master' | 'supervisor';

// 정비 작업 정보 타입
export interface RepairJob {
  id: string;
  vehicleId: string;
  vehicleInfo: {
    licensePlate: string;
    manufacturer: string;
    model: string;
    year: number;
    vin: string;
  };
  customerInfo: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  description: string;
  status: RepairStatus;
  type: RepairType;
  priority: RepairPriority;
  estimatedHours: number;
  assignedTechnicianId: string | null;
  technicianInfo?: {
    id: string;
    name: string;
    role: TechnicianRole;
  };
  startDate: string | null;
  completionDate: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string;
  cost: {
    labor: number;
    parts: number;
    total: number;
    currency: string;
  };
  usedParts: RepairPart[];
  diagnostics: DiagnosticResult[];
  images: string[];
}

// 정비 부품 타입
export interface RepairPart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailable: boolean;
  estimatedArrival?: string; // 부품이 없는 경우 도착 예정일
}

// 진단 결과 타입
export interface DiagnosticResult {
  id: string;
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  diagnosedBy: string;
}

// 정비사 정보 타입
export interface Technician {
  id: string;
  name: string;
  role: TechnicianRole;
  specialties: string[];
  active: boolean;
  currentLoad: number; // 0-100% 작업량
  skills: {
    [key: string]: number; // 기술명: 숙련도 (1-5)
  };
  availability: {
    available: boolean;
    nextAvailableTime?: string;
  };
}

// 정비 작업 필터 타입
export interface RepairJobFilter {
  page: number;
  pageSize: number;
  status?: RepairStatus;
  type?: RepairType;
  priority?: RepairPriority;
  technicianId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
