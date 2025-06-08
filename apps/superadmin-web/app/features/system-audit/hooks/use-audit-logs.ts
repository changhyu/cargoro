'use client';

import { useCallback, useState, useEffect } from 'react';

import { useToast } from '@cargoro/ui';
import { useTranslation } from 'react-i18next';
// import { format } from 'date-fns'; // 향후 사용 예정
// import { ko } from 'date-fns/locale'; // 향후 사용 예정

import { AuditLog, AuditLogLevel, AuditCategory, ServiceType } from '../types';
import { generateMockAuditLogs } from '../utils/mock-data';

interface UseAuditLogsParams {
  page: number;
  pageSize: number;
  level?: AuditLogLevel;
  category?: AuditCategory;
  serviceType?: ServiceType;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

interface AuditLogStatistics {
  info: number;
  warning: number;
  error: number;
  critical: number;
  total: number;
}

interface UseAuditLogsReturn {
  auditLogs: AuditLog[];
  isLoading: boolean;
  totalLogs: number;
  totalPages: number;
  statistics: AuditLogStatistics;
  fetchAuditLogs: () => Promise<void>;
  exportAuditLogs: (format: 'csv' | 'json') => Promise<void>;
}

// 서비스 타입 목록 - 향후 사용 예정
// const SERVICES = Object.values(ServiceTypeValues);

// 카테고리 목록 - 향후 사용 예정
// const CATEGORIES = Object.values(AuditCategoryValues);

// 모든 로그 모킹 데이터
const ALL_MOCK_LOGS = generateMockAuditLogs(200);

export const useAuditLogsQuery = ({
  page,
  pageSize,
  level,
  category,
  serviceType,
  searchQuery,
  startDate,
  endDate,
}: UseAuditLogsParams): UseAuditLogsReturn => {
  const { t } = useTranslation('system-audit');
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statistics, setStatistics] = useState<AuditLogStatistics>({
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
    total: 0,
  });

  // 로그 필터링 함수
  const filterLogs = useCallback(
    (logs: AuditLog[]) => {
      return logs.filter(log => {
        // 레벨 필터
        if (level && log.level !== level) {
          return false;
        }

        // 카테고리 필터
        if (category && log.category !== category) {
          return false;
        }

        // 서비스 타입 필터
        if (serviceType && log.serviceType !== serviceType) {
          return false;
        }

        // 검색어 필터
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            log.message.toLowerCase().includes(query) ||
            log.details.toLowerCase().includes(query) ||
            log.userName?.toLowerCase().includes(query) ||
            (log.ipAddress ? log.ipAddress.toLowerCase().includes(query) : false)
          );
        }

        // 날짜 범위 필터
        if (startDate && endDate) {
          const logDate = new Date(log.timestamp);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return logDate >= start && logDate <= end;
        }

        return true;
      });
    },
    [level, category, serviceType, searchQuery, startDate, endDate]
  );

  // 로그 통계 계산 함수
  const calculateStatistics = useCallback((logs: AuditLog[]): AuditLogStatistics => {
    const stats = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
      total: logs.length,
    };

    logs.forEach(log => {
      switch (log.level) {
        case 'info':
          stats.info++;
          break;
        case 'warning':
          stats.warning++;
          break;
        case 'error':
          stats.error++;
          break;
        case 'critical':
          stats.critical++;
          break;
        default:
          break;
      }
    });

    return stats;
  }, []);

  // 로그 페이징 함수
  const paginateLogs = useCallback(
    (logs: AuditLog[]): AuditLog[] => {
      const startIndex = (page - 1) * pageSize;
      return logs.slice(startIndex, startIndex + pageSize);
    },
    [page, pageSize]
  );

  // 로그 조회 함수
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      // 실제로는 API 호출
      // const response = await fetch('/api/audit-logs');
      // const data = await response.json();

      // 모킹 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500));
      const filteredLogs = filterLogs(ALL_MOCK_LOGS);
      const stats = calculateStatistics(filteredLogs);

      setAuditLogs(paginateLogs(filteredLogs));
      setTotalLogs(filteredLogs.length);
      setTotalPages(Math.ceil(filteredLogs.length / pageSize));
      setStatistics(stats);
    } catch (error) {
      // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
      toast({
        title: t('errors.fetch_failed'),
        description: t('errors.try_again'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterLogs, calculateStatistics, paginateLogs, pageSize, toast, t]);

  // 로그 내보내기 함수
  const exportAuditLogs = useCallback(
    async (format: 'csv' | 'json') => {
      try {
        // 실제로는 API 호출
        // const response = await fetch(`/api/audit-logs/export?format=${format}`);
        // const blob = await response.blob();

        // 모킹 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 1000));
        const filteredLogs = filterLogs(ALL_MOCK_LOGS);

        let blob;
        let filename;

        if (format === 'json') {
          blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
            type: 'application/json',
          });
          filename = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
        } else {
          // CSV 포맷으로 변환
          const headers = [
            'ID',
            '타임스탬프',
            '레벨',
            '서비스',
            '카테고리',
            '메시지',
            '상세',
            'IP 주소',
            '사용자',
            '리소스 유형',
            '리소스 ID',
            '출처',
          ].join(',');

          const rows = filteredLogs.map(log => {
            return [
              log.id,
              log.timestamp,
              log.level,
              log.serviceType,
              log.category,
              `"${log.message.replace(/"/g, '""')}"`,
              `"${log.details.replace(/"/g, '""')}"`,
              log.ipAddress || '',
              log.userName || '',
              log.resourceType || '',
              log.resourceId || '',
              log.source || '',
            ].join(',');
          });

          blob = new Blob([`${headers}\n${rows.join('\n')}`], {
            type: 'text/csv',
          });
          filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        }

        // 다운로드 링크 생성 및 클릭
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: t('export.success'),
          description: t('export.file_ready'),
        });
      } catch (error) {
        // 에러 로깅은 프로덕션에서 별도 로깅 시스템으로 처리
        toast({
          title: t('export.failed'),
          description: t('errors.try_again'),
          variant: 'destructive',
        });
      }
    },
    [filterLogs, toast, t]
  );

  return {
    auditLogs,
    isLoading,
    totalLogs,
    totalPages,
    statistics,
    fetchAuditLogs,
    exportAuditLogs,
  };
};

