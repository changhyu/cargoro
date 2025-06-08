import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilter,
  CustomerStats,
  CustomerVehicle,
  CustomerServiceHistory,
} from '../types';

const API_BASE_URL = '/api/customers';

// API 함수들
const customerApi = {
  // 고객 목록 조회
  getCustomers: async (filter?: CustomerFilter): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.customerType && filter.customerType !== 'all') {
      params.append('customerType', filter.customerType);
    }
    if (filter?.status && filter.status !== 'all') {
      params.append('status', filter.status);
    }
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);

    const response = await fetch(`${API_BASE_URL}?${params}`);
    if (!response.ok) throw new Error('고객 목록을 불러오는데 실패했습니다');
    return response.json();
  },

  // 고객 상세 조회
  getCustomer: async (id: string): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('고객 정보를 불러오는데 실패했습니다');
    return response.json();
  },

  // 고객 생성
  createCustomer: async (data: CreateCustomerInput): Promise<Customer> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('고객 등록에 실패했습니다');
    return response.json();
  },

  // 고객 수정
  updateCustomer: async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateCustomerInput;
  }): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('고객 정보 수정에 실패했습니다');
    return response.json();
  },

  // 고객 삭제
  deleteCustomer: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('고객 삭제에 실패했습니다');
  },

  // 고객 차량 목록 조회
  getCustomerVehicles: async (customerId: string): Promise<CustomerVehicle[]> => {
    const response = await fetch(`${API_BASE_URL}/${customerId}/vehicles`);
    if (!response.ok) throw new Error('차량 목록을 불러오는데 실패했습니다');
    return response.json();
  },

  // 고객 서비스 이력 조회
  getCustomerServiceHistory: async (customerId: string): Promise<CustomerServiceHistory[]> => {
    const response = await fetch(`${API_BASE_URL}/${customerId}/service-history`);
    if (!response.ok) throw new Error('서비스 이력을 불러오는데 실패했습니다');
    return response.json();
  },

  // 고객 통계 조회
  getCustomerStats: async (): Promise<CustomerStats> => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('고객 통계를 불러오는데 실패했습니다');
    return response.json();
  },
};

// 고객 목록 조회 훅
export function useCustomers(filter?: CustomerFilter) {
  return useQuery({
    queryKey: ['customers', filter],
    queryFn: () => customerApi.getCustomers(filter),
  });
}

// 고객 상세 조회 훅
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getCustomer(id),
    enabled: !!id,
  });
}

// 고객 생성 훅
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      toast.success('고객이 성공적으로 등록되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 고객 수정 훅
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.updateCustomer,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast.success('고객 정보가 성공적으로 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 고객 삭제 훅
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      toast.success('고객이 성공적으로 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 고객 차량 목록 조회 훅
export function useCustomerVehicles(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'vehicles'],
    queryFn: () => customerApi.getCustomerVehicles(customerId),
    enabled: !!customerId,
  });
}

// 고객 서비스 이력 조회 훅
export function useCustomerServiceHistory(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'service-history'],
    queryFn: () => customerApi.getCustomerServiceHistory(customerId),
    enabled: !!customerId,
  });
}

// 고객 통계 조회 훅
export function useCustomerStats() {
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: customerApi.getCustomerStats,
  });
}
