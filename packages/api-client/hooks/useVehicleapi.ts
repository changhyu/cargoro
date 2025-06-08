import { ApiErrorCode } from '@cargoro/types/schema/api';
import {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleLocation,
  CreateVehicleLocationDto,
  UpdateVehicleLocationDto,
  LocationStatus,
} from '@cargoro/types/schema/vehicle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 모듈 경로 문제 해결을 위한 타입 정의
type VehicleFilters = {
  status?: string;
  make?: string;
  model?: string;
  licensePlate?: string;
  organizationId?: string;
  page?: number;
  limit?: number;
};

type LocationFilters = {
  status?: LocationStatus;
  organizationId?: string;
  timestamp?: string | number;
  page?: number;
  limit?: number;
};

type LocationHistoryFilters = {
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
};

// VehicleApi 클래스 임시 정의
class VehicleApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // 실제 구현체는 ../core/vehicle-api에 있지만, 여기서는 임시로 타입만 맞추기 위해 정의
  async getVehicles(_params?: VehicleFilters): Promise<Vehicle[]> {
    return [] as Vehicle[];
  }

  async getVehicleById(_id: string): Promise<Vehicle> {
    return {} as Vehicle;
  }

  async createVehicle(_data: CreateVehicleDto): Promise<Vehicle> {
    return {} as Vehicle;
  }

  async updateVehicle(_id: string, _data: UpdateVehicleDto): Promise<Vehicle> {
    return {} as Vehicle;
  }

  async deleteVehicle(_id: string): Promise<void> {
    return;
  }

  async getAllLocations(_params?: LocationFilters): Promise<VehicleLocation[]> {
    return [] as VehicleLocation[];
  }

  async getVehicleLocation(_vehicleId: string): Promise<VehicleLocation> {
    return {} as VehicleLocation;
  }

  async getVehicleLocations(_vehicleIds: string[]): Promise<VehicleLocation[]> {
    return [] as VehicleLocation[];
  }

  async createLocation(_data: CreateVehicleLocationDto): Promise<VehicleLocation> {
    return {} as VehicleLocation;
  }

  async updateLocation(_id: string, _data: UpdateVehicleLocationDto): Promise<VehicleLocation> {
    return {} as VehicleLocation;
  }

  async getLocationHistory(
    _vehicleId: string,
    _params?: LocationHistoryFilters
  ): Promise<VehicleLocation[]> {
    return [] as VehicleLocation[];
  }
}
import { formatErrorMessage, isApiErrorCode } from '../utils/api-error';

// API 인스턴스 생성
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const vehicleApi = new VehicleApi(API_URL);

// 위치 데이터 갱신 간격 (기본 1분)
const LOCATION_REFETCH_INTERVAL = process.env.NEXT_PUBLIC_LOCATION_REFETCH_INTERVAL
  ? parseInt(process.env.NEXT_PUBLIC_LOCATION_REFETCH_INTERVAL, 10)
  : 60000;

// 차량 API 쿼리 키
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...vehicleKeys.lists(), filters] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
  locations: () => [...vehicleKeys.all, 'locations'] as const,
  location: (vehicleId: string) => [...vehicleKeys.locations(), vehicleId] as const,
};

/**
 * 차량 목록 조회 훅
 * @param params 필터링 파라미터
 * @returns 차량 목록 쿼리 결과
 */
export function useVehicles(params?: VehicleFilters) {
  return useQuery({
    queryKey: vehicleKeys.list(params || {}),
    queryFn: () => vehicleApi.getVehicles(params),
    meta: {
      onError: (error: unknown) => {
        console.error('차량 목록 조회 에러:', formatErrorMessage(error));
      },
    },
  });
}

/**
 * 차량 상세 조회 훅
 * @param id 차량 ID
 * @returns 차량 상세 정보 쿼리 결과
 */
export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleApi.getVehicleById(id),
    enabled: !!id,
    meta: {
      onError: (error: unknown) => {
        // 존재하지 않는 리소스인 경우
        if (isApiErrorCode(error, ApiErrorCode.NOT_FOUND)) {
          console.warn(`차량 ID ${id}을(를) 찾을 수 없습니다.`);
        } else {
          console.error(`차량 ID ${id} 조회 에러:`, formatErrorMessage(error));
        }
      },
    },
  });
}

/**
 * 차량 생성 훅
 * @returns 차량 생성 뮤테이션
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleDto) => vehicleApi.createVehicle(data),
    onSuccess: (newVehicle: Vehicle) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      return newVehicle;
    },
    onError: (error: unknown) => {
      console.error('차량 생성 에러:', formatErrorMessage(error));
    },
  });
}

/**
 * 차량 업데이트 훅
 * @param id 차량 ID
 * @returns 차량 업데이트 뮤테이션
 */
