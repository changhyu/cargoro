/**
 * 차량 배정 관련 타입 정의
 */

// 기본 차량 객체 타입 (이름 변경으로 충돌 방지)
export interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year?: number;
  plateNumber: string;
  type?: string;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

// 차량 배정 타입
export interface VehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt: string;
  unassignedAt?: string;
  assignedBy: string;
  reason?: string;
  isActive: boolean;
  vehicle?: VehicleInfo;
  createdAt: string;
  updatedAt?: string;
}

// 차량 배정 세부 정보 타입
export interface VehicleAssignmentDetail extends VehicleAssignment {
  driver?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

// 드라이버에게 할당된 차량 정보
export interface AssignedVehicle {
  id: string;
  make?: string;
  model?: string;
  plateNumber?: string;
  type?: string;
}

// 드라이버 차량 정보
export interface DriverVehicle {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  type?: string;
  assignedAt: string;
  assignedBy: string;
  status: 'active' | 'maintenance' | 'inactive';
}
