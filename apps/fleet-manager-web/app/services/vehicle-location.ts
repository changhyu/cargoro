import axios from 'axios';

// 차량 위치 정보 타입
export interface VehicleLocation {
  id: string;
  vehicleId: string;
  licensePlate?: string;
  latitude: number;
  longitude: number;
  timestamp: string; // ISO 8601 형식의 문자열
  speed: number;
  heading: number;
  accuracy?: number;
  address?: string;
  status: 'active' | 'idle' | 'offline';
}

export interface LocationUpdate {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

// API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  page?: number;
  per_page?: number;
  total_items?: number;
  total_pages?: number;
}

// API 기본 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 타임아웃 설정 (10초)
  timeout: 10000,
});

// 차량 위치 관련 서비스
export const vehicleLocationService = {
  async getVehicleLocations(): Promise<VehicleLocation[]> {
    // Mock implementation
    return [];
  },

  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation | null> {
    // Mock implementation
    return null;
  },

  async updateVehicleLocation(data: LocationUpdate): Promise<VehicleLocation> {
    // Mock implementation
    return {
      id: '1',
      vehicleId: data.vehicleId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date().toISOString(),
      speed: data.speed || 0,
      heading: data.heading || 0,
      accuracy: data.accuracy || 0,
      status: 'active',
    };
  },

  async getLocationHistory(vehicleId: string, from: Date, to: Date): Promise<VehicleLocation[]> {
    // Mock implementation
    return [];
  },
};
