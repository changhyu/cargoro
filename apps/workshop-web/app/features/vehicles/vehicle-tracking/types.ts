/**
 * 차량 위치 추적 기능에 필요한 타입 정의
 */
import { LocationStatus } from '@cargoro/types/schema/vehicle';

// 차량 위치 데이터 타입
export interface VehicleLocationData {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  status: LocationStatus;
}

// 차량 위치 API 응답 타입
export interface VehicleLocationResponse {
  location: VehicleLocationData;
}

// 차량 위치 조회 오류 타입
export type VehicleLocationError = {
  code: string;
  message: string;
};

// 차량 위치 이력 항목 타입
export interface VehicleLocationHistoryItem extends VehicleLocationData {
  id: string;
}

// 차량 위치 이력 조회 응답 타입
export interface VehicleLocationHistoryResponse {
  history: VehicleLocationHistoryItem[];
  total: number;
}

// 차량 위치 이력 조회 필터 타입
export interface VehicleLocationHistoryFilter {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}
