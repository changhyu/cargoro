import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  ConnectionStatus,
  NotificationData,
  ChatMessage,
  DeliveryLocationUpdate,
  VehicleLocation,
  WorkOrderUpdate,
} from './types';
import { CONNECTION_STATUS } from './events';

interface RealtimeState {
  // 연결 상태
  connectionStatus: ConnectionStatus;
  lastConnectedAt: Date | null;
  reconnectAttempts: number;

  // 알림
  notifications: NotificationData[];
  unreadNotificationCount: number;

  // 채팅
  messages: Record<string, ChatMessage[]>; // roomId -> messages
  typingUsers: Record<string, string[]>; // roomId -> userIds
  unreadMessages: Record<string, number>; // roomId -> count

  // 위치 추적
  deliveryLocations: Record<string, DeliveryLocationUpdate>; // deliveryId -> location
  vehicleLocations: Record<string, VehicleLocation>; // vehicleId -> location

  // 작업 상태
  workOrderUpdates: Record<string, WorkOrderUpdate>; // workOrderId -> update

  // 온라인 사용자
  onlineUsers: Set<string>;

  // 액션
  setConnectionStatus: (status: ConnectionStatus) => void;
  addNotification: (notification: NotificationData) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;

  addMessage: (roomId: string, message: ChatMessage) => void;
  markMessagesAsRead: (roomId: string) => void;
  setTypingUsers: (roomId: string, users: string[]) => void;

  updateDeliveryLocation: (deliveryId: string, location: DeliveryLocationUpdate) => void;
  updateVehicleLocation: (vehicleId: string, location: VehicleLocation) => void;

  updateWorkOrder: (workOrderId: string, update: WorkOrderUpdate) => void;

  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;

  reset: () => void;
}

export const realtimeStore = create<RealtimeState>()(
  subscribeWithSelector((set, get) => ({
    // 초기 상태
    connectionStatus: CONNECTION_STATUS.DISCONNECTED,
    lastConnectedAt: null,
    reconnectAttempts: 0,
    notifications: [],
    unreadNotificationCount: 0,
    messages: {},
    typingUsers: {},
    unreadMessages: {},
    deliveryLocations: {},
    vehicleLocations: {},
    workOrderUpdates: {},
    onlineUsers: new Set(),

    // 연결 상태 설정
    setConnectionStatus: status => {
      set(state => ({
        connectionStatus: status,
        lastConnectedAt:
          status === CONNECTION_STATUS.CONNECTED ? new Date() : state.lastConnectedAt,
        reconnectAttempts:
          status === CONNECTION_STATUS.RECONNECTING ? state.reconnectAttempts + 1 : 0,
      }));
    },

    // 알림 추가
    addNotification: notification => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationCount: state.unreadNotificationCount + 1,
      }));
    },

    // 알림 읽음 처리
    markNotificationAsRead: notificationId => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        ),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
      }));
    },

    // 알림 삭제
    clearNotifications: () => {
      set({
        notifications: [],
        unreadNotificationCount: 0,
      });
    },

    // 메시지 추가
    addMessage: (roomId, message) => {
      set(state => ({
        messages: {
          ...state.messages,
          [roomId]: [...(state.messages[roomId] || []), message],
        },
        unreadMessages: {
          ...state.unreadMessages,
          [roomId]: (state.unreadMessages[roomId] || 0) + 1,
        },
      }));
    },

    // 메시지 읽음 처리
    markMessagesAsRead: roomId => {
      set(state => ({
        unreadMessages: {
          ...state.unreadMessages,
          [roomId]: 0,
        },
      }));
    },

    // 타이핑 사용자 설정
    setTypingUsers: (roomId, users) => {
      set(state => ({
        typingUsers: {
          ...state.typingUsers,
          [roomId]: users,
        },
      }));
    },

    // 배송 위치 업데이트
    updateDeliveryLocation: (deliveryId, location) => {
      set(state => ({
        deliveryLocations: {
          ...state.deliveryLocations,
          [deliveryId]: location,
        },
      }));
    },

    // 차량 위치 업데이트
    updateVehicleLocation: (vehicleId, location) => {
      set(state => ({
        vehicleLocations: {
          ...state.vehicleLocations,
          [vehicleId]: location,
        },
      }));
    },

    // 작업 업데이트
    updateWorkOrder: (workOrderId, update) => {
      set(state => ({
        workOrderUpdates: {
          ...state.workOrderUpdates,
          [workOrderId]: update,
        },
      }));
    },

    // 사용자 온라인 설정
    setUserOnline: userId => {
      set(state => ({
        onlineUsers: new Set([...state.onlineUsers, userId]),
      }));
    },

    // 사용자 오프라인 설정
    setUserOffline: userId => {
      set(state => {
        const newOnlineUsers = new Set(state.onlineUsers);
        newOnlineUsers.delete(userId);
        return { onlineUsers: newOnlineUsers };
      });
    },

    // 상태 초기화
    reset: () => {
      set({
        connectionStatus: CONNECTION_STATUS.DISCONNECTED,
        lastConnectedAt: null,
        reconnectAttempts: 0,
        notifications: [],
        unreadNotificationCount: 0,
        messages: {},
        typingUsers: {},
        unreadMessages: {},
        deliveryLocations: {},
        vehicleLocations: {},
        workOrderUpdates: {},
        onlineUsers: new Set(),
      });
    },
  }))
);

// Hook for React components
export const useRealtimeStore = realtimeStore;

// 선택자 (Selectors)
export const selectConnectionStatus = (state: RealtimeState) => state.connectionStatus;
export const selectIsConnected = (state: RealtimeState) =>
  state.connectionStatus === CONNECTION_STATUS.CONNECTED;
export const selectNotifications = (state: RealtimeState) => state.notifications;
export const selectUnreadNotificationCount = (state: RealtimeState) =>
  state.unreadNotificationCount;
export const selectMessages = (roomId: string) => (state: RealtimeState) =>
  state.messages[roomId] || [];
export const selectUnreadMessageCount = (roomId: string) => (state: RealtimeState) =>
  state.unreadMessages[roomId] || 0;
export const selectTypingUsers = (roomId: string) => (state: RealtimeState) =>
  state.typingUsers[roomId] || [];
export const selectDeliveryLocation = (deliveryId: string) => (state: RealtimeState) =>
  state.deliveryLocations[deliveryId];
export const selectVehicleLocation = (vehicleId: string) => (state: RealtimeState) =>
  state.vehicleLocations[vehicleId];
export const selectWorkOrderUpdate = (workOrderId: string) => (state: RealtimeState) =>
  state.workOrderUpdates[workOrderId];
export const selectIsUserOnline = (userId: string) => (state: RealtimeState) =>
  state.onlineUsers.has(userId);
