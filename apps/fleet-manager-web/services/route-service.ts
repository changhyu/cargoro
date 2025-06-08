import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 경로 관련 타입 정의
export interface Route {
  id: string;
  name: string;
  description?: string;
  startLocation: string;
  endLocation: string;
  waypoints: Waypoint[];
  estimatedDuration: number; // 분 단위
  estimatedDistance: number; // km 단위
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  order: number;
  estimatedArrival?: string;
}

export enum RouteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export interface CreateRouteDto {
  name: string;
  description?: string;
  startLocation: string;
  endLocation: string;
  waypoints: Omit<Waypoint, 'id'>[];
}

export interface UpdateRouteDto {
  name?: string;
  description?: string;
  startLocation?: string;
  endLocation?: string;
  waypoints?: Omit<Waypoint, 'id'>[];
  status?: RouteStatus;
}

export interface RouteQueryParams {
  status?: RouteStatus;
  search?: string;
}

// 경로 API 서비스
class RouteService {
  private baseUrl = '/api/routes';

  async getRoutes(params?: RouteQueryParams): Promise<Route[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    if (!response.ok) {
      throw new Error('경로 목록을 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async getRoute(id: string): Promise<Route> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('경로 정보를 가져오는데 실패했습니다.');
    }
    return response.json();
  }

  async createRoute(data: CreateRouteDto): Promise<Route> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('경로 생성에 실패했습니다.');
    }
    return response.json();
  }

  async updateRoute(id: string, data: UpdateRouteDto): Promise<Route> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('경로 업데이트에 실패했습니다.');
    }
    return response.json();
  }

  async deleteRoute(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('경로 삭제에 실패했습니다.');
    }
  }
}

export const routeService = new RouteService();

// React Query 훅들
export function useRoutes(params?: RouteQueryParams) {
  return useQuery({
    queryKey: ['routes', params],
    queryFn: () => routeService.getRoutes(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useRoutesQuery(params?: RouteQueryParams) {
  return useRoutes(params);
}

export function useRoute(id: string) {
  return useQuery({
    queryKey: ['route', id],
    queryFn: () => routeService.getRoute(id),
    enabled: !!id,
  });
}

export function useRouteQuery(id: string) {
  return useRoute(id);
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRouteDto) => routeService.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRouteDto }) =>
      routeService.updateRoute(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', id] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routeService.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

// 경로 상태별 색상 헬퍼
export function getRouteStatusColor(status: RouteStatus): string {
  switch (status) {
    case RouteStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case RouteStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case RouteStatus.ARCHIVED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 경로 상태별 라벨
export function getRouteStatusLabel(status: RouteStatus): string {
  switch (status) {
    case RouteStatus.ACTIVE:
      return '활성';
    case RouteStatus.INACTIVE:
      return '비활성';
    case RouteStatus.ARCHIVED:
      return '보관됨';
    default:
      return '알 수 없음';
  }
}
