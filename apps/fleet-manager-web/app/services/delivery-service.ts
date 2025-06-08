import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@cargoro/api-client';

// 배송 상태 열거형 (타입 패키지로 이동 예정)
export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 우선순위 열거형 (타입 패키지로 이동 예정)
export enum DeliveryPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// 위치 인터페이스 (타입 패키지로 이동 예정)
export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

// 배송 인터페이스 (타입 패키지로 이동 예정)
export interface Delivery {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  contactNumber: string;
  driverId?: string;
  driverName?: string;
  status: DeliveryStatus;
  pickupLocation: Location;
  deliveryLocation: Location;
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  priority: DeliveryPriority;
  distance?: number;
  estimatedDuration?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 배송 목록 응답 인터페이스
export interface DeliveryListResponse {
  items: Delivery[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 배송 필터 인터페이스
export interface DeliveryFilters {
  status?: DeliveryStatus;
  priority?: DeliveryPriority;
  driverId?: string;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// 새 배송 생성 시 필요한 데이터 인터페이스
export interface CreateDeliveryDto {
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  contactNumber: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  requestedDate: string;
  scheduledDate?: string;
  notes?: string;
  priority: DeliveryPriority;
  [key: string]: unknown; // 인덱스 시그니처 추가
}

// 배송 상태 변경 시 필요한 데이터 인터페이스
export interface UpdateDeliveryStatusDto {
  status: DeliveryStatus;
  completedDate?: string;
  notes?: string;
  [key: string]: unknown; // 인덱스 시그니처 추가
}

// 기사 배정 시 필요한 데이터 인터페이스
export interface AssignDriverDto {
  driverId: string;
  driverName: string;
  notes?: string;
  [key: string]: unknown; // 인덱스 시그니처 추가
}

// API 경로 상수
const API_ENDPOINTS = {
  DELIVERIES: '/api/deliveries',
  DELIVERY: (id: string) => `/api/deliveries/${id}`,
  DELIVERY_STATUS: (id: string) => `/api/deliveries/${id}/status`,
  ASSIGN_DRIVER: (id: string) => `/api/deliveries/${id}/assign`,
  DRIVER_DELIVERIES: (driverId: string) => `/api/drivers/${driverId}/deliveries`,
};

// API 클라이언트 인스턴스 생성
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

// 배송 서비스 클래스
export class DeliveryService {
  // 배송 목록 조회 (필터링 지원)
  static async getDeliveries(filters: DeliveryFilters = {}): Promise<DeliveryListResponse> {
    const queryParams = new URLSearchParams();

    // 필터 파라미터 추가
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.DELIVERIES}?${queryString}`
      : API_ENDPOINTS.DELIVERIES;

    const response = await apiClient.get<DeliveryListResponse>(url);
    return response || { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  // 특정 배송 상세 조회
  static async getDelivery(id: string): Promise<Delivery> {
    const response = await apiClient.get<Delivery>(API_ENDPOINTS.DELIVERY(id));
    return response;
  }

  // 기사별 배송 목록 조회
  static async getDriverDeliveries(
    driverId: string,
    filters: Partial<DeliveryFilters> = {}
  ): Promise<DeliveryListResponse> {
    const queryParams = new URLSearchParams();

    // 필터 파라미터 추가
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.DRIVER_DELIVERIES(driverId)}?${queryString}`
      : API_ENDPOINTS.DRIVER_DELIVERIES(driverId);

    const response = await apiClient.get<DeliveryListResponse>(url);
    return response || { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  // 새 배송 생성
  static async createDelivery(data: CreateDeliveryDto): Promise<Delivery> {
    const response = await apiClient.post<Delivery>(API_ENDPOINTS.DELIVERIES, data);
    return response;
  }

  // 배송 정보 수정
  static async updateDelivery(id: string, data: Partial<Delivery>): Promise<Delivery> {
    const response = await apiClient.put<Delivery>(API_ENDPOINTS.DELIVERY(id), data);
    return response;
  }

  // 배송 상태 변경
  static async updateDeliveryStatus(id: string, data: UpdateDeliveryStatusDto): Promise<Delivery> {
    const response = await apiClient.patch<Delivery>(API_ENDPOINTS.DELIVERY_STATUS(id), data);
    return response;
  }

  // 기사 배정
  static async assignDriver(id: string, data: AssignDriverDto): Promise<Delivery> {
    const response = await apiClient.patch<Delivery>(API_ENDPOINTS.ASSIGN_DRIVER(id), data);
    return response;
  }

  // 배송 삭제
  static async deleteDelivery(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.DELIVERY(id));
  }
}

// React Query Hooks
export const useDeliveriesQuery = (filters: DeliveryFilters = {}) => {
  return useQuery({
    queryKey: ['deliveries', filters],
    queryFn: () => DeliveryService.getDeliveries(filters),
  });
};

export const useDeliveryQuery = (id: string) => {
  return useQuery({
    queryKey: ['delivery', id],
    queryFn: () => DeliveryService.getDelivery(id),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
};

export const useDriverDeliveriesQuery = (
  driverId: string,
  filters: Partial<DeliveryFilters> = {}
) => {
  return useQuery({
    queryKey: ['driver-deliveries', driverId, filters],
    queryFn: () => DeliveryService.getDriverDeliveries(driverId, filters),
    enabled: !!driverId, // driverId가 있을 때만 쿼리 실행
  });
};

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeliveryDto) => DeliveryService.createDelivery(data),
    onSuccess: () => {
      // 성공 시 배송 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
};

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Delivery> }) =>
      DeliveryService.updateDelivery(id, data),
    onSuccess: data => {
      // 성공 시 관련 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', data.id] });
      if (data.driverId) {
        queryClient.invalidateQueries({ queryKey: ['driver-deliveries', data.driverId] });
      }
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliveryStatusDto }) =>
      DeliveryService.updateDeliveryStatus(id, data),
    onSuccess: data => {
      // 성공 시 관련 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', data.id] });
      if (data.driverId) {
        queryClient.invalidateQueries({ queryKey: ['driver-deliveries', data.driverId] });
      }
    },
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignDriverDto }) =>
      DeliveryService.assignDriver(id, data),
    onSuccess: data => {
      // 성공 시 관련 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', data.id] });
      queryClient.invalidateQueries({ queryKey: ['driver-deliveries', data.driverId] });
    },
  });
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DeliveryService.deleteDelivery(id),
    onSuccess: (_, id) => {
      // 성공 시 배송 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      // 개별 배송 데이터 삭제
      queryClient.removeQueries({ queryKey: ['delivery', id] });
    },
  });
};
