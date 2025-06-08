import { useCallback, useState } from 'react';
import { useToast } from '@cargoro/ui';

import { useTranslation } from 'react-i18next';

import { repairApi } from '@/app/services/api';

import {
  RepairJobCreateResponse,
  RepairJobDetailResponse,
  RepairJobDeleteResponse,
  RepairJobListResponse,
  RepairJobUpdateResponse,
  TechnicianListResponse,
} from '@/app/services/types';

import {
  RepairJob,
  RepairJobFilter,
  RepairStatus,
  Technician,
  RepairJobCreateData,
  RepairJobUpdateData,
} from '../features/repair-management/types';

// 로깅 유틸리티
const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  },
};

// 임시 더미 데이터 - 정비사 목록
const DUMMY_TECHNICIANS: Technician[] = [
  {
    id: '1',
    name: '김기술',
    role: 'senior',
    specialties: ['엔진', '변속기', '전기'],
    active: true,
    currentLoad: 75,
    skills: {
      엔진: 5,
      변속기: 4,
      전기: 3,
      브레이크: 4,
      서스펜션: 4,
    },
    availability: {
      available: true,
    },
  },
  {
    id: '2',
    name: '이정비',
    role: 'master',
    specialties: ['전자제어', '하이브리드', '진단'],
    active: true,
    currentLoad: 40,
    skills: {
      전자제어: 5,
      하이브리드: 5,
      진단: 5,
      엔진: 4,
      브레이크: 3,
    },
    availability: {
      available: true,
    },
  },
  {
    id: '3',
    name: '박수리',
    role: 'junior',
    specialties: ['브레이크', '휠 얼라인먼트'],
    active: true,
    currentLoad: 60,
    skills: {
      브레이크: 4,
      휠얼라인먼트: 3,
      타이어: 4,
      서스펜션: 2,
      엔진: 2,
    },
    availability: {
      available: false,
      nextAvailableTime: '2024-05-22T14:00:00Z',
    },
  },
];

// 임시 더미 데이터 - 정비 부품 (PartInfo 타입으로 변환)
/* 현재 사용하지 않음 - 나중에 필요할 때 주석 해제
const DUMMY_PARTS: PartInfo[] = [
  {
    id: 'p1',
    name: '엔진 오일 필터',
    partNumber: 'EOFIL-1234',
    quantity: 1,
    cost: 12000,
    unitPrice: 12000,
    totalPrice: 12000,
    isAvailable: true,
  },
  {
    id: 'p2',
    name: '브레이크 패드',
    partNumber: 'BRPAD-5678',
    quantity: 2,
    cost: 45000,
    unitPrice: 45000,
    totalPrice: 90000,
    isAvailable: true,
  },
  {
    id: 'p3',
    name: '타이밍 벨트 세트',
    partNumber: 'TIMBELT-9012',
    quantity: 1,
    cost: 150000,
    unitPrice: 150000,
    totalPrice: 150000,
    isAvailable: false,
    estimatedArrival: '2024-05-25',
  },
];
*/

// 임시 더미 데이터 - 진단 결과
/* 현재 사용하지 않음 - 나중에 필요할 때 주석 해제
const DUMMY_DIAGNOSTICS: DiagnosticResult[] = [
  {
    id: 'd1',
    code: 'P0301',
    description: '실린더 1 실화 감지',
    severity: 'high',
    timestamp: '2024-05-21T09:30:00Z',
    diagnosedBy: '이정비',
  },
  {
    id: 'd2',
    code: 'P0420',
    description: '촉매 시스템 효율 미달 (뱅크 1)',
    severity: 'medium',
    timestamp: '2024-05-21T09:35:00Z',
    diagnosedBy: '이정비',
  },
];
*/

// 백업 데이터
const FALLBACK_JOBS: RepairJob[] = [
  {
    id: 'fallback-1',
    vehicleId: 'v-1',
    vehicleInfo: {
      id: 'v-1',
      licensePlate: '12가 3456',
      manufacturer: '현대',
      model: '아반떼',
      year: 2022,
      vin: 'KMHXX00X0X0000000',
    },
    customerInfo: {
      id: 'c-1',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'hong@example.com',
    },
    description: '엔진 오일 교체',
    status: 'pending',
    type: 'regular',
    priority: 'low',
    estimatedHours: 1,
    assignedTechnicianId: undefined,
    technicianInfo: undefined,
    startDate: undefined,
    completionDate: undefined,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    notes: '',
    cost: {
      labor: 50000,
      parts: 30000,
      total: 80000,
      currency: 'KRW',
    },
    usedParts: [],
    diagnostics: [],
    images: [],
  },
];

interface UseRepairJobsReturn {
  repairJobs: RepairJob[];
  totalJobs: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  fetchRepairJobs: () => Promise<void>;
  fetchRepairJobDetail: (id: string) => Promise<RepairJob>;
  createRepairJob: (data: RepairJobCreateData) => Promise<RepairJobCreateResponse>;
  changeRepairJobStatus: (id: string, status: RepairStatus) => Promise<RepairJobUpdateResponse>;
  updateRepairJob: (id: string, data: RepairJobUpdateData) => Promise<RepairJobUpdateResponse>;
  deleteRepairJob: (id: string) => Promise<RepairJobDeleteResponse>;
  fetchTechnicians: () => Promise<Technician[]>;
  selectJob?: (id: string) => void;
  technicians?: Technician[];
  isLoadingJobs?: boolean;
  isErrorJobs?: boolean;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
}

