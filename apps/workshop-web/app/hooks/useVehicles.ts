import { useState, useCallback } from 'react';
import { useToast } from '@cargoro/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '@/app/services/api';

// Vehicle 타입 정의 (vehicle-list에서 임포트하는 대신 직접 정의)
export interface Vehicle {
  id: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  vin: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastServiceDate: string;
  owner: {
    id: string;
    name: string;
    contact: string;
  };
}

/**
 * 차량 관리 커스텀 훅
 *
 * 차량 목록 조회, 추가, 수정, 삭제 기능을 제공합니다.
 */
export function useVehicles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // 차량 목록 조회
  const {
    data: vehicles = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await vehicleApi.get('/vehicles');
      return response.data;
    },
  });

  // 에러 발생 시 처리
  if (error) {
    const apiError = error as Error;
    toast({
      title: '차량 조회 실패',
      description: apiError.message || '차량 목록을 불러오는 중 오류가 발생했습니다.',
      variant: 'destructive',
    });
  }

  // 차량 추가 mutation
  const { mutate: addVehicle, isPending: isAddingPending } = useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, 'id'>) => {
      const response = await vehicleApi.post('/vehicles', newVehicle);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: '차량 추가 완료',
        description: '차량이 성공적으로 추가되었습니다.',
      });
      setIsAddingVehicle(false);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: err => {
      const apiError = err as Error;
      toast({
        title: '차량 추가 실패',
        description: apiError.message || '차량 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 차량 수정 mutation
  const { mutate: updateVehicle, isPending: isUpdatingPending } = useMutation({
    mutationFn: async (updatedVehicle: Vehicle) => {
      const response = await vehicleApi.put(`/vehicles/${updatedVehicle.id}`, updatedVehicle);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: '차량 정보 업데이트 완료',
        description: '차량 정보가 성공적으로 수정되었습니다.',
      });
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: err => {
      const apiError = err as Error;
      toast({
        title: '차량 정보 업데이트 실패',
        description: apiError.message || '차량 정보 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 차량 삭제 mutation
  const { mutate: deleteVehicle, isPending: isDeletingPending } = useMutation({
    mutationFn: async (vehicleId: string) => {
      const response = await vehicleApi.delete(`/vehicles/${vehicleId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: '차량 삭제 완료',
        description: '차량이 성공적으로 삭제되었습니다.',
      });
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: err => {
      const apiError = err as Error;
      toast({
        title: '차량 삭제 실패',
        description: apiError.message || '차량 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 차량 선택 핸들러
  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  // 차량 추가 모드 핸들러
  const handleAddVehicleMode = useCallback(() => {
    setIsAddingVehicle(true);
    setSelectedVehicle(null);
  }, []);

  // 편집 취소 핸들러
  const handleCancel = useCallback(() => {
    setIsAddingVehicle(false);
    setSelectedVehicle(null);
  }, []);

  return {
    vehicles,
    isLoading,
    isError,
    error,
    selectedVehicle,
    isAddingVehicle,
    isPending: isAddingPending || isUpdatingPending || isDeletingPending,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    handleSelectVehicle,
    handleAddVehicleMode,
    handleCancel,
  };
}
