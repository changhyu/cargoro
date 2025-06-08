import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'eventemitter3';
import { RealtimeEvents, ConnectionStatus } from './types';
import { REALTIME_EVENTS, CONNECTION_STATUS } from './events';

// NodeJS 타입은 @types/node에서 가져옴

export interface RealtimeClientConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  transports?: string[];
  debug?: boolean;
}

export class RealtimeClient extends EventEmitter<RealtimeEvents> {
  private socket: Socket | null = null;
  private config: RealtimeClientConfig;
  private connectionStatus: ConnectionStatus = CONNECTION_STATUS.DISCONNECTED;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribedRooms: Set<string> = new Set();
  private debug: boolean;

  constructor(config: RealtimeClientConfig) {
    super();

    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      debug: false,
      ...config,
    };

    this.debug = this.config.debug || false;

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  // 연결
  connect(): void {
    if (this.socket?.connected) {
      this.log('Already connected');
      return;
    }

    this.log('Connecting to', this.config.url);
    this.setConnectionStatus(CONNECTION_STATUS.CONNECTING);

    this.socket = io(this.config.url, {
      auth: {
        token: this.config.token,
      },
      transports: this.config.transports,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
    });

    this.setupEventListeners();
  }

  // 연결 해제
  disconnect(): void {
    if (this.socket) {
      this.log('Disconnecting');
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
    }
  }

  // 재연결
  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), this.config.reconnectionDelay);
  }

  // 이벤트 리스너 설정
  private setupEventListeners(): void {
    if (!this.socket) return;

    // 연결 이벤트
    this.socket.on('connect', () => {
      this.log('Connected');
      this.setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      this.emit('connect');

      // 구독했던 룸 재구독
      this.subscribedRooms.forEach(room => {
        this.joinRoom(room);
      });
    });

    this.socket.on('disconnect', reason => {
      this.log('Disconnected:', reason);
      this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', error => {
      this.log('Connection error:', error.message);
      this.setConnectionStatus(CONNECTION_STATUS.ERROR);
      this.emit('error', error);
    });

    // 실시간 이벤트 등록
    Object.entries(REALTIME_EVENTS).forEach(([key, event]) => {
      if (['CONNECT', 'DISCONNECT', 'RECONNECT', 'ERROR'].includes(key)) {
        return; // 이미 처리됨
      }

      this.socket!.on(event, (data: any) => {
        this.log(`Event ${event}:`, data);
        this.emit(event as keyof RealtimeEvents, data);
      });
    });
  }

  // 룸 참여
  joinRoom(roomId: string): void {
    if (!this.isConnected()) {
      this.log('Cannot join room: not connected');
      return;
    }

    this.log('Joining room:', roomId);
    this.socket!.emit('room:join', { roomId });
    this.subscribedRooms.add(roomId);
  }

  // 룸 나가기
  leaveRoom(roomId: string): void {
    if (!this.isConnected()) {
      return;
    }

    this.log('Leaving room:', roomId);
    this.socket!.emit('room:leave', { roomId });
    this.subscribedRooms.delete(roomId);
  }

  // 메시지 전송
  sendMessage(roomId: string, message: string, attachments?: any[]): void {
    if (!this.isConnected()) {
      this.log('Cannot send message: not connected');
      return;
    }

    this.socket!.emit('message:send', {
      roomId,
      message,
      attachments,
    });
  }

  // 타이핑 상태 전송
  sendTyping(roomId: string, isTyping: boolean): void {
    if (!this.isConnected()) {
      return;
    }

    this.socket!.emit('user:typing', {
      roomId,
      isTyping,
    });
  }

  // 위치 업데이트
  updateLocation(
    entityType: 'delivery' | 'vehicle',
    entityId: string,
    location: {
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
    }
  ): void {
    if (!this.isConnected()) {
      return;
    }

    this.socket!.emit(`${entityType}:updateLocation`, {
      [`${entityType}Id`]: entityId,
      ...location,
      timestamp: new Date().toISOString(),
    });
  }

  // 상태 업데이트
  updateStatus(entityType: string, entityId: string, status: string, data?: any): void {
    if (!this.isConnected()) {
      return;
    }

    this.socket!.emit(`${entityType}:updateStatus`, {
      [`${entityType}Id`]: entityId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // 알림 읽음 처리
  markNotificationAsRead(notificationId: string): void {
    if (!this.isConnected()) {
      return;
    }

    this.socket!.emit('notification:markAsRead', { notificationId });
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 연결 상태 가져오기
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // 연결 상태 설정
  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
  }

  // 로그
  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[RealtimeClient]', ...args);
    }
  }

  // 정리
  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
    this.subscribedRooms.clear();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// 싱글톤 인스턴스
let realtimeClientInstance: RealtimeClient | null = null;

// 싱글톤 팩토리
export function createRealtimeClient(config: RealtimeClientConfig): RealtimeClient {
  if (!realtimeClientInstance) {
    realtimeClientInstance = new RealtimeClient(config);
  }
  return realtimeClientInstance;
}

// 싱글톤 가져오기
export function getRealtimeClient(): RealtimeClient | null {
  return realtimeClientInstance;
}

// 싱글톤 제거
export function destroyRealtimeClient(): void {
  if (realtimeClientInstance) {
    realtimeClientInstance.destroy();
    realtimeClientInstance = null;
  }
}
