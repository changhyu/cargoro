import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DateRange,
  AnalyticsFilter,
  DashboardWidget,
  ReportConfig,
  AlertConfig,
  WorkshopAnalytics,
  DeliveryAnalytics,
  FleetAnalytics,
  FinancialAnalytics,
} from './types';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

interface AnalyticsState {
  // 필터 상태
  dateRange: DateRange;
  filters: AnalyticsFilter;

  // 데이터 캐시
  workshopData: WorkshopAnalytics | null;
  deliveryData: DeliveryAnalytics | null;
  fleetData: FleetAnalytics | null;
  financialData: FinancialAnalytics | null;

  // 대시보드 설정
  widgets: DashboardWidget[];
  activeWidgetId: string | null;

  // 리포트 설정
  reports: ReportConfig[];

  // 알림 설정
  alerts: AlertConfig[];

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  setDateRange: (dateRange: DateRange) => void;
  setDatePreset: (preset: DateRange['preset']) => void;
  setFilters: (filters: Partial<AnalyticsFilter>) => void;
  resetFilters: () => void;

  setWorkshopData: (data: WorkshopAnalytics) => void;
  setDeliveryData: (data: DeliveryAnalytics) => void;
  setFleetData: (data: FleetAnalytics) => void;
  setFinancialData: (data: FinancialAnalytics) => void;

  addWidget: (widget: DashboardWidget) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (widgets: DashboardWidget[]) => void;

  addReport: (report: ReportConfig) => void;
  updateReport: (reportId: string, updates: Partial<ReportConfig>) => void;
  removeReport: (reportId: string) => void;

  addAlert: (alert: AlertConfig) => void;
  updateAlert: (alertId: string, updates: Partial<AlertConfig>) => void;
  removeAlert: (alertId: string) => void;
  triggerAlert: (alertId: string) => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const getPresetDateRange = (preset: DateRange['preset']): { start: Date; end: Date } => {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };
    case 'last7days':
      return {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
      };
    case 'last30days':
      return {
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now),
      };
    case 'thisMonth':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case 'lastMonth':
      const lastMonth = subDays(startOfMonth(now), 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    case 'thisYear':
      return {
        start: startOfYear(now),
        end: endOfDay(now),
      };
    default:
      return {
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now),
      };
  }
};

const initialDateRange = getPresetDateRange('last30days');

const initialState = {
  dateRange: { ...initialDateRange, preset: 'last30days' as const },
  filters: {
    dateRange: { ...initialDateRange, preset: 'last30days' as const },
    groupBy: 'day' as const,
  },
  workshopData: null,
  deliveryData: null,
  fleetData: null,
  financialData: null,
  widgets: [],
  activeWidgetId: null,
  reports: [],
  alerts: [],
  isLoading: false,
  error: null,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, _get) => ({
      ...initialState,

      // 날짜 범위 관리
      setDateRange: dateRange =>
        set(state => ({
          dateRange,
          filters: { ...state.filters, dateRange },
        })),

      setDatePreset: preset => {
        const dateRange = getPresetDateRange(preset);
        set(state => ({
          dateRange: { ...dateRange, preset },
          filters: { ...state.filters, dateRange: { ...dateRange, preset } },
        }));
      },

      // 필터 관리
      setFilters: filters =>
        set(state => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () =>
        set({
          filters: initialState.filters,
        }),

      // 데이터 설정
      setWorkshopData: data => set({ workshopData: data }),
      setDeliveryData: data => set({ deliveryData: data }),
      setFleetData: data => set({ fleetData: data }),
      setFinancialData: data => set({ financialData: data }),

      // 위젯 관리
      addWidget: widget =>
        set(state => ({
          widgets: [...state.widgets, widget],
        })),

      updateWidget: (widgetId, updates) =>
        set(state => ({
          widgets: state.widgets.map(w => (w.id === widgetId ? { ...w, ...updates } : w)),
        })),

      removeWidget: widgetId =>
        set(state => ({
          widgets: state.widgets.filter(w => w.id !== widgetId),
          activeWidgetId: state.activeWidgetId === widgetId ? null : state.activeWidgetId,
        })),

      reorderWidgets: widgets => set({ widgets }),

      // 리포트 관리
      addReport: report =>
        set(state => ({
          reports: [...state.reports, report],
        })),

      updateReport: (reportId, updates) =>
        set(state => ({
          reports: state.reports.map(r => (r.id === reportId ? { ...r, ...updates } : r)),
        })),

      removeReport: reportId =>
        set(state => ({
          reports: state.reports.filter(r => r.id !== reportId),
        })),

      // 알림 관리
      addAlert: alert =>
        set(state => ({
          alerts: [...state.alerts, alert],
        })),

      updateAlert: (alertId, updates) =>
        set(state => ({
          alerts: state.alerts.map(a => (a.id === alertId ? { ...a, ...updates } : a)),
        })),

      removeAlert: alertId =>
        set(state => ({
          alerts: state.alerts.filter(a => a.id !== alertId),
        })),

      triggerAlert: alertId =>
        set(state => ({
          alerts: state.alerts.map(a =>
            a.id === alertId ? { ...a, lastTriggered: new Date() } : a
          ),
        })),

      // 상태 관리
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'analytics-storage',
      partialize: state => ({
        dateRange: state.dateRange,
        filters: state.filters,
        widgets: state.widgets,
        reports: state.reports,
        alerts: state.alerts,
      }),
    }
  )
);
