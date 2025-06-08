/**
 * 차량 관리 모듈에서 사용하는 타입 정의
 */

// 차량 상태 타입
export type VehicleStatus = 'active' | 'inactive' | 'maintenance';

// 차량 소유자 정보 타입
export interface VehicleOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
}

// 차량 정보 타입
export interface Vehicle {
  id: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  vin: string;
  status: VehicleStatus;
  lastServiceDate?: string;
  notes?: string;
  owner?: VehicleOwner;
}

// 차량 목록 조회 응답 타입
export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
}

// 차량 상세 조회 응답 타입
export interface VehicleDetailResponse {
  vehicle: Vehicle;
}

// 차량 업데이트 요청 타입
export interface VehicleUpdateRequest {
  licensePlate?: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  vin?: string;
  status?: VehicleStatus;
  notes?: string;
  ownerId?: string;
}

// 차량 생성 요청 타입
export interface VehicleCreateRequest {
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  vin: string;
  status: VehicleStatus;
  notes?: string;
  ownerId?: string;
}

// 차량 필터 타입
export interface VehicleFilter {
  status?: VehicleStatus | 'all';
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}
