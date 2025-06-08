import { PaginationParams } from '@cargoro/types/schema/api';
import {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleLocation,
  CreateVehicleLocationDto,
  UpdateVehicleLocationDto,
} from '@cargoro/types/schema/vehicle';

import { ApiClient } from './api-client';

// 필터 타입 정의
export type VehicleFilters = PaginationParams & {
  status?: string;
  organizationId?: string;
  [key: string]: unknown;
};

export type LocationFilters = {
  status?: string;
  organizationId?: string;
  [key: string]: unknown;
};

export type LocationHistoryFilters = PaginationParams & {
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
};

export class VehicleApi extends ApiClient {
  private readonly vehiclesEndpoint = '/api/fleet-api/vehicles';
  private readonly locationsEndpoint = '/api/fleet-api/locations';

  // 모든 차량 조회
  async getVehicles(params?: VehicleFilters): Promise<Vehicle[]> {
    return this.get<Vehicle[]>(this.vehiclesEndpoint, { params });
  }

  // 특정 차량 조회
  async getVehicleById(id: string): Promise<Vehicle> {
    return this.get<Vehicle>(`${this.vehiclesEndpoint}/${id}`);
  }

  // 차량 생성
  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    return this.post<Vehicle>(this.vehiclesEndpoint, data);
  }

  // 차량 업데이트
  async updateVehicle(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    return this.patch<Vehicle>(`${this.vehiclesEndpoint}/${id}`, data);
  }

  // 차량 삭제
  async deleteVehicle(id: string): Promise<void> {
    return this.delete<void>(`${this.vehiclesEndpoint}/${id}`);
  }

  // 모든 차량 위치 조회
  async getAllLocations(params?: LocationFilters): Promise<VehicleLocation[]> {
    return this.get<VehicleLocation[]>(this.locationsEndpoint, { params });
  }

  // 특정 차량 위치 조회
  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation> {
    return this.get<VehicleLocation>(`${this.locationsEndpoint}/vehicle/${vehicleId}`);
  }

  // 여러 차량 위치 조회
  async getVehicleLocations(vehicleIds: string[]): Promise<VehicleLocation[]> {
    const params = new URLSearchParams();
    vehicleIds.forEach(id => params.append('vehicle_id', id));

    return this.get<VehicleLocation[]>(`${this.locationsEndpoint}?${params.toString()}`);
  }

  // 차량 위치 생성
  async createLocation(data: CreateVehicleLocationDto): Promise<VehicleLocation> {
    return this.post<VehicleLocation>(this.locationsEndpoint, data);
  }

  // 차량 위치 업데이트
  async updateLocation(id: string, data: UpdateVehicleLocationDto): Promise<VehicleLocation> {
    return this.patch<VehicleLocation>(`${this.locationsEndpoint}/${id}`, data);
  }

  // 차량 위치 이력 조회
  async getLocationHistory(
    vehicleId: string,
    params?: LocationHistoryFilters
  ): Promise<VehicleLocation[]> {
    return this.get<VehicleLocation[]>(`${this.locationsEndpoint}/history/${vehicleId}`, {
      params,
    });
  }
}
