// 위치 추적 및 관리 유틸리티 함수
import { Driver } from '@cargoro/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// 위치 정보 타입 정의
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  driverId?: string; // 위치 데이터에 운전자 ID 추가
}

// API 클라이언트 인터페이스
export interface ApiClient {
  sendDriverLocation: (data: LocationData) => Promise<unknown>;
  getDriverProfile: (driverId: string) => Promise<Driver>;
}

// 기본 API 클라이언트 구현
export const defaultApiClient: ApiClient = {
  sendDriverLocation: async (_data: LocationData) => ({ success: true }),
  getDriverProfile: async (_driverId: string) => {
    return {
      id: 'default-id',
      name: '기본 운전자',
      email: 'default@example.com',
      phone: '010-0000-0000',
      licenseNumber: '00-00-000000-00',
      licenseExpiry: new Date().toISOString(),
      isActive: true,
    } as Driver;
  },
};

// 동적 import를 통한 API 클라이언트 로딩
let apiClient: ApiClient = defaultApiClient;

// 런타임에 API 클라이언트 로드
const loadApiClient = async () => {
  try {
    const module = await import('@cargoro/api-client');
    // @cargoro/api-client에서 직접 sendDriverLocation를 export하지 않으므로
    // apiClient.post를 사용하여 위치 데이터를 전송하도록 수정
    if (module && module.apiClient) {
      apiClient = {
        sendDriverLocation: async (data: LocationData) => {
          return module.apiClient.post(
            '/driver/location',
            data as unknown as Record<string, unknown>
          );
        },
        getDriverProfile: async (driverId: string) => {
          return module.apiClient.get<Driver>(`/driver/profile/${driverId}`);
        },
      };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('API 클라이언트 모듈 로딩 실패, 기본 구현 사용:', error);
  }
};

// 모듈 초기화
loadApiClient();

// API 클라이언트 설정 함수 (테스트 시 모킹을 위해 사용)
export const setApiClient = (client: ApiClient) => {
  apiClient = client;
};

// 위치 추적 subscription 저장
let locationSubscription: Location.LocationSubscription | null = null;

/**
 * 위치 추적 시작
 * @returns {Promise<void>}
 */
export const startLocationTracking = async (): Promise<void> => {
  try {
    // 위치 권한 요청
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('위치 권한이 거부되었습니다.');
    }

    // 백그라운드 위치 권한 요청 (필요한 경우)
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      // eslint-disable-next-line no-console
      console.warn('백그라운드 위치 권한이 거부되었습니다.');
    }

    // 기존 subscription이 있으면 제거
    if (locationSubscription) {
      locationSubscription.remove();
    }

    // 위치 추적 시작
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000, // 5초마다 업데이트
        distanceInterval: 10, // 10미터마다 업데이트
      },
      async location => {
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
          timestamp: location.timestamp,
          altitude: location.coords.altitude ?? undefined,
          altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
          heading: location.coords.heading ?? undefined,
          speed: location.coords.speed ?? undefined,
        };

        // 서버에 위치 업데이트 전송
        // eslint-disable-next-line no-console
        sendLocationUpdate(locationData).catch(console.error);

        // 마지막 위치 정보 저장
        // eslint-disable-next-line no-console
        AsyncStorage.setItem('lastLocation', JSON.stringify(locationData)).catch(console.error);
      }
    );

    // 위치 추적 상태 저장
    // eslint-disable-next-line no-console
    AsyncStorage.setItem('locationTrackingActive', 'true').catch(console.error);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('위치 추적 시작 실패:', error);
    throw error;
  }
};

/**
 * 위치 추적 중지
 */
export const stopLocationTracking = async (): Promise<void> => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
    // eslint-disable-next-line no-console
    await AsyncStorage.removeItem('locationTrackingActive').catch(console.error);
  }
};

/**
 * 현재 위치 가져오기
 * @returns {Promise<LocationData>} 현재 위치 정보
 */
export const getCurrentLocation = async (): Promise<LocationData> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('위치 권한이 거부되었습니다.');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? undefined,
      timestamp: location.timestamp,
      altitude: location.coords.altitude ?? undefined,
      altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
      heading: location.coords.heading ?? undefined,
      speed: location.coords.speed ?? undefined,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('현재 위치 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 위치 정보를 서버로 전송
 * @param {LocationData} locationData 위치 정보 데이터
 * @returns {Promise<unknown>} 서버 응답
 */
export const sendLocationUpdate = async (locationData: LocationData): Promise<unknown> => {
  try {
    return await apiClient.sendDriverLocation(locationData);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('위치 정보 전송 실패:', error);
    throw error;
  }
};

/**
 * 위치 트래커 훅
 */
export const useLocationTracking = () => {
  return {
    startLocationTracking,
    stopLocationTracking,
    getCurrentLocation,
    sendLocationUpdate,
  };
};

export default useLocationTracking;
