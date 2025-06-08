import {
  NavigationLocation,
  NavigationRoute,
  VehicleDiagnosticData,
} from '../types/integrated-navigation';
import { USE_MOCK_DATA, API_BASE_URL, mockResponse } from '../config/app-config';

class IntegratedNavigationService {
  private readonly API_BASE_URL = API_BASE_URL;

  // 현재 위치 가져오기
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // 장소 검색
  async searchLocations(
    query: string,
    currentLocation?: { latitude: number; longitude: number }
  ): Promise<NavigationLocation[]> {
    // 모의 데이터 사용 설정이 켜져 있으면 항상 모의 데이터 반환
    if (USE_MOCK_DATA) {
      return mockResponse(this.getMockSearchResults(query));
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/navigation/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          currentLocation,
        }),
      });

      if (!response.ok) {
        throw new Error('장소 검색에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('장소 검색 오류:', error);
      // 임시 더미 데이터 반환
      return this.getMockSearchResults(query);
    }
  }

  // 주변 정비소 검색
  async searchNearbyWorkshops(
    location: { latitude: number; longitude: number },
    radius: number = 5000,
    serviceType?: string
  ): Promise<NavigationLocation[]> {
    // 모의 데이터 사용 설정이 켜져 있으면 항상 모의 데이터 반환
    if (USE_MOCK_DATA) {
      return mockResponse(this.getMockWorkshops(location));
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/navigation/workshops/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          radius,
          serviceType,
        }),
      });

      if (!response.ok) {
        throw new Error('주변 정비소 검색에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('주변 정비소 검색 오류:', error);
      return this.getMockWorkshops(location);
    }
  }

  // 경로 계산
  async calculateRoute(
    origin: NavigationLocation,
    destination: NavigationLocation
  ): Promise<NavigationRoute> {
    // 모의 데이터 사용 설정이 켜져 있으면 항상 모의 데이터 반환
    if (USE_MOCK_DATA) {
      return mockResponse(this.getMockRoute(origin, destination));
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/navigation/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });

      if (!response.ok) {
        throw new Error('경로 계산에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('경로 계산 오류:', error);
      return this.getMockRoute(origin, destination);
    }
  }

  // 차량 진단 데이터 가져오기
  async getVehicleDiagnostics(vehicleId: string): Promise<VehicleDiagnosticData> {
    // 모의 데이터 사용 설정이 켜져 있으면 항상 모의 데이터 반환
    if (USE_MOCK_DATA) {
      return mockResponse(this.getMockDiagnosticData(vehicleId));
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/vehicles/${vehicleId}/diagnostics`);

      if (!response.ok) {
        throw new Error('차량 진단 데이터를 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('차량 진단 데이터 오류:', error);
      return this.getMockDiagnosticData(vehicleId);
    }
  }

  // 즐겨찾기 위치 가져오기
  async getFavoriteLocations(): Promise<NavigationLocation[]> {
    // 모의 데이터 사용 설정이 켜져 있으면 항상 모의 데이터 반환
    if (USE_MOCK_DATA) {
      return mockResponse(this.getMockFavoriteLocations());
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/user/favorites`);

      if (!response.ok) {
        throw new Error('즐겨찾기를 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('즐겨찾기 가져오기 오류:', error);
      // 오류 발생 시 모의 데이터 반환
      return this.getMockFavoriteLocations();
    }
  }

  // 모의 즐겨찾기 데이터
  private getMockFavoriteLocations(): NavigationLocation[] {
    return [
      {
        id: 'fav1',
        name: '집',
        address: '서울시 강남구 테헤란로 123',
        latitude: 37.5026,
        longitude: 127.0246,
        category: 'general',
      },
      {
        id: 'fav2',
        name: '회사',
        address: '서울시 강남구 역삼로 456',
        latitude: 37.4969,
        longitude: 127.0378,
        category: 'general',
      },
      {
        id: 'fav3',
        name: '단골 정비소',
        address: '서울시 서초구 반포대로 789',
        latitude: 37.5043,
        longitude: 127.0144,
        category: 'workshop',
        rating: 4.8,
        phoneNumber: '02-1234-5678',
      },
    ];
  }

  // 즐겨찾기 추가
  async addFavoriteLocation(location: NavigationLocation): Promise<void> {
    // 모의 데이터 사용 설정이 켜져 있으면 실제 API 호출 없이 성공으로 처리
    if (USE_MOCK_DATA) {
      return mockResponse(undefined);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/user/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        throw new Error('즐겨찾기 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 추가 오류:', error);
      throw error;
    }
  }

  // Mock 데이터 메서드들
  private getMockSearchResults(query: string): NavigationLocation[] {
    return [
      {
        id: '1',
        name: `${query} 관련 장소 1`,
        address: '서울시 강남구 테헤란로 123',
        latitude: 37.5665,
        longitude: 126.978,
        category: 'general',
        rating: 4.5,
      },
      {
        id: '2',
        name: `${query} 관련 장소 2`,
        address: '서울시 강남구 역삼로 456',
        latitude: 37.5575,
        longitude: 127.0334,
        category: 'general',
        rating: 4.2,
      },
    ];
  }

  private getMockWorkshops(location: {
    latitude: number;
    longitude: number;
  }): NavigationLocation[] {
    return [
      {
        id: 'ws1',
        name: '스마트카 정비소',
        address: '서울시 강남구 논현로 789',
        latitude: location.latitude + 0.01,
        longitude: location.longitude + 0.01,
        category: 'workshop',
        rating: 4.8,
        distance: 1200,
        isOpen: true,
        phoneNumber: '02-1234-5678',
      },
      {
        id: 'ws2',
        name: '24시간 자동차 병원',
        address: '서울시 강남구 강남대로 321',
        latitude: location.latitude - 0.008,
        longitude: location.longitude + 0.015,
        category: 'workshop',
        rating: 4.6,
        distance: 1800,
        isOpen: true,
        phoneNumber: '02-2345-6789',
      },
    ];
  }

  private getMockRoute(
    origin: NavigationLocation,
    destination: NavigationLocation
  ): NavigationRoute {
    const distance =
      Math.sqrt(
        Math.pow(destination.latitude - origin.latitude, 2) +
          Math.pow(destination.longitude - origin.longitude, 2)
      ) * 111000; // 대략적인 미터 계산

    return {
      id: 'route1',
      origin,
      destination,
      distance: Math.round(distance),
      duration: Math.round(distance / 30), // 대략 30m/s 속도로 계산
      polyline: 'mock_polyline_data',
      trafficStatus: 'normal',
    };
  }

  private getMockDiagnosticData(vehicleId: string): VehicleDiagnosticData {
    return {
      vehicleId,
      timestamp: new Date(),
      engineStatus: 'good',
      batteryLevel: 85,
      fuelLevel: 65,
      mileage: 12500, // 누락된 필드 추가
      oilPressure: 45,
      coolantTemperature: 90,
      tirePressure: {
        frontLeft: 32,
        frontRight: 31,
        rearLeft: 30,
        rearRight: 32,
      },
      diagnosticCodes: [],
      maintenanceRecommendations: [
        {
          id: 'rec1',
          type: 'oil_change',
          severity: 'medium',
          description: '다음 정기점검 시 엔진오일 교체를 권장합니다.',
          estimatedCost: 80000,
          mileageLimit: 10000,
        },
      ],
    };
  }
}

export default new IntegratedNavigationService();
