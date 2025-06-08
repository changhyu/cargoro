import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { vehicleApi, queryKeys } from '@/app/lib/api/rental';
import type { Vehicle } from '@/app/types/rental.types';

// 차량 목록 조회
export const useVehicles = (params?: {
  page?: number;
  page_size?: number;
  status?: string;
  category?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.vehicles.list(params),
    queryFn: () => vehicleApi.getVehicles(params),
  });
};

// 차량 상세 조회
export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id),
    queryFn: () => vehicleApi.getVehicle(id),
    enabled: !!id,
  });
};

// 이용 가능한 차량 조회
export const useAvailableVehicles = () => {
  return useQuery({
    queryKey: queryKeys.vehicles.available(),
    queryFn: vehicleApi.getAvailableVehicles,
  });
};

// 차량 통계
export const useVehicleStatistics = () => {
  return useQuery({
    queryKey: queryKeys.vehicles.statistics(),
    queryFn: vehicleApi.getVehicleStatistics,
  });
};

// 차량 생성
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleApi.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
};

// 차량 업데이트
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      vehicleApi.updateVehicle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.lists() });
    },
  });
};

// 차량 상태 업데이트
export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      vehicleApi.updateVehicleStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.available() });
    },
  });
};

// 차량 주행거리 업데이트
export const useUpdateVehicleMileage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, mileage }: { id: string; mileage: number }) =>
      vehicleApi.updateVehicleMileage(id, mileage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.lists() });
    },
  });
};

// 차량 삭제
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleApi.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
};
