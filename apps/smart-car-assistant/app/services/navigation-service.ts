import axios from 'axios';

// API 엔드포인트 설정
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

// 내비게이션 API 클라이언트 생성
const navigationApi = axios.create({
  baseURL: `${API_BASE_URL}/navigation`,
  timeout: 10000,
});

// 위치 정보 타입 정의
export interface Location {
  id: string;
  name: string;
  address: string;
  distance?: number;
  type: 'poi' | 'address' | 'favorite';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// 경로 정보 타입 정의
export interface Route {
  originId: string;
  destinationId: string;
  distance: number;
  duration: number;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
    maneuver?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }>;
  polyline?: string; // 경로 표시를 위한 인코딩된 폴리라인
}

// API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// 장소 검색 API
export const searchLocations = async (query: string): Promise<Location[]> => {
  try {
    const response = await navigationApi.get<ApiResponse<Location[]>>('/search', {
      params: { query },
    });
    return response.data.data;
  } catch (error) {
    console.error('장소 검색 실패:', error);

    // 오류 발생 시 백업 데이터 사용
    return [
      { id: '1', name: '서울 정비소', address: '서울시 강남구 테헤란로 123', type: 'poi' as const },
      {
        id: '2',
        name: '부산 정비소',
        address: '부산시 해운대구 해운대로 456',
        type: 'poi' as const,
      },
      {
        id: '3',
        name: '광화문 자동차',
        address: '서울시 종로구 세종대로 123',
        type: 'poi' as const,
      },
    ].filter(location => location.name.includes(query) || location.address.includes(query));
  }
};

// 주변 정비소 검색 API
export const searchNearbyWorkshops = async (
  latitude: number,
  longitude: number,
  radius: number = 5 // 기본 5km 반경
): Promise<Location[]> => {
  try {
    const response = await navigationApi.get<ApiResponse<Location[]>>('/nearby-workshops', {
      params: { latitude, longitude, radius },
    });
    return response.data.data;
  } catch (error) {
    console.error('주변 정비소 검색 실패:', error);

    // 오류 발생 시 백업 데이터 사용
    return [
      {
        id: '10',
        name: '가까운 정비소 A',
        address: '서울시 강남구 논현동 123',
        distance: 1.2,
        type: 'poi',
      },
      {
        id: '11',
        name: '가까운 정비소 B',
        address: '서울시 강남구 역삼동 456',
        distance: 2.4,
        type: 'poi',
      },
      {
        id: '12',
        name: '가까운 정비소 C',
        address: '서울시 강남구 삼성동 789',
        distance: 3.6,
        type: 'poi',
      },
    ];
  }
};

// 경로 계산 API
export const calculateRoute = async (originId: string, destinationId: string): Promise<Route> => {
  try {
    const response = await navigationApi.get<ApiResponse<Route>>('/route', {
      params: { origin_id: originId, destination_id: destinationId },
    });
    return response.data.data;
  } catch (error) {
    console.error('경로 계산 실패:', error);

    // 오류 발생 시 백업 데이터 사용
    return {
      originId,
      destinationId,
      distance: 15.4,
      duration: 34,
      steps: [
        { instruction: '테헤란로를 따라 직진하세요', distance: 2.1, duration: 5 },
        { instruction: '강남대로에서 우회전하세요', distance: 0.8, duration: 3 },
        { instruction: '잠실대교를 건너세요', distance: 3.2, duration: 7 },
        { instruction: '올림픽대로를 따라 직진하세요', distance: 9.3, duration: 19 },
      ],
    };
  }
};

// 즐겨찾기 장소 API
export const getFavoriteLocations = async (): Promise<Location[]> => {
  try {
    const response = await navigationApi.get<ApiResponse<Location[]>>('/favorites');
    return response.data.data;
  } catch (error) {
    console.error('즐겨찾기 로드 실패:', error);

    // 오류 발생 시 백업 데이터 사용
    return [
      { id: '100', name: '집', address: '서울시 강동구 천호대로 123', type: 'favorite' },
      { id: '101', name: '회사', address: '서울시 강남구 테헤란로 456', type: 'favorite' },
      { id: '102', name: '단골정비소', address: '서울시 서초구 반포대로 789', type: 'favorite' },
    ];
  }
};

// 즐겨찾기 추가 API
export const addFavoriteLocation = async (location: Location): Promise<Location> => {
  try {
    const response = await navigationApi.post<ApiResponse<Location>>('/favorites', location);
    return response.data.data;
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
    throw error;
  }
};

// 즐겨찾기 제거 API
export const removeFavoriteLocation = async (locationId: string): Promise<void> => {
  try {
    await navigationApi.delete<ApiResponse<null>>(`/favorites/${locationId}`);
  } catch (error) {
    console.error('즐겨찾기 제거 실패:', error);
    throw error;
  }
};

export default {
  searchLocations,
  searchNearbyWorkshops,
  calculateRoute,
  getFavoriteLocations,
  addFavoriteLocation,
  removeFavoriteLocation,
};
