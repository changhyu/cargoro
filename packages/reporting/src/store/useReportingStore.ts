import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ReportTemplate, ReportHistory } from '../types';

// 임시 타입 정의 (types.ts에 없는 타입들)
interface ReportSchedule {
  id: string;
  templateId: string;
  frequency: string;
  nextRun: Date;
  status: 'active' | 'inactive';
}

interface ReportingState {
  // 상태
  templates: ReportTemplate[];
  scheduledReports: ReportSchedule[];
  reportHistory: ReportHistory[];
  isGenerating: boolean;
  selectedTemplate: ReportTemplate | null;

  // 액션
  setTemplates: (templates: ReportTemplate[]) => void;
  setScheduledReports: (reports: ReportSchedule[]) => void;
  setReportHistory: (history: ReportHistory[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setSelectedTemplate: (template: ReportTemplate | null) => void;

  // 예약된 보고서 관리
  addScheduledReport: (report: ReportSchedule) => void;
  removeScheduledReport: (reportId: string) => void;
  updateScheduledReport: (reportId: string, updates: Partial<ReportSchedule>) => void;

  // 보고서 이력 관리
  addReportToHistory: (report: ReportHistory) => void;
  clearHistory: () => void;
}

export const useReportingStore = create<ReportingState>()(
  devtools(
    set => ({
      // 초기 상태
      templates: [],
      scheduledReports: [],
      reportHistory: [],
      isGenerating: false,
      selectedTemplate: null,

      // 기본 액션
      setTemplates: templates => set({ templates }),
      setScheduledReports: reports => set({ scheduledReports: reports }),
      setReportHistory: history => set({ reportHistory: history }),
      setIsGenerating: isGenerating => set({ isGenerating }),
      setSelectedTemplate: template => set({ selectedTemplate: template }),

      // 예약된 보고서 관리
      addScheduledReport: report =>
        set(state => ({
          scheduledReports: [...state.scheduledReports, report],
        })),

      removeScheduledReport: reportId =>
        set(state => ({
          scheduledReports: state.scheduledReports.filter(r => r.id !== reportId),
        })),

      updateScheduledReport: (reportId, updates) =>
        set(state => ({
          scheduledReports: state.scheduledReports.map(r =>
            r.id === reportId ? { ...r, ...updates } : r
          ),
        })),

      // 보고서 이력 관리
      addReportToHistory: report =>
        set(state => ({
          reportHistory: [report, ...state.reportHistory],
        })),

      clearHistory: () => set({ reportHistory: [] }),
    }),
    {
      name: 'reporting-storage',
    }
  )
);