export const useRepairJobs = (filter?: RepairJobFilter): UseRepairJobsReturn => {
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchRepairJobs = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RepairJobListResponse = await repairApi.get('/jobs', {
        params: {
          page,
          per_page: perPage,
          ...filter,
        },
      });
      setRepairJobs(response.data || []);
      setTotalJobs(response.total_items || 0);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('정비 작업 목록을 불러오는 중 오류가 발생했습니다.');
      setError(error);
      logger.error('정비 작업 목록 조회 실패:', err);

      toast({
        title: t('error.title'),
        description: t('error.fetchRepairJobs'),
        variant: 'destructive',
      });

      // 오류 발생 시 백업 데이터 사용
      setRepairJobs(FALLBACK_JOBS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRepairJobDetail = async (id: string): Promise<RepairJob> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RepairJobDetailResponse = await repairApi.get(`/jobs/${id}`);
      return response.data;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('정비 작업 상세 정보를 불러오는 중 오류가 발생했습니다.');
      setError(error);
      logger.error('정비 작업 상세 조회 실패:', err);

      toast({
        title: t('error.title'),
        description: t('error.fetchRepairJobDetail'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createRepairJob = async (data: RepairJobCreateData): Promise<RepairJobCreateResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RepairJobCreateResponse = await repairApi.post('/jobs', data);
      toast({
        title: t('success.title'),
        description: t('success.createRepairJob'),
      });
      await fetchRepairJobs();
      return response;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('정비 작업을 등록하는 중 오류가 발생했습니다.');
      setError(error);
      logger.error('정비 작업 생성 실패:', err);

      toast({
        title: t('error.title'),
        description: t('error.createRepairJob'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changeRepairJobStatus = async (
    id: string,
    status: RepairStatus
  ): Promise<RepairJobUpdateResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RepairJobUpdateResponse = await repairApi.put(`/jobs/${id}/status`, {
        status,
      });
      toast({
        title: t('success.title'),
        description: t('success.updateRepairJobStatus'),
      });
      await fetchRepairJobs();
      return response;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('정비 작업 상태를 변경하는 중 오류가 발생했습니다.');
      setError(error);
      logger.error('정비 작업 상태 변경 실패:', err);

      toast({
        title: t('error.title'),
        description: t('error.updateRepairJobStatus'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRepairJob = async (
    id: string,
    data: RepairJobUpdateData
  ): Promise<RepairJobUpdateResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RepairJobUpdateResponse = await repairApi.put(`/jobs/${id}`, data);
      toast({
        title: t('success.title'),
        description: t('success.updateRepairJob'),
      });
      await fetchRepairJobs();
      return response;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('정비 작업을 업데이트하는 중 오류가 발생했습니다.');
      setError(error);
      logger.error('정비 작업 업데이트 실패:', err);

      toast({
        title: t('error.title'),
        description: t('error.updateRepairJob'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRepairJob = async (id: string): Promise<RepairJobDeleteResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RepairJobDeleteResponse = await repairApi.delete(`/jobs/${id}`);
      toast({
        title: t('success.title'),
        description: t('success.deleteRepairJob'),
      });
      await fetchRepairJobs();
      return response;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('정비 작업을 삭제하는 중 오류가 발생했습니다.');
      setError(error);
      logger.error('정비 작업 삭제 실패:', err);

      toast({
        title: t('error.title'),
        description: t('error.deleteRepairJob'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async (): Promise<Technician[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: TechnicianListResponse = await repairApi.get('/technicians');
      const technicianData = response.data || DUMMY_TECHNICIANS;
      setTechnicians(technicianData);
      return technicianData;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('정비사 목록을 불러오는 중 오류가 발생했습니다.');
      setError(error);
      logger.error('정비사 목록 조회 실패:', err);

      toast({
        title: t('error.title'),
        description: t('error.fetchTechnicians'),
        variant: 'destructive',
      });

      // 백업 데이터 사용
      setTechnicians(DUMMY_TECHNICIANS);
      return DUMMY_TECHNICIANS;
    } finally {
      setIsLoading(false);
    }
  };

  const selectJob = useCallback((id: string) => {
    // 향후 선택된 작업 ID 저장 로직 구현 예정
    logger.error('Job selected:', id);
  }, []);

  return {
    repairJobs,
    totalJobs,
    totalPages,
    isLoading,
    error,
    fetchRepairJobs,
    fetchRepairJobDetail,
    createRepairJob,
    changeRepairJobStatus,
    updateRepairJob,
    deleteRepairJob,
    fetchTechnicians,
    technicians,
    selectJob,
    isLoadingJobs: isLoading,
    isErrorJobs: error !== null,
    page,
    perPage,
    setPage,
    setPerPage,
  };
};
