import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useAnalyticsStore } from './store';
import { DateRange, ReportConfig } from './types';
import { analyticsApi } from './api';
import { format } from 'date-fns';

// Type aliases for union types
type AnalyticsType = 'workshop' | 'delivery' | 'fleet' | 'financial';
type AnalyticsTypes = AnalyticsType[];

/**
 * 정비소 분석 데이터 훅
 */
export function useWorkshopAnalytics() {
  const { dateRange, filters, setWorkshopData, setLoading, setError } = useAnalyticsStore();

  const query = useQuery({
    queryKey: ['workshop-analytics', dateRange, filters],
    queryFn: async () => {
      const response = await analyticsApi.getWorkshopAnalytics(dateRange, filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (cacheTime -> gcTime)
  });

  useEffect(() => {
    setLoading(query.isLoading);
    if (query.data) {
      setWorkshopData(query.data);
      setError(null);
    }
    if (query.error) {
      setError((query.error as any).message || '데이터를 불러오는데 실패했습니다.');
    }
  }, [query.data, query.error, query.isLoading, setWorkshopData, setLoading, setError]);

  const refresh = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh,
  };
}

/**
 * 배송 분석 데이터 훅
 */
export function useDeliveryAnalytics() {
  const { dateRange, filters, setDeliveryData, setLoading, setError } = useAnalyticsStore();

  const query = useQuery({
    queryKey: ['delivery-analytics', dateRange, filters],
    queryFn: async () => {
      const response = await analyticsApi.getDeliveryAnalytics(dateRange, filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // cacheTime -> gcTime
  });

  useEffect(() => {
    setLoading(query.isLoading);
    if (query.data) {
      setDeliveryData(query.data);
      setError(null);
    }
    if (query.error) {
      setError((query.error as any).message || '데이터를 불러오는데 실패했습니다.');
    }
  }, [query.data, query.error, query.isLoading, setDeliveryData, setLoading, setError]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

/**
 * 차량 관리 분석 데이터 훅
 */
export function useFleetAnalytics() {
  const { dateRange, filters, setFleetData, setLoading, setError } = useAnalyticsStore();

  const query = useQuery({
    queryKey: ['fleet-analytics', dateRange, filters],
    queryFn: async () => {
      const response = await analyticsApi.getFleetAnalytics(dateRange, filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // cacheTime -> gcTime
  });

  useEffect(() => {
    setLoading(query.isLoading);
    if (query.data) {
      setFleetData(query.data);
      setError(null);
    }
    if (query.error) {
      setError((query.error as any).message || '데이터를 불러오는데 실패했습니다.');
    }
  }, [query.data, query.error, query.isLoading, setFleetData, setLoading, setError]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

/**
 * 재무 분석 데이터 훅
 */
export function useFinancialAnalytics() {
  const { dateRange, filters, setFinancialData, setLoading, setError } = useAnalyticsStore();

  const query = useQuery({
    queryKey: ['financial-analytics', dateRange, filters],
    queryFn: async () => {
      const response = await analyticsApi.getFinancialAnalytics(dateRange, filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // cacheTime -> gcTime
  });

  useEffect(() => {
    setLoading(query.isLoading);
    if (query.data) {
      setFinancialData(query.data);
      setError(null);
    }
    if (query.error) {
      setError((query.error as any).message || '데이터를 불러오는데 실패했습니다.');
    }
  }, [query.data, query.error, query.isLoading, setFinancialData, setLoading, setError]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

/**
 * 통합 분석 데이터 훅
 */
export function useAnalytics(types: AnalyticsTypes) {
  const workshop = useWorkshopAnalytics();
  const delivery = useDeliveryAnalytics();
  const fleet = useFleetAnalytics();
  const financial = useFinancialAnalytics();

  const analytics = {
    workshop: types.includes('workshop') ? workshop : null,
    delivery: types.includes('delivery') ? delivery : null,
    fleet: types.includes('fleet') ? fleet : null,
    financial: types.includes('financial') ? financial : null,
  };

  const isLoading = Object.values(analytics)
    .filter(Boolean)
    .some(a => a?.isLoading);

  const error = Object.values(analytics)
    .filter(Boolean)
    .find(a => a?.error)?.error;

  const refreshAll = useCallback(() => {
    Object.values(analytics)
      .filter(Boolean)
      .forEach(a => a?.refresh?.());
  }, [analytics]);

  return {
    ...analytics,
    isLoading,
    error,
    refreshAll,
  };
}

/**
 * 리포트 생성 훅
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      return await analyticsApi.generateReport(config); // response는 { url: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    generateReport: mutation.mutate,
    isGenerating: mutation.isPending, // isLoading -> isPending
    error: mutation.error,
  };
}

/**
 * 데이터 내보내기 훅
 */
export function useExportData() {
  const { dateRange, filters } = useAnalyticsStore();

  const exportToExcel = useCallback(
    async (dataType: AnalyticsType, fileName?: string) => {
      try {
        const response = await analyticsApi.exportData(dataType, dateRange, filters, 'excel');
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `${dataType}_analytics_${format(new Date(), 'yyyyMMdd')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    },
    [dateRange, filters]
  );

  const exportToPdf = useCallback(
    async (dataType: AnalyticsType, fileName?: string) => {
      try {
        const response = await analyticsApi.exportData(dataType, dateRange, filters, 'pdf');
        const blob = new Blob([response.data], { type: 'application/pdf' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `${dataType}_analytics_${format(new Date(), 'yyyyMMdd')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    },
    [dateRange, filters]
  );

  const exportToCsv = useCallback(
    async (dataType: AnalyticsType, fileName?: string) => {
      try {
        const response = await analyticsApi.exportData(dataType, dateRange, filters, 'csv');
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `${dataType}_analytics_${format(new Date(), 'yyyyMMdd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    },
    [dateRange, filters]
  );

  return {
    exportToExcel,
    exportToPdf,
    exportToCsv,
  };
}

/**
 * 실시간 데이터 업데이트 훅
 */
export function useRealtimeAnalytics(
  dataTypes: AnalyticsTypes,
  intervalMs: number = 30000 // 30초
) {
  const analytics = useAnalytics(dataTypes);

  useEffect(() => {
    const interval = setInterval(() => {
      analytics.refreshAll();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [analytics.refreshAll, intervalMs]);

  return analytics;
}

/**
 * 비교 분석 훅
 */
export function useComparativeAnalytics(dataType: AnalyticsType, compareDateRange: DateRange) {
  const { dateRange: currentDateRange, filters } = useAnalyticsStore();

  const getAnalyticsData = useCallback(
    async (dateRange: DateRange) => {
      switch (dataType) {
        case 'workshop':
          return (await analyticsApi.getWorkshopAnalytics(dateRange, filters)).data;
        case 'delivery':
          return (await analyticsApi.getDeliveryAnalytics(dateRange, filters)).data;
        case 'fleet':
          return (await analyticsApi.getFleetAnalytics(dateRange, filters)).data;
        case 'financial':
          return (await analyticsApi.getFinancialAnalytics(dateRange, filters)).data;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
    },
    [dataType, filters]
  );

  const currentQuery = useQuery({
    queryKey: [`${dataType}-analytics`, currentDateRange, filters],
    queryFn: () => getAnalyticsData(currentDateRange),
  });

  const compareQuery = useQuery({
    queryKey: [`${dataType}-analytics-compare`, compareDateRange, filters],
    queryFn: () => getAnalyticsData(compareDateRange),
  });

  return {
    current: currentQuery.data,
    compare: compareQuery.data,
    isLoading: currentQuery.isLoading || compareQuery.isLoading,
    error: currentQuery.error || compareQuery.error,
  };
}

/**
 * 대시보드 사용자 정의 훅
 */
export function useDashboardCustomization() {
  const { widgets, addWidget, updateWidget, removeWidget, reorderWidgets } = useAnalyticsStore();
  const queryClient = useQueryClient();

  const saveLayout = useMutation({
    mutationFn: async (widgets: any[]) => {
      await analyticsApi.saveDashboardLayout(widgets); // void 반환
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layout'] });
    },
  });

  const loadLayout = useQuery({
    queryKey: ['dashboard-layout'],
    queryFn: async () => {
      return await analyticsApi.getDashboardLayout(); // { widgets: DashboardWidget[] } 반환
    },
  });

  useEffect(() => {
    if (loadLayout.data?.widgets) {
      reorderWidgets(loadLayout.data.widgets);
    }
  }, [loadLayout.data, reorderWidgets]);

  return {
    widgets,
    addWidget,
    updateWidget,
    removeWidget,
    reorderWidgets,
    saveLayout: saveLayout.mutate,
    loadLayout: loadLayout.refetch,
    isSaving: saveLayout.isPending, // isLoading -> isPending
    isLoading: loadLayout.isLoading,
  };
}
