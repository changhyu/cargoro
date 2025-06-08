import axios from 'axios';
import {
  ReportTemplate,
  GenerateReportRequest,
  GenerateReportResponse,
  ReportHistory,
  TemplateGalleryItem,
  ReportPreview,
  ReportSchedule,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/reports`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(new Error(error.message || '서버 요청 오류'));
  }
);

export const reportingApi = {
  // 템플릿 관리
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get('/templates');
    return response.data;
  },

  async getTemplate(templateId: string): Promise<ReportTemplate> {
    const response = await apiClient.get(`/templates/${templateId}`);
    return response.data;
  },

  async createTemplate(template: ReportTemplate): Promise<ReportTemplate> {
    const response = await apiClient.post('/templates', template);
    return response.data;
  },

  async updateTemplate(
    templateId: string,
    updates: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    const response = await apiClient.put(`/templates/${templateId}`, updates);
    return response.data;
  },

  async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/templates/${templateId}`);
  },

  // 보고서 생성
  async generateReport(
    request: GenerateReportRequest,
    onProgress?: (progress: number) => void
  ): Promise<GenerateReportResponse> {
    // SSE(Server-Sent Events)를 사용한 진행률 추적
    if (request.async && onProgress) {
      const eventSource = new EventSource(
        `${API_BASE_URL}/api/reports/generate-stream?` +
          new URLSearchParams({
            templateId: request.templateId,
            parameters: JSON.stringify(request.parameters),
            format: request.format || 'pdf',
          })
      );

      return new Promise((resolve, reject) => {
        eventSource.onmessage = event => {
          try {
            const data = JSON.parse(event.data);

            if (data.progress) {
              onProgress(data.progress);
            }

            if (data.status === 'completed') {
              eventSource.close();
              resolve(data);
            } else if (data.status === 'failed') {
              eventSource.close();
              reject(new Error(data.error || '보고서 생성 실패'));
            }
          } catch (error) {
            eventSource.close();
            reject(new Error(error instanceof Error ? error.message : '보고서 생성 중 오류 발생'));
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          reject(new Error('보고서 생성 중 연결 오류 발생'));
        };

        // 5분 후 자동 타임아웃
        setTimeout(() => {
          eventSource.close();
          reject(new Error('보고서 생성 시간 초과'));
        }, 300000);
      });
    }

    // 동기 생성
    const response = await apiClient.post('/generate', request);
    return response.data;
  },

  // 보고서 미리보기
  async generatePreview(request: {
    templateId: string;
    parameters: Record<string, any>;
  }): Promise<ReportPreview> {
    const response = await apiClient.post('/preview', request);
    return response.data;
  },

  // 보고서 다운로드
  async downloadReport(reportId: string): Promise<any> {
    const response = await apiClient.get(`/download/${reportId}`, {
      responseType: 'blob',
    });
    return response;
  },

  // 이력 관리
  async getHistory(filters?: {
    templateId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<ReportHistory[]> {
    const response = await apiClient.get('/history', { params: filters });
    return response.data;
  },

  async deleteHistory(historyId: string): Promise<void> {
    await apiClient.delete(`/history/${historyId}`);
  },

  // 템플릿 갤러리
  async getTemplateGallery(filters?: {
    search?: string;
    category?: string | null;
    tags?: string[];
  }): Promise<TemplateGalleryItem[]> {
    const response = await apiClient.get('/gallery', { params: filters });
    return response.data;
  },

  async installTemplate(galleryItemId: string): Promise<ReportTemplate> {
    const response = await apiClient.post(`/gallery/${galleryItemId}/install`);
    return response.data;
  },

  // 예약 관리
  async updateTemplateSchedule(
    templateId: string,
    schedule?: ReportSchedule
  ): Promise<ReportSchedule | undefined> {
    const response = await apiClient.put(`/templates/${templateId}/schedule`, schedule);
    return response.data;
  },

  async testSchedule(templateId: string): Promise<void> {
    await apiClient.post(`/templates/${templateId}/schedule/test`);
  },

  // 데이터 소스
  async testDataSource(dataSource: {
    type: string;
    endpoint?: string;
    query?: string;
  }): Promise<any> {
    const response = await apiClient.post('/data-sources/test', dataSource);
    return response.data;
  },

  // 권한 관리
  async getTemplatePermissions(templateId: string): Promise<any[]> {
    const response = await apiClient.get(`/templates/${templateId}/permissions`);
    return response.data;
  },

  async updateTemplatePermissions(templateId: string, permissions: any[]): Promise<void> {
    await apiClient.put(`/templates/${templateId}/permissions`, { permissions });
  },

  // 통계
  async getReportStatistics(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<any> {
    const response = await apiClient.get('/statistics', { params: { period } });
    return response.data;
  },
};
