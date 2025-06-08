import { create } from 'zustand';
import { apiClient } from '@cargoro/api-client';

export interface Delivery {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleNumber: string;
  vehicleModel: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: string;
  actualTime?: string;
  distance: number;
  price: number;
  notes?: string;
  pickupPhotos?: string[];
  deliveryPhotos?: string[];
  signature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodayStats {
  completed: number;
  inProgress: number;
  pending: number;
  totalDistance: number;
  totalEarnings: number;
}

interface DeliveryState {
  deliveries: Delivery[];
  currentDelivery: Delivery | null;
  todayStats: TodayStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDeliveries: () => Promise<void>;
  fetchDeliveryById: (id: string) => Promise<void>;
  fetchTodayStats: () => Promise<void>;
  startDelivery: (id: string) => Promise<void>;
  completeDelivery: (id: string, data: CompleteDeliveryData) => Promise<void>;
  cancelDelivery: (id: string, reason: string) => Promise<void>;
  uploadPickupPhotos: (id: string, photos: string[]) => Promise<void>;
  uploadDeliveryPhotos: (id: string, photos: string[]) => Promise<void>;
  updateDeliveryLocation: (id: string, latitude: number, longitude: number) => Promise<void>;
  reset: () => void;
}

interface CompleteDeliveryData extends Record<string, unknown> {
  photos: string[];
  signature: string;
  notes?: string;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  currentDelivery: null,
  todayStats: {
    completed: 0,
    inProgress: 0,
    pending: 0,
    totalDistance: 0,
    totalEarnings: 0,
  },
  isLoading: false,
  error: null,

  fetchDeliveries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Delivery[]>('/deliveries/driver/my-deliveries');
      set({ deliveries: response, isLoading: false });
    } catch (error) {
      set({ error: '배송 목록을 불러오는데 실패했습니다.', isLoading: false });
      console.error('Error fetching deliveries:', error);
    }
  },

  fetchDeliveryById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Delivery>(`/deliveries/${id}`);
      set({ currentDelivery: response, isLoading: false });
    } catch (error) {
      set({ error: '배송 정보를 불러오는데 실패했습니다.', isLoading: false });
      console.error('Error fetching delivery:', error);
    }
  },

  fetchTodayStats: async () => {
    try {
      const response = await apiClient.get<TodayStats>('/deliveries/driver/today-stats');
      set({ todayStats: response });
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  },

  startDelivery: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Delivery>(`/deliveries/${id}/start`);

      // 배송 목록 업데이트
      const { deliveries } = get();
      const updatedDeliveries = deliveries.map(delivery =>
        delivery.id === id ? { ...delivery, status: 'in_progress' as const } : delivery
      );

      set({
        deliveries: updatedDeliveries,
        currentDelivery: response,
        isLoading: false,
      });
    } catch (error) {
      set({ error: '배송 시작에 실패했습니다.', isLoading: false });
      console.error('Error starting delivery:', error);
    }
  },

  completeDelivery: async (id: string, data: CompleteDeliveryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/deliveries/${id}/complete`, data);

      // 배송 목록 업데이트
      const { deliveries } = get();
      const updatedDeliveries = deliveries.map(delivery =>
        delivery.id === id ? { ...delivery, status: 'completed' as const } : delivery
      );

      set({
        deliveries: updatedDeliveries,
        currentDelivery: null,
        isLoading: false,
      });

      // 통계 다시 불러오기
      get().fetchTodayStats();
    } catch (error) {
      set({ error: '배송 완료 처리에 실패했습니다.', isLoading: false });
      console.error('Error completing delivery:', error);
    }
  },

  cancelDelivery: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/deliveries/${id}/cancel`, { reason });

      // 배송 목록 업데이트
      const { deliveries } = get();
      const updatedDeliveries = deliveries.map(delivery =>
        delivery.id === id ? { ...delivery, status: 'cancelled' as const } : delivery
      );

      set({
        deliveries: updatedDeliveries,
        currentDelivery: null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: '배송 취소에 실패했습니다.', isLoading: false });
      console.error('Error cancelling delivery:', error);
    }
  },

  uploadPickupPhotos: async (id: string, photos: string[]) => {
    try {
      await apiClient.post(`/deliveries/${id}/pickup-photos`, { photos });

      // 현재 배송 정보 업데이트
      const { currentDelivery } = get();
      if (currentDelivery?.id === id) {
        set({ currentDelivery: { ...currentDelivery, pickupPhotos: photos } });
      }
    } catch (error) {
      console.error('Error uploading pickup photos:', error);
    }
  },

  uploadDeliveryPhotos: async (id: string, photos: string[]) => {
    try {
      await apiClient.post(`/deliveries/${id}/delivery-photos`, { photos });

      // 현재 배송 정보 업데이트
      const { currentDelivery } = get();
      if (currentDelivery?.id === id) {
        set({ currentDelivery: { ...currentDelivery, deliveryPhotos: photos } });
      }
    } catch (error) {
      console.error('Error uploading delivery photos:', error);
    }
  },

  updateDeliveryLocation: async (id: string, latitude: number, longitude: number) => {
    try {
      await apiClient.post(`/deliveries/${id}/location`, { latitude, longitude });
    } catch (error) {
      console.error('Error updating delivery location:', error);
    }
  },

  reset: () => {
    set({
      deliveries: [],
      currentDelivery: null,
      todayStats: {
        completed: 0,
        inProgress: 0,
        pending: 0,
        totalDistance: 0,
        totalEarnings: 0,
      },
      isLoading: false,
      error: null,
    });
  },
}));
