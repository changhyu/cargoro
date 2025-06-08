import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ReportTemplate,
  ReportJob,
  ReportHistory,
  ReportSettings,
  TemplateGalleryItem,
} from './types';

interface ReportingState {
  // 템플릿 관리
  templates: ReportTemplate[];
  activeTemplateId: string | null;

  // 작업 관리
  jobs: ReportJob[];
  activeJobId: string | null;

  // 실행 이력
  history: ReportHistory[];

  // 갤러리
  galleryItems: TemplateGalleryItem[];

  // 설정
  settings: ReportSettings;

  // 상태
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;

  // 액션 - 템플릿
  setTemplates: (templates: ReportTemplate[]) => void;
  addTemplate: (template: ReportTemplate) => void;
  updateTemplate: (templateId: string, updates: Partial<ReportTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  duplicateTemplate: (templateId: string) => void;
  setActiveTemplate: (templateId: string | null) => void;

  // 액션 - 작업
  addJob: (job: ReportJob) => void;
  updateJob: (jobId: string, updates: Partial<ReportJob>) => void;
  removeJob: (jobId: string) => void;
  setActiveJob: (jobId: string | null) => void;

  // 액션 - 이력
  addHistory: (history: ReportHistory) => void;
  clearHistory: () => void;

  // 액션 - 갤러리
  setGalleryItems: (items: TemplateGalleryItem[]) => void;

  // 액션 - 설정
  updateSettings: (settings: Partial<ReportSettings>) => void;

  // 액션 - 상태
  setGenerating: (isGenerating: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultSettings: ReportSettings = {
  defaultFormat: 'pdf',
  defaultOrientation: 'portrait',
  defaultPageSize: 'A4',
  watermark: {
    enabled: false,
    text: '',
    opacity: 0.1,
  },
  branding: {
    logo: '',
    companyName: 'CarGoro',
    website: 'https://cargoro.com',
  },
  emailTemplate: {
    subject: '[CarGoro] {{reportName}} - {{date}}',
    body: '안녕하세요,\n\n요청하신 보고서를 첨부해드립니다.\n\n감사합니다.\nCarGoro 팀',
  },
};

const initialState = {
  templates: [],
  activeTemplateId: null,
  jobs: [],
  activeJobId: null,
  history: [],
  galleryItems: [],
  settings: defaultSettings,
  isGenerating: false,
  isLoading: false,
  error: null,
};

export const useReportingStore = create<ReportingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 템플릿 관리
      setTemplates: templates => set({ templates }),

      addTemplate: template =>
        set(state => ({
          templates: [...state.templates, template],
        })),

      updateTemplate: (templateId, updates) =>
        set(state => ({
          templates: state.templates.map(t =>
            t.id === templateId ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        })),

      deleteTemplate: templateId =>
        set(state => ({
          templates: state.templates.filter(t => t.id !== templateId),
          activeTemplateId: state.activeTemplateId === templateId ? null : state.activeTemplateId,
        })),

      duplicateTemplate: templateId => {
        const template = get().templates.find(t => t.id === templateId);
        if (template) {
          const duplicated = {
            ...template,
            id: `${template.id}_copy_${Date.now()}`,
            name: `${template.name} (복사본)`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set(state => ({
            templates: [...state.templates, duplicated],
          }));
        }
      },

      setActiveTemplate: templateId => set({ activeTemplateId: templateId }),

      // 작업 관리
      addJob: job =>
        set(state => ({
          jobs: [job, ...state.jobs].slice(0, 100), // 최대 100개 유지
        })),

      updateJob: (jobId, updates) =>
        set(state => ({
          jobs: state.jobs.map(j => (j.id === jobId ? { ...j, ...updates } : j)),
        })),

      removeJob: jobId =>
        set(state => ({
          jobs: state.jobs.filter(j => j.id !== jobId),
          activeJobId: state.activeJobId === jobId ? null : state.activeJobId,
        })),

      setActiveJob: jobId => set({ activeJobId: jobId }),

      // 이력 관리
      addHistory: history =>
        set(state => ({
          history: [history, ...state.history].slice(0, 1000), // 최대 1000개 유지
        })),

      clearHistory: () => set({ history: [] }),

      // 갤러리 관리
      setGalleryItems: items => set({ galleryItems: items }),

      // 설정 관리
      updateSettings: settings =>
        set(state => ({
          settings: { ...state.settings, ...settings },
        })),

      // 상태 관리
      setGenerating: isGenerating => set({ isGenerating }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'reporting-storage',
      partialize: state => ({
        templates: state.templates,
        settings: state.settings,
        history: state.history.slice(0, 100), // 최근 100개만 저장
      }),
    }
  )
);
