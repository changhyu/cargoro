'use client';

import type { VehicleLocation } from '../services/vehicle-location';

interface LeafletMapProps {
  vehicles: VehicleLocation[];
  center: [number, number];
  zoom: number;
  onVehicleClick: (vehicle: VehicleLocation) => void;
  onMapClick: (e: { lngLat: { lng: number; lat: number } }) => void;
  onViewStateChange: (e: {
    viewState: { longitude: number; latitude: number; zoom: number };
  }) => void;
  mapStyle: string;
  getMarkerColor: (status: VehicleLocation['status'] | 'maintenance' | 'out_of_service') => string;
  popupInfo: VehicleLocation | null;
  setPopupInfo: (info: VehicleLocation | null) => void;
  flyToVehicle: (vehicle: VehicleLocation) => void;
  animateMarkers: boolean;
}

// 이것은 임시 컴포넌트입니다. leaflet 패키지 설치 후 실제 구현으로 대체해야 합니다.
export default function LeafletMap(props: LeafletMapProps) {
  return (
    <div className="flex h-96 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
      <p className="text-gray-500">지도를 표시할 수 없습니다. leaflet 패키지가 필요합니다.</p>
      <p className="mt-2 text-xs text-gray-400">차량 수: {props.vehicles.length}개</p>
    </div>
  );
}

// 임시 더미 함수 - 실제 구현에서는 제대로 구현해야 합니다.
export function addMarker() {
  // leaflet 패키지가 필요합니다.
  return null;
}

export function createMap() {
  // leaflet 패키지가 필요합니다.
  return null;
}

export function removeMarker() {
  // leaflet 패키지가 필요합니다.
  return null;
}

export function setView() {
  // leaflet 패키지가 필요합니다.
  return null;
}
