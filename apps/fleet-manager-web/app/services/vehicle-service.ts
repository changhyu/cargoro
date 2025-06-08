/**
 * 차량 서비스
 *
 * 차량 관련 API 기능을 제공하는 서비스 모듈입니다.
 * 개선된 오류 처리 및 로깅 기능이 적용되었습니다.
 */

import { Vehicle, VehicleFilters, VehiclesResponse, VehicleLocation } from '../types/vehicle';

import apiService from './utils/api-service';
import logger from './utils/logger';

// 모의 차량 데이터 - 개발 및 테스트용
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vehicleId: 'V001',
    licensePlate: '서울 12가 3456',
    plateNumber: '서울 12가 3456',
    brand: '현대',
    make: '현대',
    model: '아반떼',
    year: 2022,
    type: 'sedan',
    status: 'active',
    fuelType: 'gasoline',
    vinNumber: 'KMHD041ABCD123456',
    vin: 'KMHD041ABCD123456',
    lastMaintenance: '2023-04-15',
    nextMaintenance: '2023-10-15',
    purchaseDate: '2022-01-10',
    registrationDate: '2022-01-15',
    insuranceExpiry: '2023-12-31',
    imageUrl: '/images/vehicles/avante.jpg',
    mileage: 15430,
    fuelLevel: 0.75,
    lastInspection: '2023-04-15',
    color: '흰색',
  },
  // ... 다른 차량 데이터
];

/**
 * 차량 서비스
 */
export const vehicleService = {
  /**
   * 차량 목록 조회
   * @param filters 조회 필터
   * @returns 차량 목록 및 페이지네이션 정보
   */
  async getVehicles(filters: VehicleFilters = {}): Promise<VehiclesResponse> {
    logger.debug('차량 목록 조회 요청', filters);

    try {
      // 실제 API 호출 (운영 환경)
      if (process.env.NODE_ENV === 'production') {
        return await apiService.get<VehiclesResponse>('/vehicles', { params: filters });
      }

      // 모의 응답 (개발 환경)
      logger.debug('개발 환경에서 모의 차량 데이터 사용');
      return {
        vehicles: mockVehicles,
        total: mockVehicles.length,
        pagination: {
          page: filters.page || 1,
          limit: filters.pageSize || 20,
          total: mockVehicles.length,
          totalPages: Math.ceil(mockVehicles.length / (filters.pageSize || 20)),
        },
      };
    } catch (error) {
      logger.error('차량 목록 조회 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 차량 상세 조회
   * @param id 차량 ID
   * @returns 차량 상세 정보
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    logger.debug(`차량 상세 조회 요청 (ID: ${id})`);

    try {
      // 실제 API 호출 (운영 환경)
      if (process.env.NODE_ENV === 'production') {
        return await apiService.get<Vehicle>(`/vehicles/${id}`);
      }

      // 모의 응답 (개발 환경)
      const vehicle = mockVehicles.find(v => v.id === id || v.vehicleId === id);

      if (!vehicle) {
        throw new Error(`차량을 찾을 수 없습니다 (ID: ${id})`);
      }

      return vehicle;
    } catch (error) {
      logger.error(`차량 상세 조회 중 오류 발생 (ID: ${id}):`, error);
      throw error;
    }
  },

  /**
   * 차량 생성
   * @param data 차량 데이터
   * @returns 생성된 차량 정보
   */
  async createVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    logger.debug('차량 생성 요청', data);

    try {
      // 실제 API 호출
      return await apiService.post<Vehicle>('/vehicles', data);
    } catch (error) {
      logger.error('차량 생성 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 차량 정보 업데이트
   * @param id 차량 ID
   * @param data 업데이트할 차량 데이터
   * @returns 업데이트된 차량 정보
   */
  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    logger.debug(`차량 업데이트 요청 (ID: ${id})`, data);

    try {
      // 실제 API 호출
      return await apiService.put<Vehicle>(`/vehicles/${id}`, data);
    } catch (error) {
      logger.error(`차량 업데이트 중 오류 발생 (ID: ${id}):`, error);
      throw error;
    }
  },

  /**
   * 차량 삭제
   * @param id 삭제할 차량 ID
   */
  async deleteVehicle(id: string): Promise<void> {
    logger.debug(`차량 삭제 요청 (ID: ${id})`);

    try {
      // 실제 API 호출
      await apiService.delete(`/vehicles/${id}`);
      logger.info(`차량 삭제 완료 (ID: ${id})`);
    } catch (error) {
      logger.error(`차량 삭제 중 오류 발생 (ID: ${id}):`, error);
      throw error;
    }
  },

  /**
   * 차량 위치 조회
   * @param id 차량 ID
   * @returns 차량 위치 정보
   */
  async getVehicleLocation(id: string): Promise<VehicleLocation> {
    logger.debug(`차량 위치 조회 요청 (ID: ${id})`);

    try {
      // 실제 API 호출
      return await apiService.get<VehicleLocation>(`/vehicles/${id}/location`);
    } catch (error) {
      logger.error(`차량 위치 조회 중 오류 발생 (ID: ${id}):`, error);
      throw error;
    }
  },
};
