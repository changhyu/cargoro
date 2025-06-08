'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './vehicle-map.css';
import { VehicleLocationData } from '../types';
import { LocationStatus } from '@cargoro/types/schema/vehicle';

// 브라우저 환경에서만 사용 가능한 window 객체를 위한 타입 선언
declare global {
  interface Window {
    addEventListener: typeof globalThis.addEventListener;
    removeEventListener: typeof globalThis.removeEventListener;
  }
}

// Fix Leaflet's icon path issues (for Next.js)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/markers/marker-icon-2x.png',
  iconUrl: '/images/markers/marker-icon.png',
  shadowUrl: '/images/markers/marker-shadow.png',
});

// 지도 마커 아이콘 설정
const getMarkerIcon = (status: LocationStatus) => {
  switch (status) {
    case LocationStatus.ACTIVE:
      return new L.Icon({
        iconUrl: '/images/markers/vehicle-moving.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    case LocationStatus.IDLE:
      return new L.Icon({
        iconUrl: '/images/markers/vehicle-idle.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    case LocationStatus.MAINTENANCE:
      return new L.Icon({
        iconUrl: '/images/markers/vehicle-maintenance.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    case LocationStatus.OUT_OF_SERVICE:
    default:
      return new L.Icon({
        iconUrl: '/images/markers/vehicle-stopped.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
  }
};

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

interface VehicleMapInnerProps {
  vehicleLocation: VehicleLocationData;
}

/**
 * 실제 지도를 렌더링하는 내부 컴포넌트
 * 클라이언트 사이드에서만 동작합니다.
 */
export default function VehicleMapInner({ vehicleLocation }: Readonly<VehicleMapInnerProps>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return;
    }

    // Leaflet 지도 초기화
    const map = L.map(mapRef.current).setView(
      [vehicleLocation.latitude, vehicleLocation.longitude],
      15
    );

    // OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'map-tiles', // 커스텀 클래스 추가
    }).addTo(map);

    // 오류 무시
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'error',
        function (e) {
          // Mapbox 관련 오류 무시
          if (e.message && (e.message.includes('mapbox') || e.message.includes('Mapbox'))) {
            e.stopPropagation();
            e.preventDefault();
          }
        },
        true
      );
    }

    // 지도 인스턴스 저장
    mapInstanceRef.current = map;

    // 컴포넌트 언마운트 시 지도 정리
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 차량 위치 업데이트
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) {
      return;
    }

    const { latitude, longitude, status } = vehicleLocation;
    const position: L.LatLngExpression = [latitude, longitude];

    // 마커가 없으면 생성, 있으면 위치 업데이트
    if (!markerRef.current) {
      const marker = L.marker(position, {
        icon: getMarkerIcon(status),
      }).addTo(map);

      // 팝업 추가
      marker.bindPopup(`
        <strong>차량 정보</strong><br>
        상태: ${getStatusText(status)}<br>
        ${status === LocationStatus.ACTIVE ? `속도: ${vehicleLocation.speed} km/h<br>` : ''}
        위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
      `);

      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(position);
      markerRef.current.setIcon(getMarkerIcon(status));

      // 팝업 내용 업데이트
      markerRef.current.getPopup()?.setContent(`
        <strong>차량 정보</strong><br>
        상태: ${getStatusText(status)}<br>
        ${status === LocationStatus.ACTIVE ? `속도: ${vehicleLocation.speed} km/h<br>` : ''}
        위치: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
      `);
    }

    // 지도 뷰를 차량 위치로 중앙 정렬
    map.setView(position, map.getZoom());
  }, [vehicleLocation]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* 차량 상태 표시 레이어 */}
      <div className="vehicle-status-legend">
        <div className="vehicle-status-item">
          <span className="status-dot status-active"></span>
          <span className="status-label">운행 중</span>
        </div>
        <div className="vehicle-status-item">
          <span className="status-dot status-idle"></span>
          <span className="status-label">대기 중</span>
        </div>
        <div className="vehicle-status-item">
          <span className="status-dot status-maintenance"></span>
          <span className="status-label">정비 중</span>
        </div>
        <div className="vehicle-status-item">
          <span className="status-dot status-out-of-service"></span>
          <span className="status-label">운행 불가</span>
        </div>
      </div>

      {/* 지도 컨트롤 버튼 */}
      <div className="map-controls">
        <button
          className="map-control-button"
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) {
              map.setView([vehicleLocation.latitude, vehicleLocation.longitude], 15);
            }
          }}
        >
          새로고침
        </button>
        <button
          className="map-control-button"
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) {
              map.setView([vehicleLocation.latitude, vehicleLocation.longitude], map.getZoom() + 1);
            }
          }}
        >
          확대
        </button>
      </div>
    </div>
  );
}
