/**
 * 드라이버(탁송 기사) 타입 정의
 */

/**
 * 드라이버 기본 정보
 */
export interface Driver {
  /** 드라이버 고유 ID */
  id: string;

  /** 드라이버 이름 */
  name: string;

  /** 이메일 주소 */
  email: string;

  /** 전화번호 */
  phone: string;

  /** 운전면허 번호 */
  licenseNumber: string;

  /** 운전면허 유형 */
  licenseType?: string;

  /** 운전면허 만료일 */
  licenseExpiry: string;

  /** 활성 상태 */
  isActive: boolean;

  /** 제한 사항 */
  restrictions?: string[];

  /** 메모 */
  notes?: string;

  /** 할당된 차량 목록 */
  assignedVehicles?: string[];

  /** 비상 연락처 */
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  /** 주소 */
  address?: string;

  /** 생년월일 */
  birthDate?: string;

  /** 고용일 */
  hireDate?: string;

  /** 부서 */
  department?: string;

  /** 직위 */
  position?: string;

  /** 프로필 이미지 URL */
  profileImageUrl?: string;

  /** 계정 생성일 */
  createdAt?: string;

  /** 마지막 업데이트 날짜 */
  updatedAt?: string;
}

/**
 * 드라이버 생성 입력
 */
export interface CreateDriverInput {
  /** 드라이버 이름 */
  name: string;

  /** 이메일 주소 */
  email: string;

  /** 전화번호 */
  phone: string;

  /** 운전면허 번호 */
  licenseNumber: string;

  /** 운전면허 만료일 */
  licenseExpiry: string;

  /** 운전면허 유형 */
  licenseType?: string;

  /** 제한 사항 */
  restrictions?: string[];

  /** 메모 */
  notes?: string;

  /** 활성 상태 */
  isActive?: boolean;

  /** 부서 */
  department?: string;

  /** 직위 */
  position?: string;

  /** 비상 연락처 */
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

/**
 * 드라이버 업데이트 입력
 */
export interface UpdateDriverInput {
  /** 드라이버 이름 */
  name?: string;

  /** 이메일 주소 */
  email?: string;

  /** 전화번호 */
  phone?: string;

  /** 운전면허 번호 */
  licenseNumber?: string;

  /** 운전면허 만료일 */
  licenseExpiry?: string;

  /** 운전면허 유형 */
  licenseType?: string;

  /** 제한 사항 */
  restrictions?: string[];

  /** 메모 */
  notes?: string;

  /** 활성 상태 */
  isActive?: boolean;

  /** 부서 */
  department?: string;

  /** 직위 */
  position?: string;

  /** 비상 연락처 */
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

/**
 * 드라이버 필터
 */
export interface DriverFilters {
  /** 활성 상태 */
  isActive?: boolean;

  /** 운전면허 유형 */
  licenseType?: string;

  /** 부서 */
  department?: string;

  /** 검색어 */
  search?: string;

  /** 페이지 번호 */
  page?: number;

  /** 페이지 크기 */
  pageSize?: number;
}

/**
 * 드라이버 위치 정보
 */
export interface DriverLocation {
  /** 위도 */
  latitude: number;

  /** 경도 */
  longitude: number;

  /** 위치 정확도 (미터) */
  accuracy?: number;

  /** 타임스탬프 */
  timestamp: number;

  /** 고도 (미터) */
  altitude?: number;

  /** 고도 정확도 (미터) */
  altitudeAccuracy?: number;

  /** 진행 방향 (0-360도) */
  heading?: number;

  /** 속도 (미터/초) */
  speed?: number;
}

/**
 * 드라이버 상태 열거형
 */
export enum DriverStatus {
  /** 오프라인 (앱 종료 또는 로그아웃) */
  OFFLINE = 'OFFLINE',

  /** 온라인 (업무 가능) */
  AVAILABLE = 'AVAILABLE',

  /** 배송 중 */
  DELIVERING = 'DELIVERING',

  /** 휴식 중 */
  BREAK = 'BREAK',

  /** 일시 정지 (계정 문제 등) */
  SUSPENDED = 'SUSPENDED',
}

/**
 * 드라이버 배송 통계
 */
export interface DriverStats {
  /** 드라이버 ID */
  driverId: string;

  /** 총 배송 수 */
  totalDeliveries: number;

  /** 오늘 완료한 배송 수 */
  todayDeliveries: number;

  /** 총 주행 거리 (킬로미터) */
  totalDistance: number;

  /** 평균 배송 시간 (분) */
  averageDeliveryTime: number;

  /** 평균 고객 평점 (5점 만점) */
  averageRating: number;

  /** 통계 마지막 업데이트 시간 */
  lastUpdated: string;
}

/**
 * 드라이버 배송 기록
 */
export interface DeliveryHistory {
  /** 배송 ID */
  id: string;

  /** 드라이버 ID */
  driverId: string;

  /** 출발지 */
  origin: string;

  /** 목적지 */
  destination: string;

  /** 배송 시작 시간 */
  startTime: string;

  /** 배송 완료 시간 */
  endTime: string;

  /** 배송 상태 */
  status: DeliveryStatus;

  /** 고객 평점 (5점 만점) */
  customerRating?: number;

  /** 고객 피드백 */
  customerFeedback?: string;

  /** 주행 거리 (킬로미터) */
  distance: number;
}

/**
 * 배송 상태 열거형
 */
export enum DeliveryStatus {
  /** 할당됨 */
  ASSIGNED = 'ASSIGNED',

  /** 픽업 중 */
  PICKING_UP = 'PICKING_UP',

  /** 배송 중 */
  IN_TRANSIT = 'IN_TRANSIT',

  /** 배송 완료 */
  DELIVERED = 'DELIVERED',

  /** 배송 실패 */
  FAILED = 'FAILED',

  /** 취소됨 */
  CANCELED = 'CANCELED',
}
