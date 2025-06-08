// 운전자 상태 라벨
export const DRIVER_STATUS_LABEL = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지',
} as const;

// 운전면허 유형
export const LICENSE_TYPES = [
  { value: 'type-1', label: '1종 대형' },
  { value: 'type-2', label: '1종 보통' },
  { value: 'type-3', label: '2종 보통' },
  { value: 'motorcycle', label: '이륜차' },
] as const;

// 차량 상태
export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  IDLE: 'idle',
  MAINTENANCE: 'maintenance',
  OUT_OF_SERVICE: 'out_of_service',
} as const;

// 연료 타입 매핑
export const FUEL_TYPE_MAP = {
  가솔린: 'gasoline',
  디젤: 'diesel',
  전기: 'electric',
  하이브리드: 'hybrid',
} as const;

// 차량 상태 매핑
export const VEHICLE_STATUS_MAP = {
  inactive: 'out_of_service',
  pending: 'idle',
} as const;

// 예약 상태 텍스트
export const reservationTypeText = {
  rental: '렌탈',
  maintenance: '정비',
  inspection: '검사',
} as const;

// 사용자 역할
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
}

// 예약 상태
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}
