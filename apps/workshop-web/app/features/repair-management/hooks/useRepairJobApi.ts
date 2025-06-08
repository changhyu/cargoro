'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { RepairStatus, RepairType } from '../types';

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// 타입 정의
export interface RepairJobFilters {
  status?: RepairStatus;
  type?: RepairType;
  page?: number;
  pageSize?: number;
  technicianId?: string;
  vehicleId?: string;
  customerId?: string;
}

export interface RepairJob {
  id: string;
  description: string;
  status: RepairStatus;
  type: RepairType;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt?: string;
  vehicleInfo?: {
    licensePlate: string;
    manufacturer: string;
    model: string;
  };
  customerInfo?: {
    name: string;
    phone: string;
  };
  assignedTechnicianId?: string;
  technicianInfo?: {
    id: string;
    name: string;
    role: string;
  };
  notes?: string;
}

export interface RepairJobsResponse {
  jobs: RepairJob[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// 정비 작업 목록 조회
export const useGetRepairJobs = (filters?: RepairJobFilters) => {
  return useQuery({
    queryKey: ['repairJobs', filters],
    queryFn: async (): Promise<RepairJobsResponse> => {
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.pageSize) {
        params.append('pageSize', filters.pageSize.toString());
      }
      if (filters?.technicianId) {
        params.append('technicianId', filters.technicianId);
      }
      if (filters?.vehicleId) {
        params.append('vehicleId', filters.vehicleId);
      }
      if (filters?.customerId) {
        params.append('customerId', filters.customerId);
      }

      const response = await axios.get(`${API_BASE_URL}/repair-jobs?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 특정 정비 작업 조회
export const useGetRepairJobById = (id: string) => {
  return useQuery({
    queryKey: ['repairJob', id],
    queryFn: async (): Promise<{ job: RepairJob }> => {
      const response = await axios.get(`${API_BASE_URL}/repair-jobs/${id}`);
      return response.data;
    },
    enabled: !!id, // id가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 정비 작업 상태 업데이트
export const useUpdateRepairJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RepairStatus }) => {
      const response = await axios.patch(`${API_BASE_URL}/repair-jobs/${id}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['repairJobs'] });
      queryClient.invalidateQueries({ queryKey: ['repairJob', variables.id] });
    },
  });
};

// 새 정비 작업 생성
export const useCreateRepairJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
      const response = await axios.post(`${API_BASE_URL}/repair-jobs`, jobData);
      return response.data;
    },
    onSuccess: () => {
      // 정비 작업 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['repairJobs'] });
    },
  });
};

// 정비 작업 정보 업데이트
export const useUpdateRepairJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RepairJob> }) => {
      const response = await axios.put(`${API_BASE_URL}/repair-jobs/${id}`, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['repairJobs'] });
      queryClient.invalidateQueries({ queryKey: ['repairJob', variables.id] });
    },
  });
};

// 정비 작업 삭제
export const useDeleteRepairJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API_BASE_URL}/repair-jobs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // 정비 작업 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['repairJobs'] });
    },
  });
};

// 정비사 배정
export const useAssignTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, technicianId }: { jobId: string; technicianId: string }) => {
      const response = await axios.post(`${API_BASE_URL}/repair-jobs/${jobId}/assign`, {
        technicianId,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['repairJobs'] });
      queryClient.invalidateQueries({ queryKey: ['repairJob', variables.jobId] });
    },
  });
};

// 호환성을 위한 별칭
export const useRepairJobs = useGetRepairJobs;
