/**
 * 정비 API 통신용 훅
 * Zod와 React Query를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  repairApi,
  RepairStatus,
  RepairType,
  Repair,
  RepairCreate,
  RepairUpdate,
} from '@cargoro/api-client/lib/repair-api';

// 백엔드 스네이크 케이스를 프론트엔드 카멜 케이스로 변환하는 유틸리티 함수
const transformRepair = (repair: Repair) => {
  return {
    id: repair.id,
    vehicleId: repair.vehicle_id,
    repairType: repair.repair_type,
    description: repair.description,
    estimatedHours: repair.estimated_hours,
    technicianId: repair.technician_id,
    reservationId: repair.reservation_id,
    startTime: repair.start_time,
    completionTime: repair.completion_time,
    status: repair.status,
    partsRequired: repair.parts_required,
    createdAt: repair.created_at,
    updatedAt: repair.updated_at,
    notes: repair.notes,
  };
};

/**
 * 정비 작업 목록 조회 훅
 */
export function useRepairJobs(filter = {}) {
  return useQuery({
    queryKey: ['repairs', filter],
    queryFn: async () => {
      const response = await repairApi.getAllRepairs(filter);
      return {
        repairs: response.data.map(transformRepair),
        page: response.page,
        perPage: response.per_page,
        totalItems: response.total_items,
        totalPages: response.total_pages,
      };
    },
  });
}

/**
 * 특정 정비 작업 조회 훅
 */
export function useRepairJob(id: string | undefined) {
  return useQuery({
    queryKey: ['repair', id],
    queryFn: async () => {
      if (!id) throw new Error('정비 작업 ID가 필요합니다.');
      const response = await repairApi.getRepairById(id);
      return transformRepair(response.data);
    },
    enabled: !!id,
  });
}

/**
 * 정비 작업 상태 업데이트 훅
 */
export function useUpdateRepairStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repairId,
      status,
      notes,
    }: {
      repairId: string;
      status: RepairStatus;
      notes?: string;
    }) => {
      const response = await repairApi.updateRepairStatus(repairId, { status, notes });
      return transformRepair(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
    },
  });
}

/**
 * 정비 작업 생성 훅
 */
export function useCreateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repairData: RepairCreate) => {
      const response = await repairApi.createRepair(repairData);
      return transformRepair(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
    },
  });
}

/**
 * 정비 작업 업데이트 훅
 */
export function useUpdateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repairId,
      updateData,
    }: {
      repairId: string;
      updateData: RepairUpdate;
    }) => {
      const response = await repairApi.updateRepair(repairId, updateData);
      return transformRepair(response.data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['repair', data.id] });
    },
  });
}

/**
 * 정비 작업 삭제 훅
 */
export function useDeleteRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repairId: string) => {
      await repairApi.deleteRepair(repairId);
      return { id: repairId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
    },
  });
}

// 타입 export
export type { RepairStatus, RepairType, Repair };
