'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { UseQueryOptions } from '@tanstack/react-query';

import {
  Part,
  PartCategory as PartCategoryEnum,
  PartStatus as PartStatusEnum,
  OrderStatus as OrderStatusEnum,
  Order,
  ApiResponse,
} from '../types';

const supplierSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    contactName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.string().optional(),
    website: z.string().optional(),
    notes: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

// 부품 스키마
const partSchema = z
  .object({
    id: z.string(),
    partNumber: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.nativeEnum(PartCategoryEnum),
    price: z.number(),
    cost: z.number(),
    quantity: z.number(),
    status: z.nativeEnum(PartStatusEnum),
    location: z.string().optional(),
    supplierId: z.string().optional(),
    supplier: z.union([z.string(), supplierSchema]).optional(),
    minimumStockLevel: z.number().optional(),
    reorderPoint: z.number().optional(),
    leadTime: z.number().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    manufacturer: z.string().optional(),
    manufacturerPartNumber: z.string().optional(),
    barcode: z.string().optional(),
    notes: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

// 타입 정의를 위한 인터페이스로 변환
// type PartsResponseType = {
//   success: boolean;
//   data: {
//     parts: Part[];
//     total?: number;
//   };
// };

type PartResponseType = {
  success: boolean;
  data: {
    part: Part;
  };
};

type CreatePartResponseType = {
  success: boolean;
  data: {
    part: Part;
  };
};

type DeletePartResponseType = {
  success: boolean;
  data: {
    id: string;
  };
};

// API 응답 타입
export interface PartListResponse {
  items: Part[];
  total: number;
}

export interface PartDetailResponse {
  part: Part;
}

export interface PartCreateResponse {
  id: string;
}

export interface PartUpdateResponse {
  id: string;
}

export interface PartDeleteResponse {
  success: boolean;
}

export interface PartOrderListResponse {
  items: Order[];
  total: number;
}

// API 클라이언트 config 타입
interface ApiClientConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

// API 클라이언트 인스턴스 생성
const partsApi = {
  ...apiClient('/api/parts'),
  get: async <T>(url: string, config?: ApiClientConfig) => {
    const response = await apiClient('/api/parts').get<T>(url, config);
    return response.data as T;
  },
  post: async <T>(url: string, data?: unknown, config?: ApiClientConfig) => {
    const response = await apiClient('/api/parts').post<T>(
      url,
      data as Record<string, unknown>,
      config
    );
    return response.data as T;
  },
  put: async <T>(url: string, data?: unknown, config?: ApiClientConfig) => {
    const response = await apiClient('/api/parts').put<T>(
      url,
      data as Record<string, unknown>,
      config
    );
    return response.data as T;
  },
  delete: async <T>(url: string, config?: ApiClientConfig) => {
    const response = await apiClient('/api/parts').delete<T>(url, config);
    return response.data as T;
  },
};
// ERP API는 별도로 정의하지 않음 - 사용하지 않음

// 부품 목록 조회
export function useGetParts(
  params?: Record<string, string | number | boolean>,
  options?: UseQueryOptions<ApiResponse<{ parts: Part[]; total?: number }>, Error>
) {
  return useQuery<ApiResponse<{ parts: Part[]; total?: number }>, Error>({
    queryKey: ['parts', params],
    queryFn: async () => {
      const response = await partsApi.get<ApiResponse<{ parts: Part[]; total?: number }>>('/parts');
      // params 매개변수를 처리하기 위해 apiClient에 직접 요청
      return response as ApiResponse<{ parts: Part[]; total?: number }>;
    },
    ...options,
  });
}

// 부품 상세 조회
export function useGetPart(id: string) {
  return useQuery({
    queryKey: ['part', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await partsApi.get<PartResponseType>(`/parts/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

// 부품 생성
export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partData: Partial<Part>) => {
      const response = await partsApi.post<CreatePartResponseType>('/parts', partData);
      return (response as CreatePartResponseType).data.part;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

// 부품 수정
export function useUpdatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partData: Partial<Part> & { id: string }) => {
      const { id, ...rest } = partData;
      const response = await partsApi.put<PartResponseType>(`/parts/${id}`, rest);
      return (response as PartResponseType).data.part;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['part', variables.id] });
    },
  });
}

// 부품 삭제
export function useDeletePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await partsApi.delete<DeletePartResponseType>(`/parts/${id}`);
      return (response as DeletePartResponseType).data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}

/**
 * 주문 관련 스키마 정의
 */
const orderItemSchema = z
  .object({
    id: z.string(),
    orderId: z.string(),
    partId: z.string(),
    part: partSchema.optional(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
    notes: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

const orderSchema = z
  .object({
    id: z.string(),
    orderNumber: z.string(),
    supplierId: z.string(),
    supplier: z
      .union([z.string(), z.object({ id: z.string(), name: z.string() }).passthrough()])
      .optional(),
    status: z.nativeEnum(OrderStatusEnum),
    orderDate: z.string(),
    estimatedDeliveryDate: z.string().optional(),
    deliveryDate: z.string().optional(),
    totalAmount: z.number(),
    notes: z.string().optional(),
    items: z.array(orderItemSchema).optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

// 타입 정의를 위한 인터페이스로 변환
// const orderSchema = z.object(...); // 위에 정의되어 있음

type OrdersResponseType = {
  success: boolean;
  data: {
    orders: Order[];
    total?: number;
  };
};

type OrderResponseType = {
  success: boolean;
  data: {
    order: Order;
  };
};

type UpdateOrderStatusResponseType = {
  success: boolean;
  data: {
    order: Order;
  };
};

/**
 * 부품 주문 목록 조회 훅
 */
export function useGetOrders(
  params?: Record<string, string | number | boolean>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await partsApi.get<OrdersResponseType>('/orders');
      return response;
    },
    ...options,
  });
}

/**
 * 부품 주문 상세 조회 훅
 */
export function useGetOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await partsApi.get<OrderResponseType>(`/orders/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

/**
 * 부품 주문 상태 업데이트 훅
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatusEnum }) => {
      const response = await partsApi.put<UpdateOrderStatusResponseType>(`/orders/${id}/status`, {
        status,
      });
      return (response as UpdateOrderStatusResponseType).data.order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

// 기존 코드와의 호환성을 위한 별칭
export const usePartOrdersList = useGetOrders;

/**
 * ERP 시스템과 부품 데이터 동기화 훅
 */
export function useErpSync() {
  const partsApi = apiClient('/api/parts');
  return useMutation({
    mutationFn: async (requestData: Record<string, unknown>) => {
      const response = await partsApi.post('/erp/sync/parts', requestData);
      return response;
    },
  });
}
