// 실시간 이벤트 상수
export const REALTIME_EVENTS = {
  // 연결 이벤트
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  ERROR: 'error',

  // 사용자 이벤트
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',

  // 작업 이벤트
  WORK_ORDER_UPDATED: 'workOrder:updated',
  WORK_ORDER_ASSIGNED: 'workOrder:assigned',
  WORK_ORDER_STATUS_CHANGED: 'workOrder:statusChanged',

  // 예약 이벤트
  BOOKING_CREATED: 'booking:created',
  BOOKING_UPDATED: 'booking:updated',
  BOOKING_CANCELLED: 'booking:cancelled',

  // 배송 이벤트
  DELIVERY_LOCATION_UPDATED: 'delivery:locationUpdated',
  DELIVERY_STATUS_CHANGED: 'delivery:statusChanged',
  DELIVERY_COMPLETED: 'delivery:completed',

  // 알림 이벤트
  NOTIFICATION: 'notification',
  ALERT: 'alert',

  // 채팅 이벤트
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_READ: 'message:read',
  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',

  // 차량 추적 이벤트
  VEHICLE_LOCATION_UPDATED: 'vehicle:locationUpdated',
  VEHICLE_STATUS_CHANGED: 'vehicle:statusChanged',

  // 정비소 이벤트
  WORKSHOP_STATUS_CHANGED: 'workshop:statusChanged',
  TECHNICIAN_AVAILABILITY_CHANGED: 'technician:availabilityChanged',
} as const;

// 룸 타입
export const ROOM_TYPES = {
  WORKSHOP: 'workshop',
  DELIVERY: 'delivery',
  BOOKING: 'booking',
  VEHICLE: 'vehicle',
  CHAT: 'chat',
  SUPPORT: 'support',
} as const;

// 사용자 역할
export const USER_ROLES = {
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  TECHNICIAN: 'technician',
  WORKSHOP_MANAGER: 'workshop_manager',
  FLEET_MANAGER: 'fleet_manager',
  ADMIN: 'admin',
} as const;

// 연결 상태
export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
} as const;

export type RoomType = (typeof ROOM_TYPES)[keyof typeof ROOM_TYPES];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type ConnectionStatus = (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];
