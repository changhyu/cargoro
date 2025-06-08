import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilter,
  InvoiceStats,
  Payment,
  CreatePaymentInput,
} from '../types';

const API_BASE_URL = '/api/invoices';

// API 함수들
const invoiceApi = {
  // 송장 목록 조회
  getInvoices: async (filter?: InvoiceFilter): Promise<Invoice[]> => {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.customerId) params.append('customerId', filter.customerId);
    if (filter?.status && filter.status !== 'all') {
      params.append('status', filter.status);
    }
    if (filter?.paymentStatus && filter.paymentStatus !== 'all') {
      params.append('paymentStatus', filter.paymentStatus);
    }
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);

    const response = await fetch(`${API_BASE_URL}?${params}`);
    if (!response.ok) throw new Error('송장 목록을 불러오는데 실패했습니다');
    return response.json();
  },

  // 송장 상세 조회
  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('송장 정보를 불러오는데 실패했습니다');
    return response.json();
  },

  // 송장 생성
  createInvoice: async (data: CreateInvoiceInput): Promise<Invoice> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('송장 생성에 실패했습니다');
    return response.json();
  },

  // 송장 수정
  updateInvoice: async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateInvoiceInput;
  }): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('송장 수정에 실패했습니다');
    return response.json();
  },

  // 송장 삭제
  deleteInvoice: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('송장 삭제에 실패했습니다');
  },

  // 송장 이메일 발송
  sendInvoice: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}/send`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('송장 발송에 실패했습니다');
  },

  // 송장 통계 조회
  getInvoiceStats: async (): Promise<InvoiceStats> => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('송장 통계를 불러오는데 실패했습니다');
    return response.json();
  },

  // 결제 등록
  createPayment: async (data: CreatePaymentInput): Promise<Payment> => {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('결제 등록에 실패했습니다');
    return response.json();
  },

  // 송장별 결제 내역 조회
  getInvoicePayments: async (invoiceId: string): Promise<Payment[]> => {
    const response = await fetch(`${API_BASE_URL}/${invoiceId}/payments`);
    if (!response.ok) throw new Error('결제 내역을 불러오는데 실패했습니다');
    return response.json();
  },
};

// 송장 목록 조회 훅
export function useInvoices(filter?: InvoiceFilter) {
  return useQuery({
    queryKey: ['invoices', filter],
    queryFn: () => invoiceApi.getInvoices(filter),
  });
}

// 송장 상세 조회 훅
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getInvoice(id),
    enabled: !!id,
  });
}

// 송장 생성 훅
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('송장이 성공적으로 생성되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 송장 수정 훅
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.updateInvoice,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      toast.success('송장이 성공적으로 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 송장 삭제 훅
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('송장이 성공적으로 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 송장 발송 훅
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.sendInvoice,
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      toast.success('송장이 성공적으로 발송되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 송장 통계 조회 훅
export function useInvoiceStats() {
  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: invoiceApi.getInvoiceStats,
  });
}

// 결제 등록 훅
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.createPayment,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', data.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('결제가 성공적으로 등록되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 송장별 결제 내역 조회 훅
export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: () => invoiceApi.getInvoicePayments(invoiceId),
    enabled: !!invoiceId,
  });
}
