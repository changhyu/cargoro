// 실시간 이벤트 타입 정의
export interface RealtimeEvents {
  // 연결 관련 이벤트
  connect: () => void;
  disconnect: (reason: string) => void;
  reconnect: (attemptNumber: number) => void;
  error: (error: Error) => void;

  // 사용자 관련 이벤트
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  userTyping: (data: { userId: string; roomId: string }) => void;

  // 작업 관련 이벤트
  workOrderUpdated: (data: WorkOrderUpdate) => void;
  workOrderAssigned: (data: WorkOrderAssignment) => void;
  workOrderStatusChanged: (data: WorkOrderStatusChange) => void;

  // 예약 관련 이벤트
  bookingCreated: (data: BookingCreated) => void;
  bookingUpdated: (data: BookingUpdate) => void;
  bookingCancelled: (data: BookingCancellation) => void;

  // 배송 관련 이벤트
  deliveryLocationUpdated: (data: DeliveryLocationUpdate) => void;
  deliveryStatusChanged: (data: DeliveryStatusChange) => void;
  deliveryCompleted: (data: DeliveryCompletion) => void;
  etaUpdate: (data: { entityId: string; eta: string }) => void; // Added missing etaUpdate event

  // 알림 이벤트
  notification: (data: NotificationData) => void;
  alert: (data: AlertData) => void;

  // 채팅 이벤트
  messageReceived: (data: ChatMessage) => void;
  messageRead: (data: MessageReadStatus) => void;
  roomJoined: (data: RoomJoinData) => void;
  roomLeft: (data: RoomLeaveData) => void;

  // 차량 추적 이벤트
  vehicleLocationUpdated: (data: VehicleLocation) => void;
  vehicleStatusChanged: (data: VehicleStatusChange) => void;

  // 정비소 관련 이벤트
  workshopStatusChanged: (data: WorkshopStatusChange) => void;
  technicianAvailabilityChanged: (data: TechnicianAvailability) => void;
}

// 데이터 타입 정의
export interface WorkOrderUpdate {
  id: string;
  workOrderId: string;
  technicianId: string;
  status: string;
  progress: number;
  updatedAt: string;
  details?: any;
}

export interface WorkOrderAssignment {
  workOrderId: string;
  technicianId: string;
  technicianName: string;
  assignedAt: string;
}

export interface WorkOrderStatusChange {
  workOrderId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface BookingCreated {
  bookingId: string;
  customerId: string;
  workshopId: string;
  vehicleId: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
}

export interface BookingUpdate {
  bookingId: string;
  updates: Partial<BookingCreated>;
  updatedBy: string;
  updatedAt: string;
}

export interface BookingCancellation {
  bookingId: string;
  cancelledBy: string;
  cancelledAt: string;
  reason: string;
}

export interface DeliveryLocationUpdate {
  deliveryId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
}

export interface DeliveryStatusChange {
  deliveryId: string;
  previousStatus: string;
  newStatus: string;
  changedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface DeliveryCompletion {
  deliveryId: string;
  completedAt: string;
  signature?: string;
  photos?: string[];
  notes?: string;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
  readAt?: string;
  isRead?: boolean; // Added missing isRead property
}

export interface AlertData {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  data?: any;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  userId: string; // Added missing userId property
  message: string;
  attachments?: MessageAttachment[];
  createdAt: string;
}

export interface MessageAttachment {
  type: 'image' | 'file' | 'location';
  url?: string;
  name?: string;
  size?: number;
  latitude?: number;
  longitude?: number;
}

export interface MessageReadStatus {
  messageId: string;
  readBy: string;
  readAt: string;
}

export interface RoomJoinData {
  roomId: string;
  userId: string;
  userName: string;
  joinedAt: string;
}

export interface RoomLeaveData {
  roomId: string;
  userId: string;
  leftAt: string;
}

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
  timestamp: string;
}

export interface VehicleStatusChange {
  vehicleId: string;
  previousStatus: string;
  newStatus: string;
  changedAt: string;
  data?: any;
}

export interface WorkshopStatusChange {
  workshopId: string;
  isOpen: boolean;
  capacity: number;
  availableSlots: number;
  changedAt: string;
}

export interface TechnicianAvailability {
  technicianId: string;
  isAvailable: boolean;
  currentWorkOrders: number;
  maxWorkOrders: number;
  changedAt: string;
}

// events.ts에서 ConnectionStatus 타입 re-export
export type { ConnectionStatus } from './events';
