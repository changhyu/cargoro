/**
 * 테스트 환경에서 사용되는 타입 보조 파일
 */

import { Vehicle, VehicleLocation } from './schema/vehicle';
import { ApiResponse } from './schema/api';

// 테스트 데이터 타입 확장
declare global {
  // 모킹 데이터를 위한 파셜 타입 정의
  type TestVehicle = Partial<Vehicle> & Record<string, any>;
  type TestVehicleLocation = Partial<VehicleLocation> & Record<string, any>;
  type TestApiResponse<T> = Partial<ApiResponse<T>> & Record<string, any>;
}

export {};
