import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 차량 관련 타입 정의
export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  year: number;
  make: string;
  color: string;
  status: VehicleStatus;
  fuelType: string;
  mileage: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

export interface CreateVehicleDto {
  licensePlate: string;
  model: string;
  year: number;
  make: string;
  color: string;
  fuelType: string;
  mileage: number;
}

export interface UpdateVehicleDto {
  licensePlate?: string;
  model?: string;
  year?: number;
  make?: string;
  color?: string;
  fuelType?: string;
  mileage?: number;
  status?: VehicleStatus;
}

export interface VehicleQueryParams {
  status?: VehicleStatus;
  make?: string;
  model?: string;
  search?: string;
}

// 차량 API 서비스
class VehicleService {
  private baseUrl = '/api/vehicles';

  async getVehicles(params?: VehicleQueryParams): Promise<Vehicle[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    if (!response.ok) {
      throw new Error('차량 목록을 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('차량 정보를 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('차량 등록에 실패했습니다.');
    }
    return response.json();
  }

  async updateVehicle(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('차량 정보 업데이트에 실패했습니다.');
    }
    return response.json();
  }

  async deleteVehicle(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('차량 삭제에 실패했습니다.');
    }
  }
}

export const vehicleService = new VehicleService();

// React Query 훅들
export function useVehicles(params?: VehicleQueryParams) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehicleService.getVehicles(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useVehiclesQuery(params?: VehicleQueryParams) {
  return useVehicles(params);
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleService.getVehicle(id),
    enabled: !!id,
  });
}

export function useVehicleQuery(id: string) {
  return useVehicle(id);
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleDto) => vehicleService.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleDto }) =>
      vehicleService.updateVehicle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// 차량 상태별 색상 헬퍼
export function getVehicleStatusColor(status: VehicleStatus): string {
  switch (status) {
    case VehicleStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case VehicleStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case VehicleStatus.MAINTENANCE:
      return 'bg-yellow-100 text-yellow-800';
    case VehicleStatus.RETIRED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 차량 상태별 라벨
export function getVehicleStatusLabel(status: VehicleStatus): string {
  switch (status) {
    case VehicleStatus.ACTIVE:
      return '운행중';
    case VehicleStatus.INACTIVE:
      return '비활성';
    case VehicleStatus.MAINTENANCE:
      return '정비중';
    case VehicleStatus.RETIRED:
      return '폐차';
    default:
      return '알 수 없음';
  }
}
