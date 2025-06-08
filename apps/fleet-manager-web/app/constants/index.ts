// 차량 상태 레이블
export const VEHICLE_STATUS_LABEL: Record<string, string> = {
  active: '운행 중',
  maintenance: '정비 중',
  inactive: '미운행',
  pending: '배정 대기',
  retired: '폐차',
};

// 리스/렌트 계약 상태 레이블
export const LEASE_STATUS_LABEL: Record<string, string> = {
  active: '계약 중',
  pending: '승인 대기',
  completed: '계약 완료',
  cancelled: '계약 취소',
  expired: '기간 만료',
};

// 연료 유형
export const FUEL_TYPES = [
  { value: 'gasoline', label: '휘발유' },
  { value: 'diesel', label: '경유' },
  { value: 'lpg', label: 'LPG' },
  { value: 'electric', label: '전기' },
  { value: 'hybrid', label: '하이브리드' },
  { value: 'hydrogen', label: '수소' },
];

// 차량 유형
export const VEHICLE_TYPES = [
  { value: 'sedan', label: '승용차' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: '밴' },
  { value: 'truck', label: '트럭' },
  { value: 'bus', label: '버스' },
];

// 리스/렌트 제공사
export const LEASE_PROVIDERS = [
  '현대 캐피탈',
  'KB 캐피탈',
  'SK 렌터카',
  '롯데 렌탈',
  '쏘카',
  '그린카',
  '기타',
];

// 차량 상태 관련 상수
export const VEHICLE_STATUS = {
  ACTIVE: 'active' as const,
  IDLE: 'idle' as const,
  MAINTENANCE: 'maintenance' as const,
  OUT_OF_SERVICE: 'out_of_service' as const,
} as const;

export type VehicleStatus = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

// 운전자 상태 라벨
export const DRIVER_STATUS_LABEL = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지',
  on_duty: '근무중',
  off_duty: '비근무',
} as const;

// 면허 종류 상수
export const LICENSE_TYPES = [
  { value: 'type-1', label: '1종 대형' },
  { value: 'type-2', label: '1종 보통' },
  { value: 'type-3', label: '2종 보통' },
  { value: 'motorcycle', label: '이륜차' },
];

// 운전 제한사항 상수
export const DRIVING_RESTRICTIONS = [
  { value: 'glasses', label: '안경 착용' },
  { value: 'hearing_aid', label: '보청기 착용' },
  { value: 'no_night_driving', label: '야간 운전 금지' },
  { value: 'highway_restriction', label: '고속도로 제한' },
  { value: 'manual_only', label: '수동변속기만' },
  { value: 'automatic_only', label: '자동변속기만' },
];

// 운전자 관련 상수
export const DRIVER_STATUS_OPTIONS = [
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'suspended', label: '정지' },
] as const;

export const LICENSE_TYPE_OPTIONS = [
  { value: 'regular', label: '일반면허' },
  { value: 'commercial', label: '사업용면허' },
  { value: 'motorcycle', label: '이륜차면허' },
] as const;

export const DRIVER_DEPARTMENT_OPTIONS = [
  { value: 'delivery', label: '배송부' },
  { value: 'logistics', label: '물류부' },
  { value: 'maintenance', label: '정비부' },
  { value: 'management', label: '관리부' },
] as const;

export const DRIVER_POSITION_OPTIONS = [
  { value: 'driver', label: '운전사' },
  { value: 'senior_driver', label: '수석운전사' },
  { value: 'team_leader', label: '팀장' },
  { value: 'manager', label: '매니저' },
] as const;

// 예약 타입 텍스트
export const reservationTypeText = {
  maintenance: '정비',
  inspection: '검사',
  rental: '렌탈',
  delivery: '배송',
} as const;

// 예약 상태 텍스트
export const RESERVATION_STATUS_TEXT = {
  pending: '대기중',
  approved: '승인됨',
  rejected: '거절됨',
  cancelled: '취소됨',
  completed: '완료됨',
  in_progress: '진행중',
};

// 차량 상태 텍스트
export const VEHICLE_STATUS_TEXT = {
  active: '운행중',
  idle: '대기중',
  maintenance: '정비중',
  out_of_service: '운행중지',
  inactive: '비활성',
};

// 정비 상태 텍스트
export const MAINTENANCE_STATUS_TEXT = {
  pending: '대기',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
};

// 정비 유형 텍스트
export const MAINTENANCE_TYPE_TEXT = {
  scheduled: '정기점검',
  repair: '수리',
  inspection: '검사',
};

export const DEFAULT_PAGE_SIZE = 10;
