import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useReportingStore } from './store';
import { ReportTemplate, GenerateReportRequest, ReportJob, ReportHistory } from './types';
import { reportingApi } from './api';
import { v4 as uuidv4 } from 'uuid';

/**
 * 보고서 템플릿 관리 훅
 */
export function useReportTemplates() {
  const {
    templates,
    activeTemplateId,
    setTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setActiveTemplate,
  } = useReportingStore();

  const queryClient = useQueryClient();

  // 템플릿 목록 조회
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      const response = await reportingApi.getTemplates();
      return response;
    },
  });

  // 템플릿 데이터가 변경되면 상태 업데이트
  React.useEffect(() => {
    if (data) {
      setTemplates(data);
    }
  }, [data, setTemplates]);

  // 템플릿 생성
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTemplate: ReportTemplate = {
        ...template,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await reportingApi.createTemplate(newTemplate);
      return response;
    },
  });

  // 템플릿 생성 성공 시 상태 업데이트
  React.useEffect(() => {
    if (createTemplateMutation.isSuccess && createTemplateMutation.data) {
      addTemplate(createTemplateMutation.data);
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    }
  }, [createTemplateMutation.isSuccess, createTemplateMutation.data, addTemplate, queryClient]);

  // 템플릿 저장
  const saveTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ReportTemplate> }) => {
      const response = await reportingApi.updateTemplate(id, updates);
      return response;
    },
  });

  // 템플릿 저장 성공 시 상태 업데이트
  React.useEffect(() => {
    if (saveTemplateMutation.isSuccess && saveTemplateMutation.data) {
      updateTemplate(saveTemplateMutation.data.id, saveTemplateMutation.data);
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    }
  }, [saveTemplateMutation.isSuccess, saveTemplateMutation.data, updateTemplate, queryClient]);

  // 템플릿 삭제
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await reportingApi.deleteTemplate(templateId);
      return templateId;
    },
  });

  // 템플릿 삭제 성공 시 상태 업데이트
  React.useEffect(() => {
    if (deleteTemplateMutation.isSuccess && deleteTemplateMutation.data) {
      deleteTemplate(deleteTemplateMutation.data);
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    }
  }, [deleteTemplateMutation.isSuccess, deleteTemplateMutation.data, deleteTemplate, queryClient]);

  return {
    templates,
    activeTemplateId,
    activeTemplate: templates.find(t => t.id === activeTemplateId),
    isPending,
    error,
    createTemplate: createTemplateMutation.mutate,
    saveTemplate: saveTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    duplicateTemplate,
    setActiveTemplate,
    refresh: refetch,
  };
}

/**
 * 보고서 생성 훅
 */
/**
 * 보고서 생성 훅 반환 타입
 */
export interface GenerateReportResult {
  jobId: string;
  job: ReportJob;
  response: any;
}

/**
 * 보고서 생성 훅
 */
export function useGenerateReport() {
  const { addJob, updateJob, addHistory, setGenerating } = useReportingStore();
  const [progress, setProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const generateMutation = useMutation<GenerateReportResult, Error, GenerateReportRequest>({
    mutationFn: async (request: GenerateReportRequest): Promise<GenerateReportResult> => {
      setGenerating(true);
      setProgress(0);

      // 작업 생성
      const job: ReportJob = {
        id: uuidv4(),
        templateId: request.templateId,
        parameters: request.parameters,
        status: 'queued',
        progress: 0,
        createdAt: new Date(),
        retryCount: 0,
      };

      addJob(job);
      setCurrentJobId(job.id);

      // 보고서 생성 요청
      const response = await reportingApi.generateReport(request, progress => {
        setProgress(progress);
        updateJob(job.id, { progress, status: 'processing' });
      });

      return { jobId: job.id, job, response };
    },
  });

  // 성공 시 상태 업데이트
  React.useEffect(() => {
    if (generateMutation.isSuccess && generateMutation.data) {
      const { job, response } = generateMutation.data;

      updateJob(job.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        result: response,
      });

      // 이력 추가
      const template = useReportingStore.getState().templates.find(t => t.id === job.templateId);

      if (template) {
        const history: ReportHistory = {
          id: uuidv4(),
          templateId: template.id,
          templateName: template.name,
          generatedBy: 'current-user', // 실제로는 현재 사용자 정보
          generatedAt: new Date(),
          parameters: job.parameters,
          format: response.url?.split('.').pop() || 'pdf',
          status: 'success',
          duration: Date.now() - job.createdAt.getTime(),
          downloadCount: 0,
        };

        addHistory(history);
      }

      setGenerating(false);
    }
  }, [generateMutation.isSuccess, generateMutation.data, updateJob, addHistory]);

  // 에러 처리
  React.useEffect(() => {
    if (generateMutation.isError && generateMutation.error) {
      const context = generateMutation.context as any;
      if (context && context.job) {
        updateJob(context.job.id, {
          status: 'failed',
          error: generateMutation.error.message,
          completedAt: new Date(),
        });
      }
      setGenerating(false);
    }
  }, [generateMutation.isError, generateMutation.error, updateJob]);

  // 개선된 generate 함수 - Promise를 반환
  const generate = useCallback(
    (request: GenerateReportRequest): Promise<GenerateReportResult> => {
      return new Promise((resolve, reject) => {
        generateMutation.mutate(request, {
          onSuccess: data => resolve(data),
          onError: error => reject(error),
        });
      });
    },
    [generateMutation]
  );

  return {
    generate,
    isGenerating: generateMutation.isPending,
    progress,
    error: generateMutation.error,
    currentJobId,
  };
}

