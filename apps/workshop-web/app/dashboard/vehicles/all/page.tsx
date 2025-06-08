'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 동적 import로 지도 컴포넌트 불러오기 (SSR 비활성화)
const AllVehiclesMap = dynamic(
  () =>
    import('@/app/features/vehicles/vehicle-tracking').then(mod => ({
      default: mod.AllVehiclesMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] animate-pulse items-center justify-center rounded-lg bg-gray-100">
        지도 로딩 중...
      </div>
    ),
  }
);

// 테스트용 차량 데이터
const dummyVehicles = [
  {
    id: 'v-001',
    licensePlate: '서울 12가 3456',
    name: '차량 #1',
    latitude: 37.5665,
    longitude: 126.978,
    speed: 65,
    heading: 45,
    status: 'active' as const,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'v-002',
    licensePlate: '서울 34나 5678',
    name: '차량 #2',
    latitude: 37.56,
    longitude: 126.985,
    speed: 0,
    heading: 90,
    status: 'idle' as const,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'v-003',
    licensePlate: '서울 56다 7890',
    name: '차량 #3',
    latitude: 37.57,
    longitude: 126.972,
    speed: 0,
    heading: 0,
    status: 'maintenance' as const,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'v-004',
    licensePlate: '경기 78라 1234',
    name: '차량 #4',
    latitude: 37.5735,
    longitude: 126.99,
    speed: 0,
    heading: 180,
    status: 'out_of_service' as const,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'v-005',
    licensePlate: '경기 90마 3456',
    name: '차량 #5',
    latitude: 37.55,
    longitude: 126.965,
    speed: 42,
    heading: 270,
    status: 'active' as const,
    timestamp: new Date().toISOString(),
  },
];

export default function AllVehiclesPage() {
  const [vehicles, setVehicles] = useState(dummyVehicles);

  // 실제 구현에서는 API에서 차량 데이터를 가져옵니다
  useEffect(() => {
    // 임시 업데이트 - 위치 변경
    const interval = setInterval(() => {
      setVehicles(prev =>
        prev.map(vehicle => {
          // 운행 중인 차량만 위치 변경
          if (vehicle.status !== 'active') return vehicle;

          // 무작위로 약간의 위치 변경
          const latChange = (Math.random() - 0.5) * 0.005;
          const lngChange = (Math.random() - 0.5) * 0.005;

          return {
            ...vehicle,
            latitude: vehicle.latitude + latChange,
            longitude: vehicle.longitude + lngChange,
            speed: Math.floor(30 + Math.random() * 40),
            timestamp: new Date().toISOString(),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">모든 차량 위치</h1>
      <AllVehiclesMap vehicles={vehicles} height="600px" />
    </div>
  );
}