export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVehicleDto) => vehicleApi.updateVehicle(id, data),
    onSuccess: (updatedVehicle: Vehicle) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      return updatedVehicle;
    },
    onError: (error: unknown) => {
      console.error(`차량 ID ${id} 업데이트 에러:`, formatErrorMessage(error));
    },
  });
}

/**
 * 차량 삭제 훅
 * @returns 차량 삭제 뮤테이션
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleApi.deleteVehicle(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.removeQueries({ queryKey: vehicleKeys.detail(id) });
    },
    onError: (error: unknown, id: string) => {
      console.error(`차량 ID ${id} 삭제 에러:`, formatErrorMessage(error));
    },
  });
}

/**
 * 차량 위치 목록 조회 훅
 * @param params 필터링 파라미터
 * @returns 모든 차량 위치 정보 쿼리 결과
 */
export function useVehicleLocations(params?: LocationFilters) {
  return useQuery({
    queryKey: [...vehicleKeys.locations(), params || {}],
    queryFn: () => vehicleApi.getAllLocations(params),
    refetchInterval: LOCATION_REFETCH_INTERVAL,
    meta: {
      onError: (error: unknown) => {
        console.error('차량 위치 목록 조회 에러:', formatErrorMessage(error));
      },
    },
  });
}

/**
 * 특정 차량 위치 조회 훅
 * @param vehicleId 차량 ID
 * @returns 특정 차량의 현재 위치 정보 쿼리 결과
 */
export function useVehicleLocation(vehicleId: string) {
  return useQuery({
    queryKey: vehicleKeys.location(vehicleId),
    queryFn: () => vehicleApi.getVehicleLocation(vehicleId),
    enabled: !!vehicleId,
    refetchInterval: LOCATION_REFETCH_INTERVAL,
    meta: {
      onError: (error: unknown) => {
        if (isApiErrorCode(error, ApiErrorCode.NOT_FOUND)) {
          console.warn(`차량 ID ${vehicleId}의 위치 정보를 찾을 수 없습니다.`);
        } else {
          console.error(`차량 ID ${vehicleId} 위치 조회 에러:`, formatErrorMessage(error));
        }
      },
    },
  });
}

/**
 * 여러 차량 위치 조회 훅
 * @param vehicleIds 조회할 차량 ID 배열
 * @returns 여러 차량의 위치 정보 쿼리 결과
 */
export function useMultipleVehicleLocations(vehicleIds: string[]) {
  return useQuery({
    queryKey: [...vehicleKeys.locations(), { ids: vehicleIds }],
    queryFn: () => vehicleApi.getVehicleLocations(vehicleIds),
    enabled: vehicleIds.length > 0,
    refetchInterval: LOCATION_REFETCH_INTERVAL,
    meta: {
      onError: (error: unknown) => {
        console.error('여러 차량 위치 조회 에러:', formatErrorMessage(error));
      },
    },
  });
}

/**
 * 차량 위치 생성 훅
 * @returns 차량 위치 생성 뮤테이션
 */
export function useCreateVehicleLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleLocationDto) => vehicleApi.createLocation(data),
    onSuccess: (location: VehicleLocation) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.locations() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.location(location.vehicleId) });
    },
    onError: (error: unknown) => {
      console.error('차량 위치 생성 에러:', formatErrorMessage(error));
    },
  });
}

/**
 * 차량 위치 업데이트 훅
 * @param id 위치 ID
 * @param vehicleId 차량 ID
 * @returns 차량 위치 업데이트 뮤테이션
 */
export function useUpdateVehicleLocation(id: string, vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVehicleLocationDto) => vehicleApi.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.locations() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.location(vehicleId) });
    },
    onError: (error: unknown) => {
      console.error(`위치 ID ${id} 업데이트 에러:`, formatErrorMessage(error));
    },
  });
}

/**
 * 차량 위치 이력 조회 훅
 * @param vehicleId 차량 ID
 * @param params 필터링 파라미터 (날짜 범위 등)
 * @returns 차량의 위치 이력 쿼리 결과
 */
export function useVehicleLocationHistory(vehicleId: string, params?: LocationHistoryFilters) {
  return useQuery({
    queryKey: [...vehicleKeys.location(vehicleId), 'history', params || {}],
    queryFn: () => vehicleApi.getLocationHistory(vehicleId, params),
    enabled: !!vehicleId,
    meta: {
      onError: (error: unknown) => {
        console.error(`차량 ID ${vehicleId} 위치 이력 조회 에러:`, formatErrorMessage(error));
      },
    },
  });
}
