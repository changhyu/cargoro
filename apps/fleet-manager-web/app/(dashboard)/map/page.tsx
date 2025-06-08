'use client';

import React, { useState } from 'react';
import { RequireAuth } from '@cargoro/auth/components/RequireAuth';

import VehicleMap, { VehicleLocation } from '../../components/vehicle-map';

// 모의 차량 위치 데이터 (API 연동 전까지 사용)
const mockVehicles: VehicleLocation[] = [
  {
    id: '1',
    vehicleId: 'v001',
    licensePlate: '서울 123가 4567',
    latitude: 37.5665,
    longitude: 126.978,
    heading: 45,
    speed: 60,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: '2',
    vehicleId: 'v002',
    licensePlate: '서울 456나 7890',
    latitude: 37.5525,
    longitude: 126.9685,
    heading: 180,
    speed: 0,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'idle',
  },
  {
    id: '3',
    vehicleId: 'v003',
    licensePlate: '서울 789다 1234',
    latitude: 37.5775,
    longitude: 126.9865,
    heading: 270,
    speed: 0,
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    status: 'offline',
  },
];

export default function MapPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 차량 클릭 핸들러
  const handleVehicleClick = (vehicle: VehicleLocation) => {
    setSelectedVehicle(vehicle);
  };

  // 새로고침 핸들러 (실제 구현에서는 API 호출)
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <RequireAuth roles={['fleet_manager']}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">차량 위치 추적</h1>
          <button
            onClick={handleRefresh}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? '로딩 중...' : '위치 새로고침'}
          </button>
        </div>

        <div className="h-[calc(100vh-200px)] overflow-hidden rounded-lg bg-gray-100 shadow-md">
          <VehicleMap vehicles={mockVehicles} height="100%" onVehicleClick={handleVehicleClick} />
        </div>

        {selectedVehicle && (
          <div className="rounded-lg bg-white p-4 shadow-md">
            <h2 className="mb-2 text-lg font-semibold">
              {selectedVehicle.licensePlate || '차량 정보 없음'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">차량 ID</p>
                <p>{selectedVehicle.vehicleId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">상태</p>
                <p>
                  {selectedVehicle.status === 'active'
                    ? '운행 중'
                    : selectedVehicle.status === 'idle'
                      ? '대기 중'
                      : '운행 불가'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">최종 위치 업데이트</p>
                <p>{new Date(selectedVehicle.timestamp).toLocaleString('ko-KR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">현재 속도</p>
                <p>{selectedVehicle.speed || 0} km/h</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
