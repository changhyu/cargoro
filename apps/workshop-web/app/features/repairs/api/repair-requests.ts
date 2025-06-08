import { apiClient } from '@cargoro/api-client';

// 정비 요청 타입들
export interface RepairRequest {
  id: string;
  requestNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  vehicle: {
    id: string;
    vehicleNumber: string;
    model: string;
    manufacturer: string;
    year: number;
    mileage?: number;
  };
  description: string;
  symptoms: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  technician?: {
    id: string;
    name: string;
  };
  scheduledDate?: string;
  startDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  diagnosis?: string;
  repairNotes?: string;
  partsUsed?: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepairRequestDto {
  customerId: string;
  vehicleId: string;
  description: string;
  symptoms: string[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  preferredDate?: Date;
  estimatedDuration?: number;
}

export interface UpdateRepairRequestDto {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  technicianId?: string;
  scheduledDate?: string;
  diagnosis?: string;
  repairNotes?: string;
  estimatedCost?: number;
  actualCost?: number;
}

// API 함수들
export const repairRequestsApi = {
  // 정비 요청 목록 조회
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    search?: string;
  }) => {
    interface RepairRequestsResponse {
      data: RepairRequest[];
      total: number;
      page: number;
      pageSize: number;
    }
    const response = await apiClient.get<RepairRequestsResponse>('/repair-requests', { params });
    return response;
  },

  // 정비 요청 상세 조회
  getById: async (id: string) => {
    interface RepairRequestResponse {
      data: RepairRequest;
    }
    const response = await apiClient.get<RepairRequestResponse>(`/repair-requests/${id}`);
    return response;
  },

  // 정비 요청 생성
  create: async (data: CreateRepairRequestDto) => {
    interface CreateRepairRequestResponse {
      data: RepairRequest;
    }
    const response = await apiClient.post<CreateRepairRequestResponse>(
      '/repair-requests',
      data as unknown as Record<string, unknown>
    );
    return response;
  },

  // 정비 요청 수정
  update: async (id: string, data: UpdateRepairRequestDto) => {
    interface UpdateRepairRequestResponse {
      data: RepairRequest;
    }
    const response = await apiClient.put<UpdateRepairRequestResponse>(
      `/repair-requests/${id}`,
      data as Record<string, unknown>
    );
    return response;
  },

  // 정비 요청 취소
  cancel: async (id: string, reason?: string) => {
    interface CancelRepairRequestResponse {
      data: { success: boolean; message: string };
    }
    const response = await apiClient.delete<CancelRepairRequestResponse>(`/repair-requests/${id}`, {
      data: { reason },
    });
    return response;
  },

  // 이미지 업로드
  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    interface UploadImagesResponse {
      data: { urls: string[]; count: number };
    }
    const response = await apiClient.post<UploadImagesResponse>(
      `/repair-requests/${id}/images`,
      formData as unknown as Record<string, unknown>
    );
    return response;
  },
};

// React Query 훅들
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RepairRequestsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  search?: string;
}

export const useRepairRequests = (params?: RepairRequestsParams) => {
  return useQuery({
    queryKey: ['repairRequests', params],
    queryFn: () => repairRequestsApi.getList(params),
  });
};

export const useRepairRequest = (id: string) => {
  return useQuery({
    queryKey: ['repairRequest', id],
    queryFn: () => repairRequestsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateRepairRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repairRequestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairRequests'] });
    },
  });
};

export const useUpdateRepairRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRepairRequestDto }) =>
      repairRequestsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairRequest', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['repairRequests'] });
    },
  });
};

export const useCancelRepairRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      repairRequestsApi.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairRequest', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['repairRequests'] });
    },
  });
};
