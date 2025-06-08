/**
 * 차량 관리 API
 */
import type {
  Vehicle,
  VehicleCategory,
  VehicleStatusType,
  FuelTypeType,
  TransmissionTypeType,
} from '@/app/types/rental.types';

import { apiClient, handleApiError } from './client';

export interface VehicleCreateDto {
  registration_number: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  status?: VehicleStatusType;
  mileage: number;
  fuel_type: FuelTypeType;
  transmission: TransmissionTypeType;
  category: VehicleCategory;
  features: string[];
  images: string[];
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  last_maintenance_date: string;
  next_maintenance_date: string;
}

export interface VehicleListResponse {
  items: Vehicle[];
  total: number;
  page: number;
  page_size: number;
}

export interface VehicleStatistics {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  reserved_vehicles: number;
  average_mileage: number;
  total_value: number;
}

class VehicleAPI {
  /**
   * 차량 목록 조회
   */
  async getVehicles(params?: {
    page?: number;
    page_size?: number;
    status?: VehicleStatusType;
    category?: VehicleCategory;
    search?: string;
  }): Promise<VehicleListResponse> {
    try {
      const response = await apiClient.get('/vehicles', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 차량 상세 조회
   */
  async getVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 이용 가능한 차량 조회
   */
  async getAvailableVehicles(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get('/vehicles/available');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 차량 통계 조회
   */
  async getVehicleStatistics(): Promise<VehicleStatistics> {
    try {
      const response = await apiClient.get('/vehicles/statistics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 차량 등록
   */
  async createVehicle(vehicleData: VehicleCreateDto): Promise<Vehicle> {
    try {
      const response = await apiClient.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 차량 정보 수정
   */
  async updateVehicle(vehicleId: string, updates: Partial<VehicleCreateDto>): Promise<Vehicle> {
    try {
      const response = await apiClient.put(`/vehicles/${vehicleId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 차량 상태 업데이트
   */
  async updateVehicleStatus(vehicleId: string, status: VehicleStatusType): Promise<Vehicle> {
    try {
      const response = await apiClient.patch(`/vehicles/${vehicleId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 차량 주행거리 업데이트
   */
  async updateVehicleMileage(vehicleId: string, mileage: number): Promise<Vehicle> {
    try {
      const response = await apiClient.patch(`/vehicles/${vehicleId}/mileage`, { mileage });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 차량 삭제
   */
  async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      await apiClient.delete(`/vehicles/${vehicleId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const vehicleAPI = new VehicleAPI();