/**
 * 보고서 작업 관리 훅
 */
export function useReportJobs() {
  const { jobs, activeJobId, setActiveJob, removeJob } = useReportingStore();

  const activeJob = jobs.find(j => j.id === activeJobId);
  const pendingJobs = jobs.filter(j => j.status === 'queued' || j.status === 'processing');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  const downloadReport = useCallback(
    async (jobId: string) => {
      const job = jobs.find(j => j.id === jobId);
      if (!job?.result?.url) return;

      try {
        const response = await fetch(job.result.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${job.id}.${job.result.url.split('.').pop()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('다운로드 실패:', error);
      }
    },
    [jobs]
  );

  const retryJob = useCallback(
    async (jobId: string) => {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      // 재시도 로직은 별도 구현 필요
      console.log('재시도 작업:', jobId);

      // 재시도 로직
      // generateMutation.mutate(request);
    },
    [jobs]
  );

  return {
    jobs,
    activeJob,
    pendingJobs,
    completedJobs,
    failedJobs,
    setActiveJob,
    removeJob,
    downloadReport,
    retryJob,
  };
}

/**
 * 보고서 이력 관리 훅
 */
export function useReportHistory() {
  const { history, clearHistory } = useReportingStore();

  const query = useQuery({
    queryKey: ['report-history'],
    queryFn: async () => {
      const response = await reportingApi.getHistory();
      return response;
    },
  });

  const downloadFromHistory = useCallback(
    async (historyId: string) => {
      const item = history.find(h => h.id === historyId);
      if (!item) return;

      try {
        const response = await reportingApi.downloadReport(historyId);
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.templateName}_${item.generatedAt.toISOString().split('T')[0]}.${item.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('다운로드 실패:', error);
      }
    },
    [history]
  );

  return {
    history: query.data || history,
    isPending: query.isPending,
    error: query.error,
    downloadFromHistory,
    clearHistory,
    refresh: query.refetch,
  };
}

/**
 * 보고서 템플릿 갤러리 훅
 */
export function useTemplateGallery() {
  const { galleryItems, setGalleryItems } = useReportingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['template-gallery', searchTerm, selectedCategory],
    queryFn: async () => {
      const response = await reportingApi.getTemplateGallery({
        search: searchTerm,
        category: selectedCategory,
      });
      return response;
    },
  });

  // 갤러리 데이터가 변경되면 상태 업데이트
  React.useEffect(() => {
    if (query.data) {
      setGalleryItems(query.data);
    }
  }, [query.data, setGalleryItems]);

  const installTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await reportingApi.installTemplate(templateId);
      return response;
    },
  });

  // 템플릿 설치 성공 시 갤러리 목록 새로고침
  React.useEffect(() => {
    if (installTemplate.isSuccess) {
      query.refetch();
    }
  }, [installTemplate.isSuccess, query]);

  const filteredItems = galleryItems.filter(item => {
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return {
    items: filteredItems,
    isPending: query.isPending,
    error: query.error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    installTemplate: installTemplate.mutate,
    isInstalling: installTemplate.isPending,
  };
}

/**
 * 보고서 예약 관리 훅
 */
export function useReportSchedule(templateId: string) {
  const template = useReportingStore(state => state.templates.find(t => t.id === templateId));

  const updateScheduleMutation = useMutation({
    mutationFn: async (schedule: ReportTemplate['schedule']) => {
      const response = await reportingApi.updateTemplateSchedule(templateId, schedule);
      return response;
    },
  });

  // 스케줄 업데이트 성공 시 상태 업데이트
  React.useEffect(() => {
    if (updateScheduleMutation.isSuccess && updateScheduleMutation.data) {
      useReportingStore
        .getState()
        .updateTemplate(templateId, { schedule: updateScheduleMutation.data });
    }
  }, [updateScheduleMutation.isSuccess, updateScheduleMutation.data, templateId]);

  const testSchedule = useCallback(async () => {
    if (!template?.schedule) return;

    try {
      await reportingApi.testSchedule(templateId);
      return true;
    } catch (error) {
      console.error('예약 테스트 실패:', error);
      return false;
    }
  }, [template, templateId]);

  return {
    schedule: template?.schedule,
    updateSchedule: updateScheduleMutation.mutate,
    isUpdating: updateScheduleMutation.isPending,
    testSchedule,
  };
}

/**
 * 보고서 미리보기 훅
 */
export function useReportPreview(templateId: string) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePreview = useCallback(
    async (parameters: Record<string, any>) => {
      setIsGenerating(true);

      try {
        const response = await reportingApi.generatePreview({
          templateId,
          parameters,
        });

        return response;
      } catch (error) {
        console.error('미리보기 생성 실패:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [templateId]
  );

  return {
    generatePreview,
    isGenerating,
  };
}
