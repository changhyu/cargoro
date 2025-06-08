import { useCallback, useState } from 'react';

import { Alert } from 'react-native';

import { RepairJob, RepairJobFilter, RepairStatus } from '../types';

// 임시 더미 데이터 - 정비 작업 목록
const DUMMY_REPAIR_JOBS: RepairJob[] = [
  {
    id: '1',
    vehicleId: 'v1',
    vehicleInfo: {
      licensePlate: '12가 3456',
      manufacturer: '현대',
      model: '아반떼',
      year: 2020,
      vin: 'KMHXX00X0XX000001',
    },
    customerInfo: {
      id: 'c1',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'hong@example.com',
    },
    description: '엔진 체크등 점등, 시동 불량',
    status: 'in_progress',
    type: 'emergency',
    priority: 'high',
    estimatedHours: 3,
    assignedTechnicianId: '2',
    technicianInfo: {
      id: '2',
      name: '이정비',
      role: 'master',
    },
    startDate: '2024-05-21T09:00:00Z',
    completionDate: null,
    createdAt: '2024-05-21T08:30:00Z',
    updatedAt: '2024-05-21T09:00:00Z',
    notes: '실린더 실화 발생, 인젝터 점검 필요',
    cost: {
      labor: 150000,
      parts: 252000,
      total: 402000,
      currency: 'KRW',
    },
    usedParts: [],
    diagnostics: [],
    images: [],
  },
  {
    id: '2',
    vehicleId: 'v2',
    vehicleInfo: {
      licensePlate: '34나 5678',
      manufacturer: '기아',
      model: 'K5',
      year: 2021,
      vin: 'KMHXX00X0XX000002',
    },
    customerInfo: {
      id: 'c2',
      name: '김철수',
      phone: '010-2345-6789',
      email: 'kim@example.com',
    },
    description: '정기 점검 및 오일 교체',
    status: 'pending',
    type: 'regular',
    priority: 'normal',
    estimatedHours: 1,
    assignedTechnicianId: '1',
    technicianInfo: {
      id: '1',
      name: '김기술',
      role: 'senior',
    },
    startDate: null,
    completionDate: null,
    createdAt: '2024-05-21T10:00:00Z',
    updatedAt: '2024-05-21T10:00:00Z',
    notes: '',
    cost: {
      labor: 50000,
      parts: 12000,
      total: 62000,
      currency: 'KRW',
    },
    usedParts: [],
    diagnostics: [],
    images: [],
  },
  {
    id: '3',
    vehicleId: 'v3',
    vehicleInfo: {
      licensePlate: '56다 7890',
      manufacturer: '쌍용',
      model: '코란도',
      year: 2019,
      vin: 'KMHXX00X0XX000003',
    },
    customerInfo: {
      id: 'c3',
      name: '박영희',
      phone: '010-3456-7890',
      email: 'park@example.com',
    },
    description: '브레이크 소음, 진동 발생',
    status: 'waiting_parts',
    type: 'repair',
    priority: 'high',
    estimatedHours: 2,
    assignedTechnicianId: '3',
    technicianInfo: {
      id: '3',
      name: '박수리',
      role: 'junior',
    },
    startDate: '2024-05-20T14:00:00Z',
    completionDate: null,
    createdAt: '2024-05-20T13:30:00Z',
    updatedAt: '2024-05-20T15:00:00Z',
    notes: '브레이크 디스크 교체 필요, 부품 주문 중',
    cost: {
      labor: 80000,
      parts: 240000,
      total: 320000,
      currency: 'KRW',
    },
    usedParts: [],
    diagnostics: [],
    images: [],
  },
  {
    id: '4',
    vehicleId: 'v4',
    vehicleInfo: {
      licensePlate: '78라 9012',
      manufacturer: '르노',
      model: 'SM6',
      year: 2022,
      vin: 'KMHXX00X0XX000004',
    },
    customerInfo: {
      id: 'c4',
      name: '최민수',
      phone: '010-4567-8901',
      email: 'choi@example.com',
    },
    description: '에어컨 냉각 불량',
    status: 'completed',
    type: 'repair',
    priority: 'normal',
    estimatedHours: 1.5,
    assignedTechnicianId: '1',
    technicianInfo: {
      id: '1',
      name: '김기술',
      role: 'senior',
    },
    startDate: '2024-05-19T10:00:00Z',
    completionDate: '2024-05-19T11:30:00Z',
    createdAt: '2024-05-19T09:30:00Z',
    updatedAt: '2024-05-19T11:30:00Z',
    notes: '에어컨 가스 충전 완료',
    cost: {
      labor: 70000,
      parts: 50000,
      total: 120000,
      currency: 'KRW',
    },
    usedParts: [],
    diagnostics: [],
    images: [],
  },
];

