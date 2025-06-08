import { create } from 'zustand';
import { apiClient } from '@cargoro/api-client';

export interface WorkOrder {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleModel: string;
  vehicleMake: string;
  vehicleYear: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  services: ServiceItem[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: number;
  actualTime?: number;
  technicianId: string;
  technicianName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  estimatedTime: number;
  actualTime?: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  partsUsed?: PartUsed[];
}

export interface PartUsed {
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
}

export interface TodayStats {
  completed: number;
  inProgress: number;
  pending: number;
  totalHours: number;
  efficiency: number;
}

interface WorkOrderState {
  workOrders: WorkOrder[];
  currentWorkOrder: WorkOrder | null;
  todayStats: TodayStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWorkOrders: () => Promise<void>;
  fetchWorkOrderById: (id: string) => Promise<void>;
  fetchTodayStats: () => Promise<void>;
  startWorkOrder: (id: string) => Promise<void>;
  completeWorkOrder: (id: string, data: CompleteWorkOrderData) => Promise<void>;
  updateServiceStatus: (
    workOrderId: string,
    serviceId: string,
    status: ServiceItem['status']
  ) => Promise<void>;
  addPartsUsed: (workOrderId: string, serviceId: string, parts: PartUsed[]) => Promise<void>;
  reset: () => void;
}

interface CompleteWorkOrderData extends Record<string, unknown> {
  actualTime: number;
  notes?: string;
  servicesCompleted: {
    serviceId: string;
    actualTime: number;
    partsUsed: PartUsed[];
  }[];
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  workOrders: [],
  currentWorkOrder: null,
  todayStats: {
    completed: 0,
    inProgress: 0,
    pending: 0,
    totalHours: 0,
    efficiency: 0,
  },
  isLoading: false,
  error: null,

  fetchWorkOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<WorkOrder[]>('/work-orders/technician/my-orders');
      set({ workOrders: response, isLoading: false });
    } catch (error) {
      set({ error: '작업 목록을 불러오는데 실패했습니다.', isLoading: false });
      console.error('Error fetching work orders:', error);
    }
  },

  fetchWorkOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<WorkOrder>(`/work-orders/${id}`);
      set({ currentWorkOrder: response, isLoading: false });
    } catch (error) {
      set({ error: '작업 정보를 불러오는데 실패했습니다.', isLoading: false });
      console.error('Error fetching work order:', error);
    }
  },

  fetchTodayStats: async () => {
    try {
      const response = await apiClient.get<TodayStats>('/work-orders/technician/today-stats');
      set({ todayStats: response });
    } catch (error) {
      console.error('Error fetching today stats:', error);
      // 개발 모드에서는 더미 데이터 사용
      if (__DEV__) {
        set({
          todayStats: {
            completed: 5,
            inProgress: 2,
            pending: 3,
            totalHours: 6.5,
            efficiency: 85,
          },
        });
      }
    }
  },

  startWorkOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<WorkOrder>(`/work-orders/${id}/start`);

      // 작업 목록 업데이트
      const { workOrders } = get();
      const updatedWorkOrders = workOrders.map(order =>
        order.id === id
          ? { ...order, status: 'in_progress' as const, startedAt: new Date().toISOString() }
          : order
      );

      set({
        workOrders: updatedWorkOrders,
        currentWorkOrder: response,
        isLoading: false,
      });

      // 통계 다시 불러오기
      get().fetchTodayStats();
    } catch (error) {
      set({ error: '작업 시작에 실패했습니다.', isLoading: false });
      console.error('Error starting work order:', error);
    }
  },

  completeWorkOrder: async (id: string, data: CompleteWorkOrderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<WorkOrder>(`/work-orders/${id}/complete`, data);

      // 작업 목록 업데이트
      const { workOrders } = get();
      const updatedWorkOrders = workOrders.map(order =>
        order.id === id
          ? { ...order, status: 'completed' as const, completedAt: new Date().toISOString() }
          : order
      );

      set({
        workOrders: updatedWorkOrders,
        currentWorkOrder: null,
        isLoading: false,
      });

      // 통계 다시 불러오기
      get().fetchTodayStats();
    } catch (error) {
      set({ error: '작업 완료 처리에 실패했습니다.', isLoading: false });
      console.error('Error completing work order:', error);
    }
  },

  updateServiceStatus: async (
    workOrderId: string,
    serviceId: string,
    status: ServiceItem['status']
  ) => {
    try {
      await apiClient.put(`/work-orders/${workOrderId}/services/${serviceId}/status`, { status });

      // 현재 작업 정보 업데이트
      const { currentWorkOrder } = get();
      if (currentWorkOrder?.id === workOrderId) {
        const updatedServices = currentWorkOrder.services.map(service =>
          service.id === serviceId ? { ...service, status } : service
        );
        set({ currentWorkOrder: { ...currentWorkOrder, services: updatedServices } });
      }
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  },

  addPartsUsed: async (workOrderId: string, serviceId: string, parts: PartUsed[]) => {
    try {
      await apiClient.post(`/work-orders/${workOrderId}/services/${serviceId}/parts`, { parts });

      // 현재 작업 정보 업데이트
      const { currentWorkOrder } = get();
      if (currentWorkOrder?.id === workOrderId) {
        const updatedServices = currentWorkOrder.services.map(service =>
          service.id === serviceId
            ? { ...service, partsUsed: [...(service.partsUsed || []), ...parts] }
            : service
        );
        set({ currentWorkOrder: { ...currentWorkOrder, services: updatedServices } });
      }
    } catch (error) {
      console.error('Error adding parts:', error);
    }
  },

  reset: () => {
    set({
      workOrders: [],
      currentWorkOrder: null,
      todayStats: {
        completed: 0,
        inProgress: 0,
        pending: 0,
        totalHours: 0,
        efficiency: 0,
      },
      isLoading: false,
      error: null,
    });
  },
}));
