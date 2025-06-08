import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  // ContractPayment,
  CreateContractPaymentDto,
  UpdateContractPaymentDto,
} from '@cargoro/types/schema/contract';
import { PaginationParams } from '@cargoro/types/schema/api';
import { ContractApi } from '../lib/contract-api';
import { formatErrorMessage } from '../utils/api-error';

// API 인스턴스 생성
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const contractApi = new ContractApi(API_URL);

// 필터 타입 정의
type ContractFilters = PaginationParams & {
  status?: string;
  vehicleId?: string;
  organizationId?: string;
  [key: string]: unknown;
};

// 계약 API 쿼리 키
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...contractKeys.lists(), filters] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  payments: (contractId: string) => [...contractKeys.detail(contractId), 'payments'] as const,
  payment: (contractId: string, paymentId: string) =>
    [...contractKeys.payments(contractId), paymentId] as const,
};

// 계약 목록 조회 훅
export function useContracts(params?: ContractFilters) {
  return useQuery({
    queryKey: contractKeys.list(params || {}),
    queryFn: () => contractApi.getContracts(params),
    meta: {
      onError: (error: unknown) => {
        console.error('계약 목록 조회 에러:', formatErrorMessage(error));
      },
    },
  });
}

// 계약 상세 조회 훅
export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractApi.getContractById(id),
    enabled: !!id,
    meta: {
      onError: (error: unknown) => {
        console.error(`계약 ID ${id} 조회 에러:`, formatErrorMessage(error));
      },
    },
  });
}

// 차량별 계약 조회 훅
export function useContractsByVehicleId(vehicleId: string) {
  return useQuery({
    queryKey: [...contractKeys.lists(), { vehicleId }],
    queryFn: () => contractApi.getContractsByVehicleId(vehicleId),
    enabled: !!vehicleId,
    meta: {
      onError: (error: unknown) => {
        console.error(`차량 ID ${vehicleId}의 계약 조회 에러:`, formatErrorMessage(error));
      },
    },
  });
}

// 계약 생성 훅
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractDto) => contractApi.createContract(data),
    onSuccess: (contract: Contract) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      // 차량 ID가 있으면 해당 차량의 계약 목록도 갱신
      if (contract?.vehicleId) {
        queryClient.invalidateQueries({
          queryKey: [...contractKeys.lists(), { vehicleId: contract.vehicleId }],
        });
      }
    },
    onError: (error: unknown) => {
      console.error('계약 생성 에러:', formatErrorMessage(error));
    },
  });
}

// 계약 업데이트 훅
export function useUpdateContract(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContractDto) => contractApi.updateContract(id, data),
    onSuccess: (updatedContract: Contract) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      // 차량 ID가 있으면 해당 차량의 계약 목록도 갱신
      if (updatedContract?.vehicleId) {
        queryClient.invalidateQueries({
          queryKey: [...contractKeys.lists(), { vehicleId: updatedContract.vehicleId }],
        });
      }
      return updatedContract;
    },
    onError: (error: unknown) => {
      console.error(`계약 ID ${id} 업데이트 에러:`, formatErrorMessage(error));
    },
  });
}

// 계약 상태 변경 훅
export function useUpdateContractStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) => contractApi.updateContractStatus(id, status),
    onSuccess: updatedContract => {
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      return updatedContract;
    },
    onError: (error: unknown) => {
      console.error(`계약 ID ${id} 상태 변경 에러:`, formatErrorMessage(error));
    },
  });
}

// 계약 삭제 훅
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractApi.deleteContract(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.removeQueries({ queryKey: contractKeys.detail(id) });
    },
    onError: (error: unknown, id: string) => {
      console.error(`계약 ID ${id} 삭제 에러:`, formatErrorMessage(error));
    },
  });
}

// 계약 결제 목록 조회 훅
export function useContractPayments(contractId: string) {
  return useQuery({
    queryKey: contractKeys.payments(contractId),
    queryFn: () => contractApi.getContractPayments(contractId),
    enabled: !!contractId,
    meta: {
      onError: (error: unknown) => {
        console.error(`계약 ID ${contractId}의 결제 내역 조회 에러:`, formatErrorMessage(error));
      },
    },
  });
}

// 계약 결제 추가 훅
export function useAddContractPayment(contractId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractPaymentDto) =>
      contractApi.addContractPayment(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.payments(contractId) });
    },
    onError: (error: unknown) => {
      console.error(`계약 ID ${contractId}에 결제 추가 에러:`, formatErrorMessage(error));
    },
  });
}

// 계약 결제 업데이트 훅
export function useUpdateContractPayment(contractId: string, paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContractPaymentDto) =>
      contractApi.updateContractPayment(contractId, paymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.payments(contractId) });
      queryClient.invalidateQueries({
        queryKey: contractKeys.payment(contractId, paymentId),
      });
    },
    onError: (error: unknown) => {
      console.error(`결제 ID ${paymentId} 업데이트 에러:`, formatErrorMessage(error));
    },
  });
}

// 계약 결제 삭제 훅
export function useDeleteContractPayment(contractId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => contractApi.deleteContractPayment(contractId, paymentId),
    onSuccess: (_data, paymentId) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.payments(contractId) });
      queryClient.removeQueries({
        queryKey: contractKeys.payment(contractId, paymentId),
      });
    },
    onError: (error: unknown, paymentId: string) => {
      console.error(`결제 ID ${paymentId} 삭제 에러:`, formatErrorMessage(error));
    },
  });
}
