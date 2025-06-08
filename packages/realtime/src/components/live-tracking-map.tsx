'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@cargoro/ui';
import { useRealtimeTracking, useRealtimeEvent } from '../hooks';
import {
  Navigation,
  MapPin,
  Clock,
  TrendingUp,
  Phone,
  MessageSquare,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface LiveTrackingMapProps {
  entityType: 'delivery' | 'vehicle';
  entityId: string;
  entityInfo: {
    name: string;
    image?: string;
    phone?: string;
  };
  destination?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

declare global {
  interface Window {
    naver: any;
  }
}

export function LiveTrackingMap({
  entityType,
  entityId,
  entityInfo,
  destination,
}: LiveTrackingMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const pathRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);

  const { location, updateLocation } = useRealtimeTracking(entityType, entityId);

  // 네이버 지도 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 지도 생성
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || !window.naver) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(
        location?.latitude || 37.5665,
        location?.longitude || 126.978
      ),
      zoom: 15,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.naver.maps.MapTypeControlStyle.BUTTON,
        position: window.naver.maps.Position.TOP_RIGHT,
      },
      zoomControl: true,
      zoomControlOptions: {
        style: window.naver.maps.ZoomControlStyle.SMALL,
        position: window.naver.maps.Position.RIGHT_CENTER,
      },
    };

    mapRef.current = new window.naver.maps.Map(mapContainerRef.current, mapOptions);

    // 목적지 마커 추가
    if (destination) {
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(destination.latitude, destination.longitude),
        map: mapRef.current,
        title: '목적지',
        icon: {
          content: `
            <div style="display: flex; align-items: center; justify-content: center;">
              <div style="background: #ef4444; color: white; padding: 8px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
          `,
          anchor: new window.naver.maps.Point(20, 40),
        },
      });
    }
  }, [isMapLoaded, destination]);

  // 실시간 위치 업데이트
  useEffect(() => {
    if (!mapRef.current || !location) return;

    const position = new window.naver.maps.LatLng(location.latitude, location.longitude);

    // 마커 업데이트
    if (!markerRef.current) {
      markerRef.current = new window.naver.maps.Marker({
        position,
        map: mapRef.current,
        title: entityInfo.name,
        icon: {
          content: `
            <div style="position: relative;">
              <div style="
                background: #3b82f6;
                color: white;
                padding: 8px;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                animation: pulse 2s infinite;
              ">
                ${entityType === 'delivery' ? '🚚' : '🚗'}
              </div>
              ${
                location.heading
                  ? `
                <div style="
                  position: absolute;
                  top: -8px;
                  left: 50%;
                  transform: translateX(-50%) rotate(${location.heading}deg);
                  width: 0;
                  height: 0;
                  border-left: 4px solid transparent;
                  border-right: 4px solid transparent;
                  border-bottom: 8px solid #3b82f6;
                ">
                </div>
              `
                  : ''
              }
            </div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
            </style>
          `,
          anchor: new window.naver.maps.Point(20, 20),
        },
      });
    } else {
      markerRef.current.setPosition(position);
    }

    // 지도 중심 이동
    mapRef.current.setCenter(position);

    // 경로 업데이트
    if (pathRef.current) {
      const path = pathRef.current.getPath();
      path.push(position);
      pathRef.current.setPath(path);
    } else {
      pathRef.current = new window.naver.maps.Polyline({
        map: mapRef.current,
        path: [position],
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
    }
  }, [location, entityInfo.name, entityType]);

  // 예상 도착 시간 계산
  useRealtimeEvent('etaUpdate', (data: { entityId: string; eta: string }) => {
    if (data.entityId === entityId) {
      setEstimatedTime(data.eta);
    }
  });

  const handleCenterMap = () => {
    if (mapRef.current && location) {
      const position = new window.naver.maps.LatLng(location.latitude, location.longitude);
      mapRef.current.setCenter(position);
      mapRef.current.setZoom(15);
    }
  };

  const speedKmh = location?.speed ? Math.round(location.speed * 3.6) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={entityInfo.image} />
              <AvatarFallback>{entityInfo.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{entityInfo.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {entityType === 'delivery' ? '배송중' : '운행중'}
                </Badge>
                {location && (
                  <span>
                    업데이트:{' '}
                    {formatDistanceToNow(new Date(location.timestamp), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {entityInfo.phone && (
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleCenterMap}>
              <Navigation className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div ref={mapContainerRef} className="h-[400px] w-full" />

        {location && (
          <div className="border-t p-4">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">속도</p>
                  <p className="font-medium">{speedKmh} km/h</p>
                </div>
              </div>

              {destination && (
                <>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">목적지</p>
                      <p className="truncate font-medium" title={destination.address}>
                        {destination.address}
                      </p>
                    </div>
                  </div>

                  {estimatedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">예상 도착</p>
                        <p className="font-medium">{estimatedTime}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">정확도</p>
                  <p className="font-medium">
                    {location.accuracy ? `±${Math.round(location.accuracy)}m` : '계산중...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
