'use client';

import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RepairStatus } from '../types';

// 상태 변경 이력 타입 정의
export interface StatusHistoryItem {
  id: string;
  status: RepairStatus;
  timestamp: string;
  note?: string;
  technicianId?: string;
  technicianName?: string;
}

// API 응답 타입 정의
export interface RepairStatusHistoryResponse {
  statusHistory: StatusHistoryItem[];
}

/**
 * 정비 작업 상태 변경 이력 조회 훅
 */
export const useRepairStatusHistory = (repairId: string) => {
  return useQuery({
    queryKey: ['repairStatusHistory', repairId],
    queryFn: async () => {
      if (!repairId) {
        return { statusHistory: [] };
      }

      const { data } = await axios.get(`/api/repair-management/repairs/${repairId}/status-history`);
      return data;
    },
    enabled: !!repairId,
  });
};

/**
 * 정비 작업 상태 변경 훅
 */
export const useUpdateRepairStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repairId,
      status,
      note,
    }: {
      repairId: string;
      status: RepairStatus;
      note?: string;
    }) => {
      const { data } = await axios.post(`/api/repair-management/repairs/${repairId}/status`, {
        status,
        note,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // 상태 이력 및 작업 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['repairStatusHistory', variables.repairId] });
      queryClient.invalidateQueries({ queryKey: ['repairJob', variables.repairId] });
      queryClient.invalidateQueries({ queryKey: ['repairJobs'] });
    },
  });
};

/**
 * 정비 작업 상태 이력 삭제 훅
 */
export const useDeleteRepairStatusHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ repairId, historyId }: { repairId: string; historyId: string }) => {
      const { data } = await axios.delete(
        `/api/repair-management/repairs/${repairId}/status-history/${historyId}`
      );
      return data;
    },
    onSuccess: (_, variables) => {
      // 상태 이력 갱신
      queryClient.invalidateQueries({ queryKey: ['repairStatusHistory', variables.repairId] });
    },
  });
};

/**
 * 정비 작업 상태 이력 추가 훅
 */
export const useAddRepairStatusHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repairId,
      status,
      note,
    }: {
      repairId: string;
      status: RepairStatus;
      note?: string;
    }) => {
      const { data } = await axios.post(
        `/api/repair-management/repairs/${repairId}/status-history`,
        {
          status,
          note,
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      // 상태 이력 갱신
      queryClient.invalidateQueries({ queryKey: ['repairStatusHistory', variables.repairId] });
    },
  });
};
