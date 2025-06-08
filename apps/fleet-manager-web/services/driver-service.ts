import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 운전자 관련 타입 정의
export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: DriverStatus;
  hireDate: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export interface CreateDriverDto {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  hireDate: string;
  emergencyContact?: string;
}

export interface UpdateDriverDto {
  name?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status?: DriverStatus;
  emergencyContact?: string;
}

export interface DriverQueryParams {
  status?: DriverStatus;
  search?: string;
}

// 운전자 API 서비스
class DriverService {
  private baseUrl = '/api/drivers';

  async getDrivers(params?: DriverQueryParams): Promise<Driver[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    if (!response.ok) {
      throw new Error('운전자 목록을 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async getDriver(id: string): Promise<Driver> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('운전자 정보를 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async createDriver(data: CreateDriverDto): Promise<Driver> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('운전자 등록에 실패했습니다.');
    }
    return response.json();
  }

  async updateDriver(id: string, data: UpdateDriverDto): Promise<Driver> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('운전자 정보 업데이트에 실패했습니다.');
    }
    return response.json();
  }

  async deleteDriver(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('운전자 삭제에 실패했습니다.');
    }
  }
}

export const driverService = new DriverService();

// React Query 훅들
export function useDrivers(params?: DriverQueryParams) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driverService.getDrivers(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useDriversQuery(params?: DriverQueryParams) {
  return useDrivers(params);
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => driverService.getDriver(id),
    enabled: !!id,
  });
}

export function useDriverQuery(id: string) {
  return useDriver(id);
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverDto) => driverService.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDriverDto }) =>
      driverService.updateDriver(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver', id] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driverService.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

// 운전자 상태별 색상 헬퍼
export function getDriverStatusColor(status: DriverStatus): string {
  switch (status) {
    case DriverStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case DriverStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case DriverStatus.SUSPENDED:
      return 'bg-yellow-100 text-yellow-800';
    case DriverStatus.TERMINATED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 운전자 상태별 라벨
export function getDriverStatusLabel(status: DriverStatus): string {
  switch (status) {
    case DriverStatus.ACTIVE:
      return '활성';
    case DriverStatus.INACTIVE:
      return '비활성';
    case DriverStatus.SUSPENDED:
      return '정지';
    case DriverStatus.TERMINATED:
      return '해고';
    default:
      return '알 수 없음';
  }
}
