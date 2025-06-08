/**
 * 애플리케이션 전역 상수 정의
 */

// 리스/렌트 계약 상태
export enum LEASE_STATUS {
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 리스/렌트 계약 상태 라벨
export const LEASE_STATUS_LABEL: Record<string, string> = {
  [LEASE_STATUS.ACTIVE]: '진행 중',
  [LEASE_STATUS.PENDING]: '대기 중',
  [LEASE_STATUS.COMPLETED]: '완료',
  [LEASE_STATUS.CANCELLED]: '취소',
};

// 차량 상태 - Vehicle 스키마와 일치하도록 수정
export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
  RESERVED: 'reserved',
  OUT_OF_SERVICE: 'out_of_service',
  IDLE: 'idle',
} as const;

// 차량 상태 라벨
export const VEHICLE_STATUS_LABEL: Record<string, string> = {
  [VEHICLE_STATUS.ACTIVE]: '운행 중',
  [VEHICLE_STATUS.AVAILABLE]: '이용 가능',
  [VEHICLE_STATUS.IN_USE]: '사용 중',
  [VEHICLE_STATUS.MAINTENANCE]: '정비 중',
  [VEHICLE_STATUS.INACTIVE]: '운행 불가',
  [VEHICLE_STATUS.RESERVED]: '예약됨',
  [VEHICLE_STATUS.OUT_OF_SERVICE]: '서비스 중단',
  [VEHICLE_STATUS.IDLE]: '대기 중',
};

// 그리드 레이아웃 타입
export enum GRID_LAYOUT {
  LIST = 'list',
  GRID = 'grid',
}

// Mapbox API 액세스 토큰
// 실제 프로젝트에서는 환경 변수로 설정하고 .env 파일에서 불러와야 합니다.
// 이 코드는 개발 목적으로만 사용하세요.
export const MAPBOX_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1Ijoib2ZmaWNpYWwtY2FyZ29ybyIsImEiOiJjbG5ldDVjc28xOGd0MnVzNmJ5NXJyNGRrIn0.q8rR7yHYfuZ7LgH4bpVumA';

// API 기본 URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// 페이지네이션 기본 설정
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZES = [5, 10, 20, 50, 100];

// 날짜 형식
export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
export const DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// 타임아웃 설정 (밀리초)
export const DEFAULT_API_TIMEOUT = 10000; // 10초

// 정렬 방향
export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// 차량 상태별 색상 - 업데이트된 상태에 맞춰 수정
export const VEHICLE_STATUS_COLORS = {
  active: '#4CAF50', // 녹색
  available: '#2196F3', // 파란색
  in_use: '#FF9800', // 주황색
  maintenance: '#FF5722', // 주황빨강
  inactive: '#9E9E9E', // 회색
  reserved: '#3F51B5', // 남색
  out_of_service: '#F44336', // 빨간색
  idle: '#FFC107', // 노란색
} as const;

// 로컬 스토리지 키
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  LAST_VIEW: 'last_view',
} as const;

// 시스템 설정
export const SYSTEM_CONFIG = {
  ITEMS_PER_PAGE: 10,
  MAX_FILE_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  DATE_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'yyyy-MM-dd HH:mm',
};

// API 엔드포인트
export const API_ENDPOINTS = {
  VEHICLES: '/api/vehicles',
  DRIVERS: '/api/drivers',
  LEASES: '/api/leases',
  MAINTENANCE: '/api/maintenance',
  EXPENSES: '/api/expenses',
  AUTH: '/api/auth',
  USERS: '/api/users',
};
