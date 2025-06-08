import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PurchaseOrder } from '@/features/parts-inventory/types';

const API_BASE_URL = '/api/purchase-orders';

interface CreatePurchaseOrderInput {
  supplierId: string;
  items: Array<{
    partId: string;
    quantity: number;
    unitPrice: number;
  }>;
  expectedDate?: string;
  notes?: string;
}

interface UpdatePurchaseOrderInput {
  status?: PurchaseOrder['status'];
  expectedDate?: string;
  notes?: string;
}

// API 함수들
const purchaseOrderApi = {
  // 주문 목록 조회
  getPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('주문 목록을 불러오는데 실패했습니다');
    return response.json();
  },

  // 주문 상세 조회
  getPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('주문 정보를 불러오는데 실패했습니다');
    return response.json();
  },

  // 주문 생성
  createPurchaseOrder: async (data: CreatePurchaseOrderInput): Promise<PurchaseOrder> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('주문 생성에 실패했습니다');
    return response.json();
  },

  // 주문 수정
  updatePurchaseOrder: async ({
    id,
    data,
  }: {
    id: string;
    data: UpdatePurchaseOrderInput;
  }): Promise<PurchaseOrder> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('주문 수정에 실패했습니다');
    return response.json();
  },

  // 주문 취소
  cancelPurchaseOrder: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('주문 취소에 실패했습니다');
  },

  // 입고 처리
  receivePurchaseOrder: async ({
    id,
    items,
  }: {
    id: string;
    items: Array<{ itemId: string; receivedQuantity: number }>;
  }): Promise<PurchaseOrder> => {
    const response = await fetch(`${API_BASE_URL}/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw new Error('입고 처리에 실패했습니다');
    return response.json();
  },
};

// 주문 목록 조회 훅
export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: purchaseOrderApi.getPurchaseOrders,
  });
}

// 주문 상세 조회 훅
export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => purchaseOrderApi.getPurchaseOrder(id),
    enabled: !!id,
  });
}

// 주문 생성 훅
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseOrderApi.createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('주문이 성공적으로 생성되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 주문 수정 훅
export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseOrderApi.updatePurchaseOrder,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      toast.success('주문이 성공적으로 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 주문 취소 훅
export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseOrderApi.cancelPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('주문이 성공적으로 취소되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 입고 처리 훅
export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseOrderApi.receivePurchaseOrder,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('입고 처리가 완료되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
