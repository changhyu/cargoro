import { useState, useCallback } from 'react';

// useToast 사용을 제거하고 필요시 나중에 추가
import { maintenanceService } from '../../../services/api';
import {
  Maintenance,
  MaintenanceFilters,
  MaintenanceListResponse,
  MaintenanceStatus,
} from '../types';

interface UseMaintenance {
  maintenances: Maintenance[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  fetchMaintenances: (filters?: MaintenanceFilters) => Promise<MaintenanceListResponse | null>;
  fetchMaintenanceById: (id: string) => Promise<Maintenance | null>;
  createMaintenance: (
    data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Maintenance | null>;
  updateMaintenance: (id: string, data: Partial<Maintenance>) => Promise<Maintenance | null>;
  deleteMaintenance: (id: string) => Promise<boolean>;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => Promise<Maintenance | null>;
  getVehicleMaintenanceHistory: (
    vehicleId: string,
    filters?: Partial<MaintenanceFilters>
  ) => Promise<MaintenanceListResponse | null>;
}

export const useMaintenance = (): UseMaintenance => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  // 정비 목록 조회
  const fetchMaintenances = useCallback(async (filters?: MaintenanceFilters) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await maintenanceService.getMaintenances(filters);

      setMaintenances(response.items ?? []);
      setTotal(response.total ?? 0);
      setPage(response.page ?? 1);
      setPageSize(response.pageSize ?? 10);
      setTotalPages(response.totalPages ?? 0);

      return response;
    } catch (err) {
      setIsError(true);
      setError(err as Error);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 정비 상세 조회
  const fetchMaintenanceById = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const maintenance = await maintenanceService.getMaintenanceById(id);
      return maintenance;
    } catch (err) {
      setIsError(true);
      setError(err as Error);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 정비 등록
  const createMaintenance = useCallback(
    async (data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const newMaintenance = await maintenanceService.createMaintenance(data);

        return newMaintenance;
      } catch (err) {
        setIsError(true);
        setError(err as Error);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 정비 수정
  const updateMaintenance = useCallback(async (id: string, data: Partial<Maintenance>) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const updatedMaintenance = await maintenanceService.updateMaintenance(id, data);

      return updatedMaintenance;
    } catch (err) {
      setIsError(true);
      setError(err as Error);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 정비 삭제
  const deleteMaintenance = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      await maintenanceService.deleteMaintenance(id);

      return true;
    } catch (err) {
      setIsError(true);
      setError(err as Error);

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 정비 상태 변경
  const updateMaintenanceStatus = useCallback(async (id: string, status: MaintenanceStatus) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const updatedMaintenance = await maintenanceService.updateMaintenanceStatus(id, status);

      const statusMessages = {
        pending: '대기',
        scheduled: '예정',
        in_progress: '진행 중',
        completed: '완료',
        cancelled: '취소',
      } as const;

      return updatedMaintenance;
    } catch (err) {
      setIsError(true);
      setError(err as Error);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 차량별 정비 이력 조회
  const getVehicleMaintenanceHistory = useCallback(
    async (vehicleId: string, filters?: Partial<MaintenanceFilters>) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await maintenanceService.getVehicleMaintenanceHistory(vehicleId, filters);
        return response;
      } catch (err) {
        setIsError(true);
        setError(err as Error);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    maintenances,
    isLoading,
    isError,
    error,
    total,
    page,
    pageSize,
    totalPages,
    fetchMaintenances,
    fetchMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    updateMaintenanceStatus,
    getVehicleMaintenanceHistory,
  };
};
