/**
 * 차량 관련 타입 정의
 */

// 차량 정보 타입
export interface Vehicle {
  id: string;
  vehicleId?: string;
  licensePlate?: string;
  plateNumber: string; // licensePlate의 별칭
  brand?: string;
  make: string; // brand의 별칭
  model: string;
  year: number;
  type?: 'sedan' | 'suv' | 'truck' | 'van';
  status:
    | 'active'
    | 'available'
    | 'in_use'
    | 'maintenance'
    | 'inactive'
    | 'reserved'
    | 'out_of_service'
    | 'idle';
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  vinNumber?: string;
  vin?: string; // vinNumber의 별칭
  lastMaintenance?: string;
  nextMaintenance?: string;
  purchaseDate?: string;
  registrationDate?: string;
  insuranceExpiry?: string;
  imageUrl?: string;
  currentDriverId?: string;
  mileage?: number;
  fuelLevel?: number;
  lastInspection?: string;
  color?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// 차량 위치 정보 타입
export interface VehicleLocation {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// 차량 목록 응답 타입
export interface VehiclesResponse {
  vehicles?: Vehicle[]; // 기존 구조 유지
  items?: Vehicle[]; // 새로운 구조 지원
  total: number;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  itemsPerPage?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 차량 필터 타입
export interface VehicleFilters {
  status?: string;
  type?: string;
  brand?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

// 차량 통계 타입
export interface VehicleStatistics {
  total: number;
  active: number;
  idle: number;
  maintenance: number;
  outOfService: number;
}

// 차량 폼 데이터 타입
export interface VehicleFormData {
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type?: 'sedan' | 'suv' | 'truck' | 'van';
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  vinNumber?: string;
  color?: string;
  status?: Vehicle['status'];
  mileage?: number;
  fuelLevel?: number;
  notes?: string;
}

// 차량 정비 기록 타입
export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  notes: string;
  cost: number;
  serviceCenter: string;
  createdAt: string;
  updatedAt: string;
}
