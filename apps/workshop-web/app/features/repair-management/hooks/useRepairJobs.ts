import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repairApi } from '../../../services/api';
import { RepairJobStatus } from '../../../types/repair';
import { RepairJob, RepairPriority, RepairType, TechnicianRole } from '../types';

// 부품 정보 타입 정의
interface UsedPart {
  id: string;
  name: string;
  quantity: number;
  price: number;
  partNumber?: string;
  supplier?: string;
}

// 진단 정보 타입 정의
interface DiagnosticInfo {
  id: string;
  description: string;
  timestamp: string;
  technicianId: string;
  notes?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// 이미지 정보 타입 정의
interface RepairImage {
  id: string;
  url: string;
  description?: string;
  timestamp: string;
  type: 'before' | 'during' | 'after';
}

export interface RepairJobInput {
  vehicleId: string;
  vehicleInfo: {
    licensePlate: string;
    manufacturer: string;
    model: string;
    year: number;
    vin: string;
  };
  customerInfo: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  description: string;
  status: string;
  type: RepairType;
  priority: RepairPriority;
  estimatedHours: number;
  assignedTechnicianId: string | null;
  technicianInfo?: {
    id: string;
    name: string;
    role: TechnicianRole;
  };
  startDate: string | null;
  completionDate: string | null;
  notes: string;
  cost: {
    labor: number;
    parts: number;
    total: number;
    currency: string;
  };
  usedParts: UsedPart[];
  diagnostics: DiagnosticInfo[];
  images: RepairImage[];
}

export interface UseRepairJobsProps {
  page?: number;
  pageSize?: number;
}

export interface UseRepairJobsReturn {
  repairJobs: RepairJob[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateRepairJobStatus: (id: string, status: RepairJobStatus) => Promise<void>;
  deleteRepairJob: (id: string) => Promise<void>;
  createRepairJob: (data: RepairJobInput) => Promise<{ id: string }>;
  fetchTechnicians: () => Promise<{ id: string; name: string; role: string }[]>;
}

export function useRepairJobs(props?: UseRepairJobsProps): UseRepairJobsReturn {
  const { page = 1, pageSize = 10 } = props || {};
  const queryClient = useQueryClient();

  const {
    data: repairJobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['repair-jobs', page, pageSize],
    queryFn: async () => {
      const response = await repairApi.get('/repair-jobs', {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RepairJobStatus }) => {
      const response = await repairApi.patch(`/repair-jobs/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair-jobs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await repairApi.delete(`/repair-jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair-jobs'] });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: RepairJobInput) => {
      const response = await repairApi.post('/repair-jobs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair-jobs'] });
    },
  });

  const updateRepairJobStatus = async (id: string, status: RepairJobStatus) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const deleteRepairJob = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const createRepairJob = async (data: RepairJobInput) => {
    const result = await createJobMutation.mutateAsync(data);
    return { id: result.id || 'job123' };
  };

  const fetchTechnicians = async () => {
    try {
      const response = await repairApi.get('/technicians');
      return (
        response.data || [
          { id: 'tech1', name: '김정비', role: 'mechanic' },
          { id: 'tech2', name: '이엔진', role: 'engine_specialist' },
        ]
      );
    } catch (error) {
      // TODO: 에러 처리 및 로깅 구현
      return [
        { id: 'tech1', name: '김정비', role: 'mechanic' },
        { id: 'tech2', name: '이엔진', role: 'engine_specialist' },
      ];
    }
  };

  return {
    repairJobs,
    isLoading,
    error: error || null,
    refetch: async () => {
      await refetch();
    },
    updateRepairJobStatus,
    deleteRepairJob,
    createRepairJob,
    fetchTechnicians,
  };
}
