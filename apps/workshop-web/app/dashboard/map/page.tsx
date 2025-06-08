'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/app/components/ui/card';

// 동적 import로 지도 컴포넌트 불러오기 (SSR 비활성화)
const VehicleMap = dynamic(
  () =>
    import('@/app/features/vehicles/vehicle-tracking').then(mod => ({ default: mod.VehicleMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] animate-pulse items-center justify-center rounded-lg bg-gray-100">
        지도 로딩 중...
      </div>
    ),
  }
);

export default function MapPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [vehicles] = useState<Array<{ id: string; name: string }>>([
    { id: 'v-001', name: '차량 #1 (서울시 강남구)' },
    { id: 'v-002', name: '차량 #2 (서울시 종로구)' },
    { id: 'v-003', name: '차량 #3 (서울시 마포구)' },
    { id: 'v-004', name: '차량 #4 (경기도 성남시)' },
    { id: 'v-005', name: '차량 #5 (경기도 수원시)' },
  ]);

  useEffect(() => {
    if (vehicles?.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0]?.id || '');
    }
  }, [vehicles, selectedVehicleId]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">차량 위치 지도</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>차량 목록</CardTitle>
              <CardDescription>추적할 차량을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vehicles.map(vehicle => (
                  <div
                    key={vehicle.id}
                    className={`cursor-pointer rounded-md p-3 transition-colors ${
                      selectedVehicleId === vehicle.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                  >
                    {vehicle.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedVehicleId ? (
            <VehicleMap vehicleId={selectedVehicleId} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">차량을 선택해주세요</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
