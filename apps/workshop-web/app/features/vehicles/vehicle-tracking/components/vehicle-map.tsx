// import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useVehicleLocation } from '../hooks/useVehicleLocation';
import { Card } from '@/app/components/ui/card';
import { LocationStatus } from '@cargoro/types/schema/vehicle';

// 클라이언트 사이드에서만 동작하는 지도 컴포넌트를 동적으로 불러옵니다
const VehicleMapInner = dynamic(() => import('./vehicle-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-md bg-gray-100">
      <p className="text-gray-500">지도를 불러오는 중...</p>
    </div>
  ),
});

interface VehicleMapProps {
  vehicleId: string;
  className?: string;
}

/**
 * 차량 위치 지도 컴포넌트
 *
 * 차량의 실시간 위치를 지도에 표시합니다.
 *
 * @param vehicleId 차량 ID
 * @param className 추가 스타일 클래스
 */
export function VehicleMap({ vehicleId, className = '' }: VehicleMapProps) {
  const { data: vehicleLocation, isLoading, error } = useVehicleLocation(vehicleId);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex h-[400px] w-full items-center justify-center rounded-md bg-gray-100">
          <p className="text-gray-500">차량 위치 정보를 불러오는 중...</p>
        </div>
      </Card>
    );
  }

  if (error || !vehicleLocation) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex h-[400px] w-full items-center justify-center rounded-md bg-gray-100">
          <p className="text-red-500">
            {error?.message || '차량 위치 정보를 불러오는데 실패했습니다.'}
          </p>
        </div>
      </Card>
    );
  }

  // 상태에 따른 표시 텍스트
  const getStatusText = (status: LocationStatus) => {
    switch (status) {
      case LocationStatus.ACTIVE:
        return '이동 중';
      case LocationStatus.IDLE:
        return '대기 중';
      case LocationStatus.MAINTENANCE:
        return '정비 중';
      case LocationStatus.OUT_OF_SERVICE:
        return '운행 불가';
      default:
        return '알 수 없음';
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="mb-2 text-lg font-medium">차량 위치</h3>
      <div className="h-[400px] w-full overflow-hidden rounded-md">
        <VehicleMapInner vehicleLocation={vehicleLocation} />
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <p>최종 업데이트: {new Date(vehicleLocation.timestamp).toLocaleString('ko-KR')}</p>
        <p>
          상태: {getStatusText(vehicleLocation.status)}
          {vehicleLocation.status === LocationStatus.ACTIVE && ` (${vehicleLocation.speed} km/h)`}
        </p>
      </div>
    </Card>
  );
}
