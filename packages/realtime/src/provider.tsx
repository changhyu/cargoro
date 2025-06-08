import React, { createContext, useContext, useEffect, useRef, PropsWithChildren } from 'react';
import {
  RealtimeClient,
  RealtimeClientConfig,
  createRealtimeClient,
  destroyRealtimeClient,
} from './client';
import { realtimeStore } from './store';
import { REALTIME_EVENTS } from './events';

interface RealtimeProviderProps extends PropsWithChildren {
  config: RealtimeClientConfig;
}

const RealtimeContext = createContext<RealtimeClient | null>(null);

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ config, children }) => {
  const clientRef = useRef<RealtimeClient | null>(null);

  useEffect(() => {
    // 클라이언트 생성
    const client = createRealtimeClient(config);
    clientRef.current = client;

    // 스토어와 이벤트 연결
    setupStoreListeners(client, realtimeStore);

    // 정리
    return () => {
      destroyRealtimeClient();
      realtimeStore.getState().reset();
    };
  }, []);

  return <RealtimeContext.Provider value={clientRef.current}>{children}</RealtimeContext.Provider>;
};

// 스토어 리스너 설정
function setupStoreListeners(client: RealtimeClient, store: typeof realtimeStore) {
  // 연결 상태
  client.on('connect', () => {
    store.getState().setConnectionStatus('connected');
  });

  client.on('disconnect', () => {
    store.getState().setConnectionStatus('disconnected');
  });

  client.on('reconnect', () => {
    store.getState().setConnectionStatus('reconnecting');
  });

  client.on('error', () => {
    store.getState().setConnectionStatus('error');
  });

  // 사용자 상태
  client.on('userOnline', userId => {
    store.getState().setUserOnline(userId);
  });

  client.on('userOffline', userId => {
    store.getState().setUserOffline(userId);
  });

  // 알림
  client.on('notification', notification => {
    store.getState().addNotification(notification);
  });

  // 메시지
  client.on('messageReceived', message => {
    store.getState().addMessage(message.roomId, message);
  });

  client.on('userTyping', ({ userId, roomId }) => {
    // 타이핑 사용자 업데이트 로직
    const currentTyping = store.getState().typingUsers[roomId] || [];
    if (!currentTyping.includes(userId)) {
      store.getState().setTypingUsers(roomId, [...currentTyping, userId]);

      // 3초 후 제거
      setTimeout(() => {
        const updatedTyping = store.getState().typingUsers[roomId] || [];
        store.getState().setTypingUsers(
          roomId,
          updatedTyping.filter(id => id !== userId)
        );
      }, 3000);
    }
  });

  // 배송 위치
  client.on('deliveryLocationUpdated', location => {
    store.getState().updateDeliveryLocation(location.deliveryId, location);
  });

  // 차량 위치
  client.on('vehicleLocationUpdated', location => {
    store.getState().updateVehicleLocation(location.vehicleId, location);
  });

  // 작업 업데이트
  client.on('workOrderUpdated', update => {
    store.getState().updateWorkOrder(update.workOrderId, update);
  });
}

// Context hook
export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within RealtimeProvider');
  }
  return context;
}
