import { useEffect, useRef, useCallback } from 'react';
import { RealtimeClient, getRealtimeClient } from './client';
import { useRealtimeStore } from './store';
import { RealtimeEvents } from './types';

// 실시간 클라이언트 훅
export function useRealtimeClient() {
  const client = getRealtimeClient();

  if (!client) {
    throw new Error('RealtimeClient not initialized. Please wrap your app with RealtimeProvider.');
  }

  return client;
}

// 실시간 이벤트 리스너 훅
export function useRealtimeEvent<K extends keyof RealtimeEvents>(
  event: K,
  callback: RealtimeEvents[K]
) {
  const client = useRealtimeClient();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => {
      (callbackRef.current as any)(...args);
    };

    client.on(event, handler);

    return () => {
      client.off(event, handler);
    };
  }, [client, event]);
}

// 실시간 룸 훅
export function useRealtimeRoom(roomId: string) {
  const client = useRealtimeClient();
  const store = useRealtimeStore();

  useEffect(() => {
    if (roomId) {
      client.joinRoom(roomId);

      return () => {
        client.leaveRoom(roomId);
      };
    }
  }, [client, roomId]);

  const sendMessage = useCallback(
    (message: string, attachments?: any[]) => {
      client.sendMessage(roomId, message, attachments);
    },
    [client, roomId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      client.sendTyping(roomId, isTyping);
    },
    [client, roomId]
  );

  const messages = useRealtimeStore(state => state.messages[roomId] || []);
  const typingUsers = useRealtimeStore(state => state.typingUsers[roomId] || []);
  const unreadCount = useRealtimeStore(state => state.unreadMessages[roomId] || 0);

  const markAsRead = useCallback(() => {
    store.markMessagesAsRead(roomId);
  }, [store, roomId]);

  return {
    messages,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTyping,
    markAsRead,
  };
}

// 실시간 연결 상태 훅
export function useRealtimeConnection() {
  const connectionStatus = useRealtimeStore(state => state.connectionStatus);
  const lastConnectedAt = useRealtimeStore(state => state.lastConnectedAt);
  const reconnectAttempts = useRealtimeStore(state => state.reconnectAttempts);
  const isConnected = useRealtimeStore(state => state.connectionStatus === 'connected');

  const client = useRealtimeClient();

  const connect = useCallback(() => {
    client.connect();
  }, [client]);

  const disconnect = useCallback(() => {
    client.disconnect();
  }, [client]);

  const reconnect = useCallback(() => {
    client.reconnect();
  }, [client]);

  return {
    connectionStatus,
    isConnected,
    lastConnectedAt,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect,
  };
}

// 실시간 알림 훅
export function useRealtimeNotifications() {
  const notifications = useRealtimeStore(state => state.notifications);
  const unreadCount = useRealtimeStore(state => state.unreadNotificationCount);
  const markAsRead = useRealtimeStore(state => state.markNotificationAsRead);
  const clear = useRealtimeStore(state => state.clearNotifications);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clear,
  };
}

// 실시간 위치 추적 훅
export function useRealtimeTracking(entityType: 'delivery' | 'vehicle', entityId: string) {
  const client = useRealtimeClient();
  const store = useRealtimeStore();

  const location =
    entityType === 'delivery'
      ? useRealtimeStore(state => state.deliveryLocations[entityId])
      : useRealtimeStore(state => state.vehicleLocations[entityId]);

  const updateLocation = useCallback(
    (locationData: {
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
    }) => {
      client.updateLocation(entityType, entityId, locationData);
    },
    [client, entityType, entityId]
  );

  // 위치 업데이트 구독
  useEffect(() => {
    const roomId = `${entityType}:${entityId}`;
    client.joinRoom(roomId);

    return () => {
      client.leaveRoom(roomId);
    };
  }, [client, entityType, entityId]);

  return {
    location,
    updateLocation,
  };
}

// 실시간 작업 상태 훅
export function useRealtimeWorkOrder(workOrderId: string) {
  const client = useRealtimeClient();
  const workOrderUpdate = useRealtimeStore(state => state.workOrderUpdates[workOrderId]);

  useEffect(() => {
    if (workOrderId) {
      const roomId = `workOrder:${workOrderId}`;
      client.joinRoom(roomId);

      return () => {
        client.leaveRoom(roomId);
      };
    }
  }, [client, workOrderId]);

  const updateStatus = useCallback(
    (status: string, data?: any) => {
      client.updateStatus('workOrder', workOrderId, status, data);
    },
    [client, workOrderId]
  );

  return {
    workOrderUpdate,
    updateStatus,
  };
}

// 실시간 온라인 상태 훅
export function useOnlineStatus(userId: string) {
  const isOnline = useRealtimeStore(state => state.onlineUsers.has(userId));

  return isOnline;
}

// 실시간 타이핑 인디케이터 훅
export function useTypingIndicator(roomId: string) {
  const client = useRealtimeClient();
  const typingUsers = useRealtimeStore(state => state.typingUsers[roomId] || []);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const startTyping = useCallback(() => {
    client.sendTyping(roomId, true);

    // 3초 후 자동으로 타이핑 중지
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      client.sendTyping(roomId, false);
    }, 3000);
  }, [client, roomId]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    client.sendTyping(roomId, false);
  }, [client, roomId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}
