/**
 * 정비 서비스 요청 관리 API 통신용 훅
 * Zod와 React Query를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  serviceRequestApi,
  ServiceRequest,
  ServiceRequestCreate,
  ServiceRequestUpdate,
  ServiceRequestStatus,
} from '@cargoro/api-client/lib/service-request-api';

// 백엔드 스네이크 케이스를 프론트엔드 카멜 케이스로 변환하는 유틸리티 함수
const transformServiceRequest = (serviceRequest: ServiceRequest) => {
  return {
    id: serviceRequest.id,
    customerId: serviceRequest.customer_id,
    vehicleId: serviceRequest.vehicle_id,
    title: serviceRequest.title,
    description: serviceRequest.description,
    status: serviceRequest.status,
    priority: serviceRequest.priority,
    requestedDate: serviceRequest.requested_date,
    scheduledDate: serviceRequest.scheduled_date,
    completedDate: serviceRequest.completed_date,
    createdAt: serviceRequest.created_at,
    updatedAt: serviceRequest.updated_at,
  };
};

/**
 * 모든 서비스 요청 조회 훅
 */
export function useServiceRequests(filter = {}) {
  return useQuery({
    queryKey: ['serviceRequests', filter],
    queryFn: async () => {
      const response = await serviceRequestApi.getAllServiceRequests(filter);
      return {
        serviceRequests: response.data.map(transformServiceRequest),
        page: response.page,
        perPage: response.per_page,
        totalItems: response.total_items,
        totalPages: response.total_pages,
      };
    },
  });
}

/**
 * 특정 서비스 요청 조회 훅
 */
export function useServiceRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['serviceRequest', id],
    queryFn: async () => {
      if (!id) throw new Error('서비스 요청 ID가 필요합니다.');
      const response = await serviceRequestApi.getServiceRequestById(id);
      return transformServiceRequest(response.data);
    },
    enabled: !!id,
  });
}

/**
 * 서비스 요청 생성 훅
 */
export function useCreateServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      customer_id: string;
      vehicle_id: string;
      priority: 'high' | 'low' | 'medium' | 'urgent';
      requested_date: string;
    }) => {
      const response = await serviceRequestApi.createServiceRequest(data as ServiceRequestCreate);
      return transformServiceRequest(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
    },
  });
}

/**
 * 서비스 요청 업데이트 훅
 */
export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceRequestUpdate }) => {
      const response = await serviceRequestApi.updateServiceRequest(id, data);
      return transformServiceRequest(response.data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['serviceRequest', data.id] });
    },
  });
}

/**
 * 서비스 요청 상태 변경 훅
 */
export function useUpdateServiceRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ServiceRequestStatus }) => {
      const response = await serviceRequestApi.updateServiceRequestStatus(id, status);
      return transformServiceRequest(response.data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['serviceRequest', data.id] });
    },
  });
}

/**
 * 서비스 요청 삭제 훅
 */
export function useDeleteServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await serviceRequestApi.deleteServiceRequest(id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
    },
  });
}

// 타입 재정의 (프론트엔드 친화적인 카멜 케이스)
export interface ServiceRequestData {
  id: string;
  customerId: string;
  vehicleId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}
