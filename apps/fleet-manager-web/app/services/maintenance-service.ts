import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@cargoro/api-client';

// 정비 상태 열거형 (타입 패키지로 이동 예정)
export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 정비 유형 열거형 (타입 패키지로 이동 예정)
export enum MaintenanceType {
  REGULAR = 'regular',
  REPAIR = 'repair',
  EMERGENCY = 'emergency',
}

// 정비 부품 인터페이스 (타입 패키지로 이동 예정)
export interface MaintenancePart {
  id: string;
  maintenanceId: string;
  name: string;
  quantity: number;
  cost: number;
  partNumber?: string;
}

// 정비 기록 인터페이스 (타입 패키지로 이동 예정)
export interface Maintenance {
  id: string;
  vehicleId: string;
  vehicleName: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  workshopId?: string;
  workshopName?: string;
  scheduledDate: string;
  completedDate?: string;
  description: string;
  cost?: number;
  technician?: string;
  odometer?: number;
  nextMaintenanceDate?: string;
  notes?: string;
  parts?: MaintenancePart[];
  createdAt?: string;
  updatedAt?: string;
}

// 정비 목록 응답 인터페이스
export interface MaintenanceListResponse {
  items: Maintenance[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 정비 필터 인터페이스
export interface MaintenanceFilters {
  vehicleId?: string;
  maintenanceType?: MaintenanceType;
  status?: MaintenanceStatus;
  startDateFrom?: string;
  startDateTo?: string;
  workshopId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

// 새 정비 생성 시 필요한 데이터 인터페이스
export interface CreateMaintenanceDto {
  vehicleId: string;
  vehicleName: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  workshopId?: string;
  workshopName?: string;
  scheduledDate: string;
  description: string;
  cost?: number;
  technician?: string;
  odometer?: number;
  nextMaintenanceDate?: string;
  notes?: string;
  parts?: Omit<MaintenancePart, 'id' | 'maintenanceId'>[];
  [key: string]: unknown; // 인덱스 시그니처 추가
}

// 정비 상태 변경 시 필요한 데이터 인터페이스
export interface UpdateMaintenanceStatusDto {
  status: MaintenanceStatus;
  completedDate?: string;
  notes?: string;
  cost?: number;
  [key: string]: unknown; // 인덱스 시그니처 추가
}

// API 경로 상수
const API_ENDPOINTS = {
  MAINTENANCES: '/api/maintenances',
  MAINTENANCE: (id: string) => `/api/maintenances/${id}`,
  MAINTENANCE_STATUS: (id: string) => `/api/maintenances/${id}/status`,
  VEHICLE_MAINTENANCES: (vehicleId: string) => `/api/vehicles/${vehicleId}/maintenances`,
};

// API 클라이언트 인스턴스 생성
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

// 정비 서비스 클래스
export class MaintenanceService {
  // 정비 목록 조회 (필터링 지원)
  static async getMaintenances(filters: MaintenanceFilters = {}): Promise<MaintenanceListResponse> {
    const queryParams = new URLSearchParams();

    // 필터 파라미터 추가
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.MAINTENANCES}?${queryString}`
      : API_ENDPOINTS.MAINTENANCES;

    const response = await apiClient.get<MaintenanceListResponse>(url);
    return response || { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  // 특정 정비 상세 조회
  static async getMaintenance(id: string): Promise<Maintenance> {
    const response = await apiClient.get<Maintenance>(API_ENDPOINTS.MAINTENANCE(id));
    return response;
  }

  // 차량별 정비 기록 조회
  static async getVehicleMaintenances(
    vehicleId: string,
    filters: Partial<MaintenanceFilters> = {}
  ): Promise<MaintenanceListResponse> {
    const queryParams = new URLSearchParams();

    // 필터 파라미터 추가
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.VEHICLE_MAINTENANCES(vehicleId)}?${queryString}`
      : API_ENDPOINTS.VEHICLE_MAINTENANCES(vehicleId);

    const response = await apiClient.get<MaintenanceListResponse>(url);
    return response || { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  // 새 정비 기록 생성
  static async createMaintenance(data: CreateMaintenanceDto): Promise<Maintenance> {
    const response = await apiClient.post<Maintenance>(API_ENDPOINTS.MAINTENANCES, data);
    return response;
  }

  // 정비 기록 수정
  static async updateMaintenance(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
    const response = await apiClient.put<Maintenance>(API_ENDPOINTS.MAINTENANCE(id), data);
    return response;
  }

  // 정비 상태 변경
  static async updateMaintenanceStatus(
    id: string,
    data: UpdateMaintenanceStatusDto
  ): Promise<Maintenance> {
    const response = await apiClient.patch<Maintenance>(API_ENDPOINTS.MAINTENANCE_STATUS(id), data);
    return response;
  }

  // 정비 기록 삭제
  static async deleteMaintenance(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.MAINTENANCE(id));
  }
}

// React Query Hooks
export const useMaintenancesQuery = (filters: MaintenanceFilters = {}) => {
  return useQuery({
    queryKey: ['maintenances', filters],
    queryFn: () => MaintenanceService.getMaintenances(filters),
  });
};

export const useMaintenanceQuery = (id: string) => {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => MaintenanceService.getMaintenance(id),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
};

export const useVehicleMaintenancesQuery = (
  vehicleId: string,
  filters: Partial<MaintenanceFilters> = {}
) => {
  return useQuery({
    queryKey: ['vehicle-maintenances', vehicleId, filters],
    queryFn: () => MaintenanceService.getVehicleMaintenances(vehicleId, filters),
    enabled: !!vehicleId, // vehicleId가 있을 때만 쿼리 실행
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaintenanceDto) => MaintenanceService.createMaintenance(data),
    onSuccess: data => {
      // 성공 시 정비 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      // 해당 차량의 정비 목록도 무효화
      queryClient.invalidateQueries({ queryKey: ['vehicle-maintenances', data.vehicleId] });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Maintenance> }) =>
      MaintenanceService.updateMaintenance(id, data),
    onSuccess: data => {
      // 성공 시 관련 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-maintenances', data.vehicleId] });
    },
  });
};

export const useUpdateMaintenanceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceStatusDto }) =>
      MaintenanceService.updateMaintenanceStatus(id, data),
    onSuccess: data => {
      // 성공 시 관련 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-maintenances', data.vehicleId] });
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => MaintenanceService.deleteMaintenance(id),
    onSuccess: (_, id) => {
      // 성공 시 정비 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      // 개별 정비 데이터 삭제
      queryClient.removeQueries({ queryKey: ['maintenance', id] });
    },
  });
};
