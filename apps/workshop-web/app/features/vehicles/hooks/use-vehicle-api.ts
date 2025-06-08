import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { VehicleUpdateRequest, VehicleListResponse, VehicleDetailResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * 차량 목록 조회 훅
 */
export const useGetVehicles = (filters?: {
  status?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery<VehicleListResponse>({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (filters?.searchTerm) {
        params.append('search', filters.searchTerm);
      }

      if (filters?.page) {
        params.append('page', filters.page.toString());
      }

      if (filters?.pageSize) {
        params.append('pageSize', filters.pageSize.toString());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const { data } = await axios.get(`${API_URL}/vehicles${queryString}`);
      return data;
    },
  });
};

/**
 * 특정 차량 조회 훅
 */
export const useGetVehicleById = (id: string) => {
  return useQuery<VehicleDetailResponse>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/vehicles/${id}`);
      return data;
    },
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
};

/**
 * 차량 업데이트 훅
 */
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VehicleUpdateRequest }) => {
      const response = await axios.put(`${API_URL}/vehicles/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

interface CreateVehicleData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  owner?: string;
  type?: string;
  status?: string;
  mileage?: number;
  [key: string]: unknown;
}

/**
 * 새 차량 등록 훅
 */
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVehicleData) => {
      const response = await axios.post(`${API_URL}/vehicles`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // 차량 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

/**
 * 차량 삭제 훅
 */
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API_URL}/vehicles/${id}`);
      return response.data;
    },
    onSuccess: (_, id) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
