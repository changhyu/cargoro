'use client';

import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './vehicle-map.css';
import { Card } from '@/app/components/ui/card';

// 브라우저 환경에서만 사용 가능한 window 객체를 위한 타입 선언
declare global {
  interface Window {
    addEventListener: typeof globalThis.addEventListener;
    removeEventListener: typeof globalThis.removeEventListener;
  }
}

// Leaflet 기본 아이콘 설정
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/markers/marker-icon-2x.png',
  iconUrl: '/images/markers/marker-icon.png',
  shadowUrl: '/images/markers/marker-shadow.png',
});

interface Vehicle {
  id: string;
  licensePlate?: string;
  name?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  status: 'active' | 'idle' | 'maintenance' | 'out_of_service';
  timestamp?: string;
}

interface AllVehiclesMapProps {
  vehicles?: Vehicle[];
  className?: string;
  height?: string | number;
}

export function AllVehiclesMap({
  vehicles = [],
  className = '',
  height = '600px',
}: Readonly<AllVehiclesMapProps>) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  // 사용하지 않는 상태 변수 제거
  // const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // 지도 마커 아이콘 설정
  const getMarkerIcon = (status: Vehicle['status']) => {
    let color = '';

    switch (status) {
      case 'active':
        color = '#10b981'; // 녹색
        break;
      case 'idle':
        color = '#3b82f6'; // 파란색
        break;
      case 'maintenance':
        color = '#f59e0b'; // 노란색
        break;
      case 'out_of_service':
        color = '#ef4444'; // 빨간색
        break;
    }

    return L.divIcon({
      className: 'vehicle-marker-icon',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: white;
          border-radius: 50%;
          border: 2px solid ${color};

          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 14px;
            height: 14px;
            background-color: ${color};

            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // 상태별 배경색 가져오기
  const getStatusBackgroundColor = (status: Vehicle['status']): string => {
    switch (status) {
      case 'active':
        return '#D1FAE5';
      case 'idle':
        return '#DBEAFE';
      case 'maintenance':
        return '#FEF3C7';
      case 'out_of_service':
        return '#FEE2E2';
      default:
        return '#E5E7EB';
    }
  };

  // 상태별 텍스트 색상 가져오기
  const getStatusTextColor = (status: Vehicle['status']): string => {
    switch (status) {
      case 'active':
        return '#065F46';
      case 'idle':
        return '#1E40AF';
      case 'maintenance':
        return '#92400E';
      case 'out_of_service':
        return '#B91C1C';
      default:
        return '#374151';
    }
  };

  // 상태별 텍스트 가져오기
  const getStatusText = (status: Vehicle['status']): string => {
    switch (status) {
      case 'active':
        return '운행 중';
      case 'idle':
        return '대기 중';
      case 'maintenance':
        return '정비 중';
      case 'out_of_service':
        return '운행 불가';
      default:
        return '알 수 없음';
    }
  };

  // 지도 초기화
  useEffect(() => {
    if (mapInstance || !vehicles || vehicles.length === 0) {
      return;
    }

    // 지도 생성
    const map = L.map('multi-vehicle-map').setView([37.5665, 126.978], 10);

    // 지도 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'map-tiles',
    }).addTo(map);

    setMapInstance(map);

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [vehicles, mapInstance]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstance || !vehicles || vehicles.length === 0) {
      return;
    }

    // 기존 마커 제거
    markers.forEach(marker => marker.remove());
    setMarkers([]);

    // 새 마커 추가
    const newMarkers = vehicles.map(vehicle => {
      const marker = L.marker([vehicle.latitude, vehicle.longitude], {
        icon: getMarkerIcon(vehicle.status),
      }).addTo(mapInstance);

      // 팝업 추가
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 5px; color: #3B82F6;">
            ${vehicle.licensePlate || vehicle.name || `차량 #${vehicle.id}`}
          </h3>
          <div style="font-size: 0.9rem; margin-bottom: 8px; color: #6B7280;">ID: ${vehicle.id}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: 500;">상태:</span>
            <span style="
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 0.75rem;
              background-color: ${getStatusBackgroundColor(vehicle.status)};

              color: ${getStatusTextColor(vehicle.status)};

            ">
              ${getStatusText(vehicle.status)}
            </span>
          </div>
          ${
            vehicle.speed !== undefined
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: 500;">속도:</span>
            <span>${vehicle.speed} km/h</span>
          </div>
          `
              : ''
          }
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: 500;">위치:</span>
            <span>${vehicle.latitude.toFixed(4)}, ${vehicle.longitude.toFixed(4)}</span>
          </div>
          ${
            vehicle.timestamp
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: 500;">업데이트:</span>
            <span>${new Date(vehicle.timestamp).toLocaleTimeString()}</span>
          </div>
          `
              : ''
          }
          <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
            <button
              style="
                background-color: #3B82F6;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.75rem;
                cursor: pointer;
              "
              onclick="document.dispatchEvent(new CustomEvent('zoomToVehicle', { detail: '${vehicle.id}' }))">
              확대
            </button>
            <button
              style="
                background-color: #E5E7EB;
                color: #1F2937;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.75rem;
                cursor: pointer;
              "
              onclick="this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click()">
              닫기
            </button>
          </div>
        </div>
      `);

      // 마커 클릭 이벤트
      marker.on('click', () => {
        // 선택된 차량 처리 로직
        // setSelectedVehicle(vehicle);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // 지도 경계 설정
    if (newMarkers.length > 0) {
      const bounds = L.featureGroup(newMarkers).getBounds();
      mapInstance.fitBounds(bounds, { padding: [50, 50] });
    }

    // 커스텀 이벤트 리스너 추가
    const handleZoomToVehicle = (e: Event) => {
      const event = e as CustomEvent;
      const vehicleId = event.detail;
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle && mapInstance) {
        mapInstance.setView([vehicle.latitude, vehicle.longitude], 16);
        // 선택된 차량 처리 로직
        // setSelectedVehicle(vehicle);
      }
    };

    // 클라이언트 사이드에서만 실행
    try {
      if (typeof window !== 'undefined') {
        window.addEventListener('zoomToVehicle', handleZoomToVehicle as EventListener);

        return () => {
          window.removeEventListener('zoomToVehicle', handleZoomToVehicle as EventListener);
        };
      }
    } catch (error) {
      // TODO: 에러 처리 및 로깅 구현
    }

    return undefined;
  }, [mapInstance, vehicles, markers, getMarkerIcon]);

  return (
    <Card className={className}>
      <div className="relative" style={{ height: height }}>
        {/* 지도 컨테이너 */}
        <div id="multi-vehicle-map" className="h-full w-full"></div>

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
              if (mapInstance && markers.length > 0) {
                const bounds = L.featureGroup(markers).getBounds();
                mapInstance.fitBounds(bounds, { padding: [50, 50] });
              }
            }}
          >
            모든 차량 보기
          </button>
          <button
            className="map-control-button"
            onClick={() => {
              if (mapInstance) {
                mapInstance.setZoom(mapInstance.getZoom() + 1);
              }
            }}
          >
            확대
          </button>
          <button
            className="map-control-button"
            onClick={() => {
              if (mapInstance) {
                mapInstance.setZoom(mapInstance.getZoom() - 1);
              }
            }}
          >
            축소
          </button>
        </div>
      </div>
    </Card>
  );
}
