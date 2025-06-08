import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
} from '@/features/parts-inventory/types';

const API_BASE_URL = '/api/suppliers';

// API 함수들
const supplierApi = {
  // 공급업체 목록 조회
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('공급업체 목록을 불러오는데 실패했습니다');
    return response.json();
  },

  // 공급업체 상세 조회
  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('공급업체 정보를 불러오는데 실패했습니다');
    return response.json();
  },

  // 공급업체 생성
  createSupplier: async (data: CreateSupplierInput): Promise<Supplier> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('공급업체 등록에 실패했습니다');
    return response.json();
  },

  // 공급업체 수정
  updateSupplier: async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateSupplierInput;
  }): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('공급업체 정보 수정에 실패했습니다');
    return response.json();
  },

  // 공급업체 삭제
  deleteSupplier: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('공급업체 삭제에 실패했습니다');
  },
};

// 공급업체 목록 조회 훅
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierApi.getSuppliers,
  });
}

// 공급업체 상세 조회 훅
export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierApi.getSupplier(id),
    enabled: !!id,
  });
}

// 공급업체 생성 훅
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierApi.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('공급업체가 성공적으로 등록되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 공급업체 수정 훅
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierApi.updateSupplier,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', data.id] });
      toast.success('공급업체 정보가 성공적으로 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 공급업체 삭제 훅
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierApi.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('공급업체가 성공적으로 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
