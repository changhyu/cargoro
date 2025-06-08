import { useMutation, useQuery } from '@tanstack/react-query';

import { partsApi, erpApi } from '@/services/api';
import {
  ErpSyncRequest,
  ErpSyncResponse,
  PartCreateResponse,
  PartDeleteResponse,
  PartDetailResponse,
  PartFilterParams,
  PartListResponse,
  PartOrderCreateResponse,
  PartOrderDetailResponse,
  PartOrderFilterParams,
  PartOrderListResponse,
  PartOrderUpdateResponse,
  PartUpdateResponse,
} from '@/services/types';

import { Part, PartOrder } from '../features/parts-management/types';

// 부품 목록 조회 (필터링 지원)
export const useGetParts = (filters: PartFilterParams = {}, options = {}) => {
  return useQuery({
    queryKey: ['parts', filters],
    queryFn: async (): Promise<Part[]> => {
      const response = await partsApi.get<PartListResponse>(
        '/parts',
        filters as Record<string, unknown>
      );
      return response.data as Part[];
    },
    ...options,
  });
};

// 단일 부품 상세 조회
export const useGetPart = (id: string) => {
  return useQuery({
    queryKey: ['parts', id],
    queryFn: async (): Promise<Part> => {
      const response = await partsApi.get<PartDetailResponse>(`/parts/${id}`);
      return response.data as Part;
    },
    enabled: !!id,
  });
};

// 부품 추가
export const useAddPart = () => {
  return useMutation({
    mutationFn: async (part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await partsApi.post<PartCreateResponse>('/parts', part);
      return response.data;
    },
  });
};

// 부품 수정
export const useUpdatePart = () => {
  return useMutation({
    mutationFn: async ({ id, ...part }: Partial<Part> & { id: string }) => {
      const response = await partsApi.put<PartUpdateResponse>(`/parts/${id}`, part);
      return response.data;
    },
  });
};

// 부품 삭제
export const useDeletePart = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await partsApi.delete<PartDeleteResponse>(`/parts/${id}`);
      return response.success;
    },
  });
};

// 부품 주문 목록 조회 (필터링 지원)
export const useGetOrders = (filters: PartOrderFilterParams = {}, options = {}) => {
  return useQuery({
    queryKey: ['partOrders', filters],
    queryFn: async (): Promise<PartOrder[]> => {
      const response = await partsApi.get<PartOrderListResponse>(
        '/orders',
        filters as Record<string, unknown>
      );
      return response.data as PartOrder[];
    },
    ...options,
  });
};

// 단일 주문 상세 조회
export const useGetOrder = (id: string) => {
  return useQuery({
    queryKey: ['partOrders', id],
    queryFn: async (): Promise<PartOrder> => {
      const response = await partsApi.get<PartOrderDetailResponse>(`/orders/${id}`);
      return response.data as PartOrder;
    },
    enabled: !!id,
  });
};

// 주문 생성
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (order: Omit<PartOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await partsApi.post<PartOrderCreateResponse>('/orders', order);
      return response.data;
    },
  });
};

// 주문 상태 업데이트
export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await partsApi.patch<PartOrderUpdateResponse>(`/orders/${id}/status`, {
        status,
      });
      return response.data;
    },
  });
};

// ERP 시스템과 부품 데이터 동기화
export const useSyncWithErp = () => {
  return useMutation({
    mutationFn: async (syncRequest: ErpSyncRequest) => {
      const response = await erpApi.post<ErpSyncResponse>('/sync/parts', syncRequest);
      return response.data;
    },
  });
};

// 부품 재고 업데이트
export const useUpdateInventory = () => {
  return useMutation({
    mutationFn: async ({
      partId,
      quantity,
      adjustmentReason,
    }: {
      partId: string;
      quantity: number;
      adjustmentReason: string;
    }) => {
      const response = await partsApi.patch<PartUpdateResponse>(`/parts/${partId}/inventory`, {
        quantity,
        adjustment_reason: adjustmentReason,
      });
      return response.data;
    },
  });
};
