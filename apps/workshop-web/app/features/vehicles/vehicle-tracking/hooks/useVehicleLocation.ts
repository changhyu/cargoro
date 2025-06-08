import { useQuery } from '@tanstack/react-query';
import { VehicleLocationData, VehicleLocationError } from '../types';
import { LocationStatus } from '@cargoro/types/schema/vehicle';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: {
    location: T;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// API 호출 함수
const fetchVehicleLocation = async (vehicleId: string): Promise<VehicleLocationData> => {
  const response = await fetch(`/api/vehicles/${vehicleId}/location`);

  if (!response.ok) {
    const errorData = (await response.json()) as ApiResponse<never>;
    throw {
      code: errorData.error?.code || 'UNKNOWN_ERROR',
      message: errorData.error?.message || '차량 위치 정보를 불러오는데 실패했습니다.',
    };
  }

  const data = (await response.json()) as ApiResponse<VehicleLocationData>;

  // API 응답의 상태값 매핑 (클라이언트 내부 타입 변환)
  // 만약 API 응답에서 string으로 상태값이 오는 경우 열거형으로 변환
  if (data.data?.location) {
    const location = data.data.location;

    // 문자열로 오는 상태값을 LocationStatus 열거형으로 변환
    if (typeof location.status === 'string') {
      switch (location.status as string) {
        case 'moving':
          location.status = LocationStatus.ACTIVE;
          break;
        case 'idle':
          location.status = LocationStatus.IDLE;
          break;
        case 'stopped':
          location.status = LocationStatus.OUT_OF_SERVICE;
          break;
        default:
          // 알 수 없는 상태는 ACTIVE로 기본값 설정
          location.status = LocationStatus.ACTIVE;
      }
    }
  }

  return data.data!.location;
};

/**
 * 차량의 실시간 위치 정보를 조회하는 훅
 * @param vehicleId 차량 ID
 * @returns 차량 위치 데이터, 로딩 상태, 오류
 */
export function useVehicleLocation(vehicleId: string) {
  return useQuery<VehicleLocationData, VehicleLocationError>({
    queryKey: ['vehicleLocation', vehicleId],
    queryFn: () => fetchVehicleLocation(vehicleId),
    refetchInterval: 10000, // 10초마다 갱신
    staleTime: 5000, // 5초 동안 최신 상태 유지
  });
}
