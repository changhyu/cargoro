'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  BellRing,
  Check,
  X,
  MapPin,
  Droplet,
  Thermometer,
  Battery,
  Clock,
} from 'lucide-react';

import { vehicleLocationService, VehicleLocation } from '../services/vehicle-location';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';

type AlertSeverity = 'critical' | 'warning' | 'info';

type AlertType =
  | 'geofence_violation'
  | 'low_fuel'
  | 'maintenance_due'
  | 'high_temperature'
  | 'low_battery'
  | 'long_idle'
  | 'speed_violation';

interface VehicleAlert {
  id: string;
  vehicleId: string;
  licensePlate: string;
  type: AlertType;
  message: string;
  timestamp: number;
  severity: AlertSeverity;
  isRead: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  data?: Record<string, unknown>;
}

// 알림 타입별 설정
const alertConfig: Record<
  string,
  {
    icon: React.ReactNode;
    title: string;
    colorClass: string;
    badgeClass: string;
  }
> = {
  geofence_violation: {
    icon: <MapPin className="h-4 w-4" />,
    title: '구역이탈',
    colorClass: 'bg-red-100 text-red-700',
    badgeClass: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
  low_fuel: {
    icon: <Droplet className="h-4 w-4" />,
    title: '연료부족',
    colorClass: 'bg-yellow-100 text-yellow-700',
    badgeClass: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  },
  maintenance_due: {
    icon: <AlertCircle className="h-4 w-4" />,
    title: '정비필요',
    colorClass: 'bg-blue-100 text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  high_temperature: {
    icon: <Thermometer className="h-4 w-4" />,
    title: '온도경고',
    colorClass: 'bg-orange-100 text-orange-700',
    badgeClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  low_battery: {
    icon: <Battery className="h-4 w-4" />,
    title: '배터리',
    colorClass: 'bg-purple-100 text-purple-700',
    badgeClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  long_idle: {
    icon: <Clock className="h-4 w-4" />,
    title: '장시간 대기',
    colorClass: 'bg-gray-100 text-gray-700',
    badgeClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  speed_violation: {
    icon: <AlertTriangle className="h-4 w-4" />,
    title: '과속',
    colorClass: 'bg-red-100 text-red-700',
    badgeClass: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
};

// 임시 알림 데이터
const mockAlerts: VehicleAlert[] = [
  {
    id: '1',
    vehicleId: 'v001',
    licensePlate: '서울 123가 4567',
    type: 'geofence_violation',
    message: '차량이 지정된 운행 구역을 벗어났습니다.',
    timestamp: Date.now() - 25 * 60 * 1000,
    severity: 'critical',
    isRead: false,
    location: {
      latitude: 37.5765,
      longitude: 127.0195,
    },
  },
  {
    id: '2',
    vehicleId: 'v002',
    licensePlate: '서울 456나 7890',
    type: 'low_fuel',
    message: '연료량이 15% 미만입니다. 주유가 필요합니다.',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    severity: 'warning',
    isRead: false,
  },
  {
    id: '3',
    vehicleId: 'v003',
    licensePlate: '서울 789다 1234',
    type: 'maintenance_due',
    message: '정기 점검 예정일이 7일 이내입니다.',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    severity: 'info',
    isRead: true,
  },
  {
    id: '4',
    vehicleId: 'v004',
    licensePlate: '서울 321라 6547',
    type: 'speed_violation',
    message: '차량이 제한 속도를 초과하였습니다 (110km/h).',
    timestamp: Date.now() - 40 * 60 * 1000,
    severity: 'critical',
    isRead: false,
    data: { speed: 110, speedLimit: 80 },
  },
  {
    id: '5',
    vehicleId: 'v001',
    licensePlate: '서울 123가 4567',
    type: 'high_temperature',
    message: '엔진 온도가 정상 범위를 초과했습니다.',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    severity: 'warning',
    isRead: true,
    data: { temperature: 105 },
  },
];

interface VehicleAlertsProps {
  showHeader?: boolean;
  limit?: number;
  onShowMap?: (vehicle: VehicleLocation) => void;
  className?: string;
}

export default function VehicleAlerts({
  showHeader = true,
  limit = 5,
  onShowMap,
  className = '',
}: VehicleAlertsProps) {
  const [alerts, setAlerts] = useState<VehicleAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | AlertSeverity>('all');
  const { toast } = useToast();

  // 알림 데이터 로드
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setIsLoading(true);
        // 실제 API 호출 대신 목업 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 800));
        setAlerts(mockAlerts);
      } catch (error) {
        toast({
          title: '데이터 로딩 오류',
          description: '차량 알림 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, [toast]);

  // 필터링된 알림
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.isRead;
    return alert.severity === filter;
  });

  // 지도에서 보기 핸들러
  const handleShowOnMap = async (alert: VehicleAlert) => {
    if (!onShowMap || !alert.location) return;

    try {
      const vehicleData = await vehicleLocationService.getVehicleLocation(alert.vehicleId);
      if (vehicleData) {
        onShowMap(vehicleData);
      } else {
        toast({
          title: '차량 위치 정보 없음',
          description: '해당 차량의 최신 위치 정보를 찾을 수 없습니다.',
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '차량 위치 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 알림 읽음 처리
  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => (alert.id === id ? { ...alert, isRead: true } : alert)));
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    toast({
      title: '모든 알림 읽음 처리됨',
      description: '모든 알림이 읽음 처리되었습니다.',
      variant: 'default',
    });
  };

  // 시간 형식 표시
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60 * 1000) {
      return '방금 전';
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}분 전`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}시간 전`;
    } else {
      return new Date(timestamp).toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
    }
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="h-5 w-5 text-yellow-600" />
            차량 알림
            {alerts.filter(a => !a.isRead).length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {alerts.filter(a => !a.isRead).length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-8 rounded-r-none"
                onClick={() => setFilter('all')}
              >
                전체
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                className="h-8 rounded-none border-l-0"
                onClick={() => setFilter('unread')}
              >
                읽지 않음
              </Button>
              <Button
                variant={filter === 'critical' ? 'default' : 'outline'}
                size="sm"
                className="h-8 rounded-l-none border-l-0"
                onClick={() => setFilter('critical')}
              >
                긴급
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={markAllAsRead}
              disabled={!alerts.some(a => !a.isRead)}
            >
              <Check className="mr-1 h-4 w-4" />
              모두 읽음
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="mt-2 flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex animate-pulse flex-col gap-2">
                <div className="h-5 w-1/3 rounded bg-gray-200"></div>
                <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            {filteredAlerts.slice(0, limit).map(alert => (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 transition-all ${
                  alert.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div
                      className={`mr-2 rounded-full p-1.5 ${
                        alertConfig[alert.type]?.colorClass || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {alertConfig[alert.type]?.icon || <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center text-sm font-medium">
                        {alert.licensePlate}{' '}
                        <Badge
                          variant="secondary"
                          className={`ml-2 text-xs font-normal ${
                            alertConfig[alert.type]?.badgeClass || ''
                          }`}
                        >
                          {alertConfig[alert.type]?.title || alert.type}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">{alert.message}</p>
                    </div>
                  </div>
                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 rounded-full p-0"
                      onClick={() => markAsRead(alert.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">읽음 표시</span>
                    </Button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <p className="text-gray-400">{formatTime(alert.timestamp)}</p>
                  {alert.location && onShowMap && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleShowOnMap(alert)}
                    >
                      <MapPin className="mr-1 h-3 w-3" />
                      지도에서 보기
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredAlerts.length > limit && (
              <Button variant="outline" size="sm" className="mt-2 w-full">
                더 보기 ({filteredAlerts.length - limit})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
