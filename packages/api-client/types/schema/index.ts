/**
 * 임시 타입 정의 파일
 *
 * 실제 프로젝트에서는 packages/types/schema에서
 * 이러한 타입들을 가져와서 사용해야 합니다.
 */
import { PaginationParams } from './api';

// 차량 관련 타입 정의
export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color?: string;
  status: string;
  mileage: number;
  engineType?: string;
  transmission?: string;
  fuelType?: string;
  ownerId?: string;
  organizationId?: string;
  registrationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color?: string;
  status?: string;
  mileage?: number;
  engineType?: string;
  transmission?: string;
  fuelType?: string;
  ownerId?: string;
  organizationId?: string;
  registrationDate?: string;
}

export interface UpdateVehicleDto {
  licensePlate?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  color?: string;
  status?: string;
  mileage?: number;
  engineType?: string;
  transmission?: string;
  fuelType?: string;
  ownerId?: string;
  organizationId?: string;
  registrationDate?: string;
}

// 차량 위치 관련 타입 정의
export interface VehicleLocation {
  id: string;
  vehicleId: string;
  licensePlate?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  status?: string;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleLocationDto {
  vehicleId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  status?: string;
  timestamp?: number;
}

export interface UpdateVehicleLocationDto {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  status?: string;
  timestamp?: number;
}

// 계약 관련 타입 정의
export interface Contract {
  id: string;
  organizationId: string;
  vehicleId: string;
  contractType: string;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  deposit: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDto {
  organizationId: string;
  vehicleId: string;
  contractType: string;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  deposit: number;
  status?: string;
}

export interface UpdateContractDto {
  organizationId?: string;
  vehicleId?: string;
  contractType?: string;
  startDate?: string;
  endDate?: string;
  monthlyPayment?: number;
  deposit?: number;
  status?: string;
}

// 계약 결제 관련 타입 정의
export interface ContractPayment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractPaymentDto {
  amount: number;
  paymentDate: string;
  paymentType: string;
  status?: string;
  description?: string;
}

export interface UpdateContractPaymentDto {
  amount?: number;
  paymentDate?: string;
  paymentType?: string;
  status?: string;
  description?: string;
}

// Re-export PaginationParams
export type { PaginationParams };
