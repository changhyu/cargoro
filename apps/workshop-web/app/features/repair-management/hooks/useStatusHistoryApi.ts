/**
 * 정비 작업 상태 이력 관리 API 통신용 훅
 * Zod와 React Query를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  statusHistoryApi,
  StatusHistory,
  StatusHistoryCreate,
} from '@cargoro/api-client/lib/status-history-api';

// 백엔드 스네이크 케이스를 프론트엔드 카멜 케이스로 변환하는 유틸리티 함수
const transformStatusHistory = (statusHistory: StatusHistory) => {
  return {
    id: statusHistory.id,
    repairId: statusHistory.repair_id,
    status: statusHistory.status,
    timestamp: statusHistory.timestamp,
    note: statusHistory.note,
    technicianId: statusHistory.technician_id,
    technicianName: statusHistory.technician_name,
  };
};

/**
 * 정비 작업의 상태 이력 조회 훅
 */
export function useStatusHistory(repairId: string | undefined) {
  return useQuery({
    queryKey: ['statusHistory', repairId],
    queryFn: async () => {
      if (!repairId) throw new Error('정비 작업 ID가 필요합니다.');
      const response = await statusHistoryApi.getStatusHistory(repairId);
      return {
        statusHistory: response.data.statusHistory.map(transformStatusHistory),
      };
    },
    enabled: !!repairId,
  });
}

/**
 * 정비 작업에 상태 이력 추가 훅
 */
export function useAddStatusHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repairId,
      statusData,
    }: {
      repairId: string;
      statusData: StatusHistoryCreate;
    }) => {
      const response = await statusHistoryApi.addStatusHistory(repairId, statusData);
      return transformStatusHistory(response.data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['statusHistory', data.repairId] });
      queryClient.invalidateQueries({ queryKey: ['repair', data.repairId] });
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
    },
  });
}

// 타입 재정의 (프론트엔드 친화적인 카멜 케이스)
export interface StatusHistoryData {
  id: string;
  repairId: string;
  status: string;
  timestamp: string;
  note?: string;
  technicianId?: string;
  technicianName?: string;
}
