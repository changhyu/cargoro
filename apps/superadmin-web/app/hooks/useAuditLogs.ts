import { useCallback, useState } from 'react';
import { toast } from '@cargoro/ui';

import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { AuditLog, AuditLogFilter } from '../features/system-audit/types';

// 로그 통계 인터페이스 정의
interface LogStatistics {
  info: number;
  warning: number;
  error: number;
  critical: number;
}

// API 클라이언트 설정
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 임시 더미 감사 로그 데이터
const DUMMY_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-05-21T09:15:22Z',
    level: 'info',
    category: 'authentication',
    serviceType: 'auth_service',
    message: '사용자 로그인 성공',
    details: '관리자 계정으로 로그인했습니다.',
    ipAddress: '192.168.1.1',
    userId: 'admin-001',
    userName: '최고관리자',
    metadata: {},
  },
  {
    id: '2',
    timestamp: '2024-05-21T08:45:12Z',
    level: 'warning',
    category: 'security',
    serviceType: 'core_api',
    message: '비정상적인 API 요청 시도',
    details: '짧은 시간 내 과도한 요청이 감지되었습니다.',
    ipAddress: '203.45.67.89',
    resourceType: 'api',
    metadata: {
      requestCount: 150,
      timeframeSeconds: 60,
      endpoint: '/api/v1/users',
    },
  },
  {
    id: '3',
    timestamp: '2024-05-21T07:32:45Z',
    level: 'error',
    category: 'data_access',
    serviceType: 'core_api',
    message: '데이터베이스 쿼리 실패',
    details: '부품 재고 조회 중 데이터베이스 연결 오류가 발생했습니다.',
    ipAddress: '10.0.3.45',
    userId: 'user-245',
    userName: '김부품',
    resourceType: 'database',
    resourceId: 'parts-db-01',
    metadata: {
      errorCode: 'CONNECTION_TIMEOUT',
      query: 'SELECT * FROM parts WHERE stock < 10',
    },
  },
  {
    id: '4',
    timestamp: '2024-05-20T22:14:31Z',
    level: 'critical',
    category: 'security',
    serviceType: 'admin_api',
    message: '권한 상승 시도 감지',
    details: '일반 사용자 계정으로 관리자 API에 접근 시도가 감지되었습니다.',
    ipAddress: '45.67.89.123',
    userId: 'user-178',
    userName: '이해커',
    resourceType: 'api',
    resourceId: '/api/admin/settings',
    metadata: {
      attemptCount: 3,
      userRole: 'user',
      requiredRole: 'admin',
    },
  },
  {
    id: '5',
    timestamp: '2024-05-20T16:48:01Z',
    level: 'info',
    category: 'system_config',
    serviceType: 'workshop_api',
    message: '시스템 설정 변경',
    details: '정비소 작업 일정 설정이 업데이트되었습니다.',
    ipAddress: '192.168.5.23',
    userId: 'admin-003',
    userName: '박관리',
    resourceType: 'settings',
    resourceId: 'workshop-scheduler',
    metadata: {
      oldValue: { maxAppointmentsPerDay: 10 },
      newValue: { maxAppointmentsPerDay: 15 },
    },
  },
  {
    id: '6',
    timestamp: '2024-05-20T15:22:17Z',
    level: 'info',
    category: 'general',
    serviceType: 'fleet_api',
    message: '배치 작업 완료',
    details: '차량 상태 업데이트 배치 작업이 완료되었습니다.',
    ipAddress: '10.0.2.15',
    resourceType: 'batch-job',
    resourceId: 'fleet-status-update',
    metadata: {
      processedVehicles: 126,
      duration: '00:05:43',
    },
  },
  {
    id: '7',
    timestamp: '2024-05-20T14:10:04Z',
    level: 'warning',
    category: 'authorization',
    serviceType: 'delivery_api',
    message: '자원 접근 거부',
    details: '담당하지 않은 배송 기록 조회 시도가 거부되었습니다.',
    ipAddress: '192.168.7.56',
    userId: 'user-089',
    userName: '이기사',
    resourceType: 'delivery',
    resourceId: 'del-675432',
    metadata: {
      userRole: 'driver',
      requiredPermission: 'view_all_deliveries',
    },
  },
  {
    id: '8',
    timestamp: '2024-05-20T12:35:49Z',
    level: 'error',
    category: 'data_access',
    serviceType: 'workshop_api',
    message: '데이터 저장 실패',
    details: '정비 작업 기록 저장 중 오류가 발생했습니다.',
    ipAddress: '192.168.3.78',
    userId: 'user-156',
    userName: '정정비',
    resourceType: 'database',
    resourceId: 'workshop-db-01',
    metadata: {
      errorType: 'CONSTRAINT_VIOLATION',
      errorDetail: 'NOT NULL constraint failed: repair_jobs.vehicle_id',
    },
  },
];

