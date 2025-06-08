'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
// 타입 불러오기는 제거하고 직접 정의

// API 클라이언트 config 타입
interface ApiClientConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

// API 클라이언트 인스턴스 생성
const suppliersApi = {
  ...apiClient('/api/suppliers'),
  get: async <T>(url: string, config?: ApiClientConfig) => {
    const response = await apiClient('/api/suppliers').get<T>(url, config);
    return response.data as T;
  },
  post: async <T>(url: string, data?: unknown, config?: ApiClientConfig) => {
    const response = await apiClient('/api/suppliers').post<T>(
      url,
      data as Record<string, unknown>,
      config
    );
    return response.data as T;
  },
  put: async <T>(url: string, data?: unknown, config?: ApiClientConfig) => {
    const response = await apiClient('/api/suppliers').put<T>(
      url,
      data as Record<string, unknown>,
      config
    );
    return response.data as T;
  },
  delete: async <T>(url: string, config?: ApiClientConfig) => {
    const response = await apiClient('/api/suppliers').delete<T>(url, config);
    return response.data as T;
  },
};

// 공급업체 스키마 정의
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

// 공급업체 타입 정의
type Supplier = z.infer<typeof supplierSchema>;
// supplierSchema 자체는 위에서 정의되어 사용됨

// 응답 타입 정의
type SuppliersResponseType = {
  success: boolean;
  data: {
    suppliers: Supplier[];
    total?: number;
  };
};

type SupplierResponseType = {
  success: boolean;
  data: {
    supplier: Supplier;
  };
};

type CreateSupplierResponseType = {
  success: boolean;
  data: {
    supplier: Supplier;
  };
};

type DeleteSupplierResponseType = {
  success: boolean;
  data: {
    id: string;
  };
};

/**
 * 공급업체 목록 조회 훅
 */
export function useGetSuppliers(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = await suppliersApi.get<SuppliersResponseType>('/suppliers', { params });
      return response;
    },
  });
}

/**
 * 공급업체 상세 조회 훅
 */
export function useGetSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await suppliersApi.get<SupplierResponseType>(`/suppliers/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

/**
 * 공급업체 생성 훅
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      const response = await suppliersApi.post<CreateSupplierResponseType>('/suppliers', data);
      return (response as CreateSupplierResponseType).data.supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

/**
 * 공급업체 수정 훅
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Supplier> & { id: string }) => {
      const response = await suppliersApi.put<SupplierResponseType>(`/suppliers/${data.id}`, data);
      return (response as SupplierResponseType).data.supplier;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
    },
  });
}

/**
 * 공급업체 삭제 훅
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await suppliersApi.delete<DeleteSupplierResponseType>(`/suppliers/${id}`);
      return (response as DeleteSupplierResponseType).data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
