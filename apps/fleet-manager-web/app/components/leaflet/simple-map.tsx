'use client';

import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { Button, useToast } from '@cargoro/ui';

// 지도 컴포넌트를 위한 타입 정의
interface VehicleLocation {
  id: string;
  vehicleId: string;
  licensePlate: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  status: 'active' | 'idle' | 'maintenance' | 'out_of_service';
}

interface SimpleMapProps {
  vehicles?: VehicleLocation[];
  height?: string | number;
  onVehicleClick?: (vehicle: VehicleLocation) => void;
  className?: string;
}

// 현재는 모의 구현을 제공하는 간단한 지도 컴포넌트
export default function SimpleMap({
  vehicles = [],
  height = 500,
  onVehicleClick,
  className = '',
}: SimpleMapProps) {
  const { toast } = useToast();

  // 실제 지도 로딩 실패를 사용자에게 알림
  React.useEffect(() => {
    toast({
      title: '지도 로딩 실패',
      description: '지도를 불러오는 중 오류가 발생했습니다. 현재 개발팀에서 수정 중입니다.',
      variant: 'destructive',
    });
  }, [toast]);

  return (
    <div
      className={`relative bg-gray-100 ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AlertTriangle className="mb-4 h-16 w-16 text-amber-500" />
        <h2 className="mb-2 text-xl font-semibold">지도 로드 실패</h2>
        <p className="mb-4 max-w-md text-center text-gray-600">
          지도 컴포넌트를 로드하는 중 오류가 발생했습니다.
          <br />
          현재 개발팀에서 문제를 해결 중입니다.
        </p>

        <div className="mb-8">
          <Button variant="outline" className="flex items-center">
            <RefreshCcw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        </div>

        <div className="max-w-md rounded-lg bg-white p-4 shadow-md">
          <h3 className="mb-2 font-medium">차량 목록 요약 ({vehicles.length}대)</h3>
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center rounded-full bg-green-100 px-2 py-1 text-sm text-green-700">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
              운행 중: {vehicles.filter(v => v.status === 'active').length}대
            </div>
            <div className="flex items-center rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-700">
              <div className="mr-1 h-2 w-2 rounded-full bg-blue-500"></div>
              대기 중: {vehicles.filter(v => v.status === 'idle').length}대
            </div>
            <div className="flex items-center rounded-full bg-yellow-100 px-2 py-1 text-sm text-yellow-700">
              <div className="mr-1 h-2 w-2 rounded-full bg-yellow-500"></div>
              정비 중: {vehicles.filter(v => v.status === 'maintenance').length}대
            </div>
            <div className="flex items-center rounded-full bg-red-100 px-2 py-1 text-sm text-red-700">
              <div className="mr-1 h-2 w-2 rounded-full bg-red-500"></div>
              운행 불가: {vehicles.filter(v => v.status === 'out_of_service').length}대
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