export function useRepairJobs(filter: RepairJobFilter) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    waitingParts: 0,
  });

  // 정비 작업 목록 조회
  const fetchRepairJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 실제 구현 시 API 호출로 대체
      // const response = await api.get<RepairJobListResponse>('/repair-jobs', { params: filter });

      // 임시 데이터 처리 (모의 API 응답)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 필터링
      let filteredJobs = [...DUMMY_REPAIR_JOBS];

      // 상태 필터링
      if (filter.status) {
        filteredJobs = filteredJobs.filter(job => job.status === filter.status);
      }

      // 통계 집계
      const stats = {
        pending: DUMMY_REPAIR_JOBS.filter(job => job.status === 'pending').length,
        inProgress: DUMMY_REPAIR_JOBS.filter(job => job.status === 'in_progress').length,
        completed: DUMMY_REPAIR_JOBS.filter(job => job.status === 'completed').length,
        cancelled: DUMMY_REPAIR_JOBS.filter(job => job.status === 'cancelled').length,
        waitingParts: DUMMY_REPAIR_JOBS.filter(job => job.status === 'waiting_parts').length,
      };

      // 페이지네이션
      const totalItems = filteredJobs.length;
      const totalPages = Math.ceil(totalItems / filter.pageSize);
      const start = (filter.page - 1) * filter.pageSize;
      const end = start + filter.pageSize;
      const paginatedItems = filteredJobs.slice(start, end);

      setRepairJobs(paginatedItems);
      setTotalJobs(totalItems);
      setTotalPages(totalPages);
      setStatistics(stats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '정비 작업 목록을 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // 정비 작업 상세 정보 조회
  const fetchRepairJobDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 실제 구현 시 API 호출로 대체
      // const response = await api.get<RepairJobDetailResponse>(`/repair-jobs/${id}`);

      // 임시 데이터 처리
      await new Promise(resolve => setTimeout(resolve, 300));
      const job = DUMMY_REPAIR_JOBS.find(j => j.id === id);

      if (!job) {
        throw new Error('정비 작업을 찾을 수 없습니다.');
      }

      return job;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '정비 작업 상세 정보를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 정비 작업 상태 변경
  const changeRepairJobStatus = useCallback(async (id: string, status: RepairStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      // 실제 구현 시 API 호출로 대체
      // const response = await api.put<RepairJobUpdateResponse>(`/repair-jobs/${id}/status`, { status });

      // 임시 처리
      await new Promise(resolve => setTimeout(resolve, 500));
      const jobIndex = DUMMY_REPAIR_JOBS.findIndex(job => job.id === id);

      if (jobIndex === -1) {
        throw new Error('정비 작업을 찾을 수 없습니다.');
      }

      DUMMY_REPAIR_JOBS[jobIndex].status = status;
      DUMMY_REPAIR_JOBS[jobIndex].updatedAt = new Date().toISOString();

      return {
        success: true,
        message: '작업 상태가 성공적으로 변경되었습니다.',
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '작업 상태 변경 중 오류가 발생했습니다.';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    repairJobs,
    isLoading,
    error,
    totalJobs,
    totalPages,
    statistics,
    fetchRepairJobs,
    fetchRepairJobDetail,
    changeRepairJobStatus,
  };
}
