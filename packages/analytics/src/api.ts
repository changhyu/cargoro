import axios from 'axios';
import {
  DateRange,
  AnalyticsFilter,
  WorkshopAnalytics,
  DeliveryAnalytics,
  FleetAnalytics,
  FinancialAnalytics,
  ReportConfig,
  AnalyticsResponse,
  DashboardWidget,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/analytics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 추가
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 인증 에러 처리
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const analyticsApi = {
  // 정비소 분석
  async getWorkshopAnalytics(
    dateRange: DateRange,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsResponse<WorkshopAnalytics>> {
    const response = await apiClient.get('/workshop', {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        ...filters,
      },
    });
    return response.data;
  },

  // 배송 분석
  async getDeliveryAnalytics(
    dateRange: DateRange,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsResponse<DeliveryAnalytics>> {
    const response = await apiClient.get('/delivery', {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        ...filters,
      },
    });
    return response.data;
  },

  // 차량 관리 분석
  async getFleetAnalytics(
    dateRange: DateRange,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsResponse<FleetAnalytics>> {
    const response = await apiClient.get('/fleet', {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        ...filters,
      },
    });
    return response.data;
  },

  // 재무 분석
  async getFinancialAnalytics(
    dateRange: DateRange,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsResponse<FinancialAnalytics>> {
    const response = await apiClient.get('/financial', {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        ...filters,
      },
    });
    return response.data;
  },

  // 리포트 생성
  async generateReport(config: ReportConfig): Promise<{ url: string }> {
    const response = await apiClient.post('/reports/generate', config);
    return response.data;
  },

  // 리포트 목록 조회
  async getReports(): Promise<ReportConfig[]> {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  // 데이터 내보내기
  async exportData(
    dataType: 'workshop' | 'delivery' | 'fleet' | 'financial',
    dateRange: DateRange,
    filters: AnalyticsFilter,
    format: 'excel' | 'pdf' | 'csv'
  ): Promise<any> {
    const response = await apiClient.get(`/${dataType}/export`, {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        format,
        ...filters,
      },
      responseType: 'blob',
    });
    return response;
  },

  // 대시보드 레이아웃 저장
  async saveDashboardLayout(widgets: DashboardWidget[]): Promise<void> {
    await apiClient.post('/dashboard/layout', { widgets });
  },

  // 대시보드 레이아웃 불러오기
  async getDashboardLayout(): Promise<{ widgets: DashboardWidget[] }> {
    const response = await apiClient.get('/dashboard/layout');
    return response.data;
  },

  // 실시간 메트릭 조회
  async getRealtimeMetrics(): Promise<any> {
    const response = await apiClient.get('/realtime/metrics');
    return response.data;
  },

  // 예측 분석
  async getPredictiveAnalytics(
    dataType: 'revenue' | 'demand' | 'maintenance',
    horizon: number = 30
  ): Promise<any> {
    const response = await apiClient.get(`/predictive/${dataType}`, {
      params: { horizon },
    });
    return response.data;
  },

  // 벤치마크 데이터
  async getBenchmarkData(industry: string = 'automotive'): Promise<any> {
    const response = await apiClient.get('/benchmark', {
      params: { industry },
    });
    return response.data;
  },
};