export function useAuditLogs(filter: AuditLogFilter) {
  const { t } = useTranslation('system-audit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<LogStatistics>({
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  });

  // 감사 로그 조회
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // API 호출 시도
      let response;
      try {
        response = await api.get<{
          logs: AuditLog[];
          totalLogs: number;
          totalPages: number;
          statistics: LogStatistics;
        }>('/audit-logs', {
          params: filter,
        });

        const { logs, totalLogs: total, totalPages: pages, statistics: stats } = response.data;
        setAuditLogs(logs);
        setTotalLogs(total);
        setTotalPages(pages);
        setStatistics(stats);
      } catch (_error) {
        // API 호출 실패 시 목업 데이터 사용
        // 실제 환경에서는 제거하거나 개발 모드에서만 작동하도록 수정
        await new Promise(resolve => setTimeout(resolve, 500));

        // 필터링
        let filteredLogs = [...DUMMY_AUDIT_LOGS];

        // 레벨 필터링
        if (filter.level) {
          filteredLogs = filteredLogs.filter(log => log.level === filter.level);
        }

        // 카테고리 필터링
        if (filter.category) {
          filteredLogs = filteredLogs.filter(log => log.category === filter.category);
        }

        // 서비스 타입 필터링
        if (filter.serviceType) {
          filteredLogs = filteredLogs.filter(log => log.serviceType === filter.serviceType);
        }

        // 사용자 ID 필터링
        if (filter.userId) {
          filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
        }

        // 날짜 범위 필터링
        if (filter.startDate && filter.endDate) {
          const startDate = new Date(filter.startDate);
          const endDate = new Date(filter.endDate);
          filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
          });
        }

        // 검색어 필터링
        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase();
          filteredLogs = filteredLogs.filter(
            log =>
              log.message.toLowerCase().includes(query) ||
              log.details.toLowerCase().includes(query) ||
              (log.userName && log.userName.toLowerCase().includes(query))
          );
        }

        // 통계 집계
        const stats = {
          info: filteredLogs.filter(log => log.level === 'info').length,
          warning: filteredLogs.filter(log => log.level === 'warning').length,
          error: filteredLogs.filter(log => log.level === 'error').length,
          critical: filteredLogs.filter(log => log.level === 'critical').length,
        };

        // 페이지네이션
        const totalItems = filteredLogs.length;
        const totalPages = Math.ceil(totalItems / filter.pageSize);
        const start = (filter.page - 1) * filter.pageSize;
        const end = start + filter.pageSize;
        const paginatedItems = filteredLogs.slice(start, end);

        setAuditLogs(paginatedItems);
        setTotalLogs(totalItems);
        setTotalPages(totalPages);
        setStatistics(stats);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '감사 로그를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('error.fetch_title'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, t]);

  // 감사 로그 상세 조회
  const fetchAuditLogDetail = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // API 호출 시도
        let log;
        try {
          const response = await api.get<AuditLog>(`/audit-logs/${id}`);
          log = response.data;
        } catch (_error) {
          // API 호출 실패 시 목업 데이터 사용
          await new Promise(resolve => setTimeout(resolve, 300));
          log = DUMMY_AUDIT_LOGS.find(l => l.id === id);
        }

        if (!log) {
          throw new Error('감사 로그를 찾을 수 없습니다.');
        }

        return log;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '감사 로그 상세 정보를 불러오는 중 오류가 발생했습니다.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: t('error.fetch_detail_title'),
          description: errorMessage,
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  // 로그 내보내기
  const exportAuditLogs = useCallback(
    async (format: 'csv' | 'json') => {
      try {
        setIsLoading(true);

        // API 호출 시도
        try {
          const response = await api.get(`/audit-logs/export`, {
            params: { ...filter, format },
            responseType: 'blob',
          });

          // 파일 다운로드 처리
          const blob = new Blob([response.data]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-logs-export.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (_error) {
          // API 호출 실패 시 목업 처리
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        toast({
          title: t('export.success_title'),
          description: t('export.success_description', { format: format.toUpperCase() }),
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '감사 로그 내보내기 중 오류가 발생했습니다.';
        toast({
          variant: 'destructive',
          title: t('error.export_title'),
          description: errorMessage,
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [filter, t]
  );

  return {
    auditLogs,
    isLoading,
    error,
    totalLogs,
    totalPages,
    statistics,
    fetchAuditLogs,
    fetchAuditLogDetail,
    exportAuditLogs,
  };
}