interface UseDateFilteredAuditLogsProps {
  logs: AuditLog[];
  startDate?: Date;
  endDate?: Date;
}

export const useDateFilteredAuditLogs = ({
  logs,
  startDate,
  endDate,
}: UseDateFilteredAuditLogsProps) => {
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(logs);

  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter(log => {
      const logDate = new Date(log.timestamp);

      if (startDate && endDate) {
        return logDate >= startDate && logDate <= endDate;
      }

      if (startDate) {
        return logDate >= startDate;
      }

      if (endDate) {
        return logDate <= endDate;
      }

      return true;
    });

    setFilteredLogs(filtered);
  }, [logs, startDate, endDate]);

  return filteredLogs;
};

interface UseResourceAuditLogsProps {
  resourceType?: string;
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const useResourceAuditLogs = (props?: UseResourceAuditLogsProps) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // 실제로는 API 호출
        // const params = new URLSearchParams();
        // if (props?.resourceType) params.append('resourceType', props.resourceType);
        // if (props?.action) params.append('action', props.action);
        // if (props?.userId) params.append('userId', props.userId);
        // if (props?.startDate) params.append('startDate', props.startDate.toISOString());
        // if (props?.endDate) params.append('endDate', props.endDate.toISOString());
        // const response = await fetch(`/api/audit-logs?${params.toString()}`);
        // const data = await response.json();

        // 모킹 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockLogs = generateMockAuditLogs(20);

        // 필터링
        const filteredLogs = mockLogs.filter((log: AuditLog) => {
          if (props?.resourceType && log.resourceType !== props.resourceType) return false;
          if (props?.action && log.metadata?.actionType !== props.action) return false;
          if (props?.userId && log.userId !== props.userId) return false;

          // 날짜 필터링
          if (props?.startDate || props?.endDate) {
            const logDate = new Date(log.timestamp);

            if (props.startDate && props.endDate) {
              return logDate >= props.startDate && logDate <= props.endDate;
            } else if (props.startDate) {
              return logDate >= props.startDate;
            } else if (props.endDate) {
              return logDate <= props.endDate;
            }
          }

          return true;
        });

        setLogs(filteredLogs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
        toast({
          title: '감사 로그 불러오기 실패',
          description: '나중에 다시 시도해 주세요.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [props?.resourceType, props?.action, props?.userId, props?.startDate, props?.endDate, toast]);

  return { logs, isLoading, error };
};

// useAuditLogs 함수 내보내기
export { useAuditLogsQuery as useAuditLogs };
