import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  SystemDashboard,
  SystemMetrics,
  ServiceHealth,
  DatabaseMetrics,
  SystemAlert,
  SystemLog,
  BackupStatus,
} from '../types';

const API_BASE_URL = '/api/admin/system';

// API 함수들
const systemApi = {
  // 시스템 대시보드 조회
  getSystemDashboard: async (): Promise<SystemDashboard> => {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('시스템 대시보드를 불러오는데 실패했습니다');
    return response.json();
  },

  // 시스템 메트릭 조회
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    const response = await fetch(`${API_BASE_URL}/metrics`);
    if (!response.ok) throw new Error('시스템 메트릭을 불러오는데 실패했습니다');
    return response.json();
  },

  // 서비스 상태 조회
  getServiceHealth: async (): Promise<ServiceHealth[]> => {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('서비스 상태를 불러오는데 실패했습니다');
    return response.json();
  },

  // 데이터베이스 메트릭 조회
  getDatabaseMetrics: async (): Promise<DatabaseMetrics[]> => {
    const response = await fetch(`${API_BASE_URL}/databases`);
    if (!response.ok) throw new Error('데이터베이스 메트릭을 불러오는데 실패했습니다');
    return response.json();
  },

  // 시스템 알림 조회
  getSystemAlerts: async (resolved?: boolean): Promise<SystemAlert[]> => {
    const params = new URLSearchParams();
    if (resolved !== undefined) params.append('resolved', resolved.toString());

    const response = await fetch(`${API_BASE_URL}/alerts?${params}`);
    if (!response.ok) throw new Error('시스템 알림을 불러오는데 실패했습니다');
    return response.json();
  },

  // 알림 확인
  acknowledgeAlert: async (alertId: string): Promise<SystemAlert> => {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('알림 확인에 실패했습니다');
    return response.json();
  },

  // 시스템 로그 조회
  getSystemLogs: async (filter?: {
    level?: string;
    service?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<SystemLog[]> => {
    const params = new URLSearchParams();
    if (filter?.level) params.append('level', filter.level);
    if (filter?.service) params.append('service', filter.service);
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.limit) params.append('limit', filter.limit.toString());

    const response = await fetch(`${API_BASE_URL}/logs?${params}`);
    if (!response.ok) throw new Error('시스템 로그를 불러오는데 실패했습니다');
    return response.json();
  },

  // 백업 상태 조회
  getBackupStatus: async (): Promise<BackupStatus[]> => {
    const response = await fetch(`${API_BASE_URL}/backups`);
    if (!response.ok) throw new Error('백업 상태를 불러오는데 실패했습니다');
    return response.json();
  },

  // 백업 실행
  runBackup: async (type: 'database' | 'files' | 'full'): Promise<BackupStatus> => {
    const response = await fetch(`${API_BASE_URL}/backups/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!response.ok) throw new Error('백업 실행에 실패했습니다');
    return response.json();
  },

  // 서비스 재시작
  restartService: async (serviceName: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/services/${serviceName}/restart`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('서비스 재시작에 실패했습니다');
  },
};

// 시스템 대시보드 조회 훅
export function useSystemDashboard() {
  return useQuery({
    queryKey: ['system-dashboard'],
    queryFn: systemApi.getSystemDashboard,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
}

// 시스템 메트릭 조회 훅
export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: systemApi.getSystemMetrics,
    refetchInterval: 10000, // 10초마다 자동 갱신
  });
}

// 서비스 상태 조회 훅
export function useServiceHealth() {
  return useQuery({
    queryKey: ['service-health'],
    queryFn: systemApi.getServiceHealth,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
}

// 데이터베이스 메트릭 조회 훅
export function useDatabaseMetrics() {
  return useQuery({
    queryKey: ['database-metrics'],
    queryFn: systemApi.getDatabaseMetrics,
    refetchInterval: 60000, // 1분마다 자동 갱신
  });
}

// 시스템 알림 조회 훅
export function useSystemAlerts(resolved?: boolean) {
  return useQuery({
    queryKey: ['system-alerts', resolved],
    queryFn: () => systemApi.getSystemAlerts(resolved),
    refetchInterval: 60000, // 1분마다 자동 갱신
  });
}

// 알림 확인 훅
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: systemApi.acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['system-dashboard'] });
      toast.success('알림이 확인되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 시스템 로그 조회 훅
export function useSystemLogs(filter?: Parameters<typeof systemApi.getSystemLogs>[0]) {
  return useQuery({
    queryKey: ['system-logs', filter],
    queryFn: () => systemApi.getSystemLogs(filter),
  });
}

// 백업 상태 조회 훅
export function useBackupStatus() {
  return useQuery({
    queryKey: ['backup-status'],
    queryFn: systemApi.getBackupStatus,
  });
}

// 백업 실행 훅
export function useRunBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: systemApi.runBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-status'] });
      toast.success('백업이 시작되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 서비스 재시작 훅
export function useRestartService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: systemApi.restartService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-health'] });
      queryClient.invalidateQueries({ queryKey: ['system-dashboard'] });
      toast.success('서비스가 재시작되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
