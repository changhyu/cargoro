'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, MapPin, RefreshCcw, ZoomIn, ZoomOut } from 'lucide-react';
import dynamic from 'next/dynamic';

import { vehicleLocationService, VehicleLocation } from '../services/vehicle-location';

import { useToast } from './ui/use-toast';

// 타입 정의만 필요한 부분은 직접 선언해서 사용
interface MapRef {
  flyTo: (options: { center: [number, number]; zoom: number; duration: number }) => void;
  fitBounds: (
    bounds: [[number, number], [number, number]],
    options: { padding: number; duration: number }
  ) => void;
}
interface MapMouseEvent {
  lngLat: { lng: number; lat: number };
}
interface ViewStateChangeEvent {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

// Leaflet은 클라이언트 사이드에서만 로드 (서버 사이드 렌더링 방지)
const MapComponent = dynamic(() => import('./leaflet-map'), { ssr: false });

// VehicleLocation 타입을 export
export type { VehicleLocation } from '../services/vehicle-location';

interface VehicleMapProps {
  vehicles?: VehicleLocation[];
  center?: [number, number];
  zoom?: number;
  width?: string | number;
  height?: string | number;
  onVehicleClick?: (vehicle: VehicleLocation) => void;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  className?: string;
  refreshInterval?: number; // 위치 새로고침 간격 (밀리초)
  autoRefresh?: boolean; // 자동 새로고침 활성화 여부
  showTraffic?: boolean; // 교통 정보 표시 여부
  animateMarkers?: boolean; // 마커 애니메이션 활성화 여부
}

function VehicleMap({
  vehicles: externalVehicles,
  center = [126.978, 37.5665], // 서울 중심
  zoom = 11,
  width = '100%',
  height = '500px',
  onVehicleClick,
  onMapClick,
  className = '',
  refreshInterval = 30000, // 기본 30초 간격으로 새로고침
  autoRefresh = false,
  showTraffic = false,
  animateMarkers = true,
}: VehicleMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<VehicleLocation | null>(null);
  const [_viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom,
  });
  const [vehicles, setVehicles] = useState<VehicleLocation[]>(externalVehicles || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<string>(
    showTraffic ? 'mapbox://styles/mapbox/navigation-day-v1' : 'mapbox://styles/mapbox/streets-v11'
  );
  const [showLayers, setShowLayers] = useState<boolean>(false);
  const { toast } = useToast();

  // 외부에서 차량 데이터를 직접 전달받으면 업데이트
  useEffect(() => {
    if (externalVehicles) {
      setVehicles(externalVehicles);
    }
  }, [externalVehicles]);

  // 교통 정보 표시 상태에 따라 맵 스타일 변경
  useEffect(() => {
    setMapStyle(
      showTraffic
        ? 'mapbox://styles/mapbox/navigation-day-v1'
        : 'mapbox://styles/mapbox/streets-v11'
    );
  }, [showTraffic]);

  // 차량 위치 데이터 가져오기
  const fetchVehicleLocations = useCallback(async () => {
    // 외부에서 차량 데이터를 직접 전달받으면 API 호출 스킵
    if (externalVehicles) return;

    try {
      setLoading(true);
      const data = await vehicleLocationService.getVehicleLocations();
      setVehicles(data);
    } catch (_error) {
      toast({
        title: '데이터 로딩 오류',
        description: '차량 위치 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [externalVehicles, toast]);

  // 초기 로딩 및 자동 새로고침 설정
  useEffect(() => {
    fetchVehicleLocations();

    // 자동 새로고침 설정
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh && !externalVehicles) {
      interval = setInterval(fetchVehicleLocations, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchVehicleLocations, autoRefresh, refreshInterval, externalVehicles]);

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback(
    (vehicle: VehicleLocation) => {
      setPopupInfo(vehicle);
      if (onVehicleClick) {
        onVehicleClick(vehicle);
      }
    },
    [onVehicleClick]
  );

  // 지도 클릭 핸들러
  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      setPopupInfo(null);
      if (onMapClick) {
        onMapClick(e.lngLat);
      }
    },
    [onMapClick]
  );

  // 뷰 상태 변경 핸들러
  const handleViewStateChange = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  }, []);

  // 차량 상태에 따른 마커 색상
  const getMarkerColor = (status: VehicleLocation['status'] | 'maintenance' | 'out_of_service') => {
    switch (status) {
      case 'active':
        return '#10b981'; // emerald-500
      case 'idle':
        return '#3b82f6'; // blue-500
      case 'maintenance':
        return '#f59e0b'; // amber-500
      case 'out_of_service':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // 선택된 차량으로 지도 이동
  const flyToVehicle = useCallback((vehicle: VehicleLocation) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [vehicle.longitude, vehicle.latitude],
      zoom: 14,
      duration: 1000,
    });
  }, []);

  // 모든 차량이 보이도록 지도 영역 조정
  const fitAllVehicles = useCallback(() => {
    if (!mapRef.current || vehicles.length === 0) return;

    // 모든 차량 위치에서 경계 계산
    const bounds = vehicles.reduce(
      (box, vehicle) => {
        return {
          minLng: Math.min(box.minLng, vehicle.longitude),
          minLat: Math.min(box.minLat, vehicle.latitude),
          maxLng: Math.max(box.maxLng, vehicle.longitude),
          maxLat: Math.max(box.maxLat, vehicle.latitude),
        };
      },
      {
        minLng: 180,
        minLat: 90,
        maxLng: -180,
        maxLat: -90,
      }
    );

    // 패딩 추가
    mapRef.current.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat],
      ],
      { padding: 50, duration: 1000 }
    );

    // 성공 토스트 메시지
    toast({
      title: '지도 뷰 업데이트',
      description: '모든 차량이 표시되도록 뷰를 조정했습니다.',
      variant: 'default',
    });
  }, [vehicles, toast]);

  // 지도 확대
  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoom: prev.zoom + 1,
    }));
  }, []);

  // 지도 축소
  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoom: prev.zoom - 1,
    }));
  }, []);

  // 지도 스타일 변경
  const _toggleMapStyle = useCallback(() => {
    setMapStyle(prev =>
      prev === 'mapbox://styles/mapbox/streets-v11'
        ? 'mapbox://styles/mapbox/satellite-streets-v11'
        : prev === 'mapbox://styles/mapbox/satellite-streets-v11'
          ? 'mapbox://styles/mapbox/light-v10'
          : prev === 'mapbox://styles/mapbox/light-v10'
            ? 'mapbox://styles/mapbox/dark-v10'
            : 'mapbox://styles/mapbox/streets-v11'
    );
  }, []);

  return (
    <div className={`map-container relative h-full w-full ${className}`} style={{ width, height }}>
      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="absolute left-2 top-2 z-10 flex items-center rounded-full bg-white/90 px-3 py-1.5 text-sm shadow-md backdrop-blur-md">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-blue-700">데이터 로딩 중...</span>
        </div>
      )}

      {/* 상단 컨트롤 버튼 */}
      <div className="absolute right-2 top-2 z-10 flex space-x-2">
        <button
          className="flex items-center rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-md backdrop-blur-md transition-colors hover:bg-blue-50"
          onClick={fetchVehicleLocations}
          title="위치 정보 새로고침"
        >
          <RefreshCcw className="mr-1.5 h-4 w-4" />
          새로고침
        </button>
        <button
          className="flex items-center rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-md backdrop-blur-md transition-colors hover:bg-blue-50"
          onClick={fitAllVehicles}
          title="모든 차량 표시"
        >
          <MapPin className="mr-1.5 h-4 w-4" />
          모든 차량 보기
        </button>
        <button
          className="flex items-center rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-md backdrop-blur-md transition-colors hover:bg-blue-50"
          onClick={() => setShowLayers(!showLayers)}
          title="레이어 변경"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* 레이어 선택 패널 */}
      {showLayers && (
        <div className="absolute right-2 top-16 z-10 w-48 rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-md">
          <h3 className="mb-2 text-sm font-medium text-gray-700">지도 스타일</h3>
          <div className="space-y-2">
            <button
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-xs ${
                mapStyle === 'mapbox://styles/mapbox/streets-v11'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setMapStyle('mapbox://styles/mapbox/streets-v11')}
            >
              기본 지도
            </button>
            <button
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-xs ${
                mapStyle === 'mapbox://styles/mapbox/satellite-streets-v11'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v11')}
            >
              위성 지도
            </button>
            <button
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-xs ${
                mapStyle === 'mapbox://styles/mapbox/light-v10'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setMapStyle('mapbox://styles/mapbox/light-v10')}
            >
              라이트 모드
            </button>
            <button
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-xs ${
                mapStyle === 'mapbox://styles/mapbox/dark-v10'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setMapStyle('mapbox://styles/mapbox/dark-v10')}
            >
              다크 모드
            </button>
            <button
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-xs ${
                mapStyle === 'mapbox://styles/mapbox/navigation-day-v1'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setMapStyle('mapbox://styles/mapbox/navigation-day-v1')}
            >
              내비게이션 모드
            </button>
          </div>
        </div>
      )}

      {/* 줌 버튼 컨트롤 */}
      <div className="absolute left-2 top-2 z-[9999] flex flex-col space-y-2">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 shadow-md backdrop-blur-md transition-colors hover:bg-blue-50"
          onClick={handleZoomIn}
          title="확대"
        >
          <ZoomIn className="h-4 w-4 text-blue-700" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 shadow-md backdrop-blur-md transition-colors hover:bg-blue-50"
          onClick={handleZoomOut}
          title="축소"
        >
          <ZoomOut className="h-4 w-4 text-blue-700" />
        </button>
      </div>

      {/* 메인 맵 */}
      <MapComponent
        vehicles={vehicles}
        center={center}
        zoom={zoom}
        onVehicleClick={handleMarkerClick}
        onMapClick={handleMapClick}
        onViewStateChange={handleViewStateChange}
        mapStyle={mapStyle}
        getMarkerColor={getMarkerColor}
        popupInfo={popupInfo}
        setPopupInfo={setPopupInfo}
        flyToVehicle={flyToVehicle}
        animateMarkers={animateMarkers}
      />

      {/* 운행 상태 범례 */}
      <div className="absolute bottom-2 left-0 right-0 z-[9999] mx-auto w-fit rounded-full bg-white/90 px-6 py-2 shadow-md backdrop-blur-md">
        <div className="flex items-center space-x-5 text-xs font-medium">
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded-full bg-emerald-500"></div>
            <span>운행 중</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
            <span>대기 중</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded-full bg-amber-500"></div>
            <span>정비 중</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded-full bg-red-500"></div>
            <span>운행 불가</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleMap;
