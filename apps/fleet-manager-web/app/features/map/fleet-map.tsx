'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Car,
  Clock,
  Filter,
  Fuel,
  Locate,
  MapIcon,
  MapPin,
  RefreshCcw,
  Settings,
  Truck,
  Bell,
  ArrowRight,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { Switch } from '@cargoro/ui';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';
import VehicleAlerts from '../../components/vehicle-alerts';
import VehicleMap from '../../components/vehicle-map';
import { vehicleLocationService, VehicleLocation } from '../../services/vehicle-location';

// 확장된 VehicleLocation 타입 정의
interface ExtendedVehicleLocation extends Omit<VehicleLocation, 'status'> {
  licensePlate?: string;
  status: 'active' | 'idle' | 'offline' | 'maintenance' | 'out_of_service';
}

export default function FleetMap() {
  const [vehicles, setVehicles] = useState<ExtendedVehicleLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<ExtendedVehicleLocation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTraffic, setShowTraffic] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'alerts' | 'analytics'>('map');
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [mapAnimation, setMapAnimation] = useState(true);
  const { toast } = useToast();

  // 차량 위치 정보 로드
  const loadVehicleLocations = useCallback(async () => {
    // 지도 컨트롤 관련 추가 처리
    const applyMapStyles = () => {
      try {
        // 해당 선택자에 맞는 모든 요소 선택
        const leafletContainer = document.querySelector('.leaflet-control-container');
        if (leafletContainer) {
          // 지도 프레임워크에 적용된 CSS를 그대로 사용
          // 지도 스타일 적용 완료
        }
      } catch (error) {
        // 지도 스타일 적용 오류 발생
      }
    };

    // 지도가 로드되면 스타일 적용
    setTimeout(applyMapStyles, 500);

    try {
      setLoading(true);
      setError(null);

      // 로딩 토스트 메시지
      const loadingToast = toast({
        title: '데이터 로딩 중',
        description: '차량 위치 정보를 불러오고 있습니다...',
      });

      // getAllLocations 대신 getVehicleLocations 사용
      const data = await vehicleLocationService.getVehicleLocations();

      // 차량 데이터에 licensePlate 속성 추가
      const extendedData = data.map(vehicle => ({
        ...vehicle,
        licensePlate: `차량 ${vehicle.id.slice(-4)}`, // 임시로 차량 ID의 마지막 4자리로 번호판 생성
      }));

      setVehicles(extendedData);

      // 성공 토스트 메시지
      toast({
        title: '데이터 로드 완료',
        description: `${extendedData.length}대 차량 정보를 업데이트했습니다.`,
        variant: 'default',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '차량 위치 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      toast({
        title: '데이터 로딩 오류',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 초기 데이터 로드
  useEffect(() => {
    loadVehicleLocations();
  }, [loadVehicleLocations]);

  // 자동 새로고침 설정
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (autoRefresh) {
      interval = setInterval(() => {
        loadVehicleLocations();
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, loadVehicleLocations]);

  // 상태 필터링된 차량 목록
  const filteredVehicles =
    statusFilter === 'all' ? vehicles : vehicles.filter(v => v.status === statusFilter);

  // 차량 선택 핸들러
  const handleVehicleClick = useCallback((vehicle: ExtendedVehicleLocation) => {
    setSelectedVehicle(vehicle);
  }, []);

  // 알림에서 지도로 전환 및 차량 선택
  const handleShowOnMap = useCallback((vehicle: ExtendedVehicleLocation) => {
    setActiveTab('map');
    setSelectedVehicle(vehicle);
  }, []);

  // 상태 필터 옵션
  const statusOptions = [
    { value: 'all', label: '모든 차량', icon: <Car className="mr-2 h-4 w-4" /> },
    { value: 'active', label: '운행 중', icon: <Zap className="mr-2 h-4 w-4 text-green-500" /> },
    { value: 'idle', label: '대기 중', icon: <Clock className="mr-2 h-4 w-4 text-blue-500" /> },
    {
      value: 'maintenance',
      label: '정비 중',
      icon: <Settings className="mr-2 h-4 w-4 text-yellow-500" />,
    },
    {
      value: 'out_of_service',
      label: '운행 불가',
      icon: <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />,
    },
  ];

  // 임시 분석 데이터
  const analyticsData = {
    activeVehicles: filteredVehicles.filter(v => v.status === 'active').length,
    totalVehicles: vehicles.length,
    averageSpeed:
      filteredVehicles.reduce((sum, v) => sum + (v.speed || 0), 0) / (filteredVehicles.length || 1),
    fuelUsage: {
      today: 128.5,
      yesterday: 135.2,
      weekAvg: 132.4,
    },
    distanceCovered: {
      today: 1250,
      yesterday: 1320,
      weekAvg: 1280,
    },
    alerts: {
      critical: 2,
      warning: 5,
      info: 12,
    },
  };

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="rounded-xl bg-white p-4 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="flex items-center text-2xl font-bold text-gray-800">
            <MapPin className="mr-2 h-6 w-6 text-blue-600" />
            실시간 차량 위치
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="relative sm:mr-3">
                <Button
                  variant="outline"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Filter className="h-4 w-4" />
                  필터 및 설정
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
                  />
                </Button>

                {filterOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
                    <h3 className="mb-3 font-medium text-gray-700">필터 및 설정</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">차량 상태</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="모든 차량" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  {option.icon}
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">새로고침 간격</label>
                        <Select
                          value={refreshInterval.toString()}
                          onValueChange={val => setRefreshInterval(parseInt(val))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="30초" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10000">10초</SelectItem>
                            <SelectItem value="30000">30초</SelectItem>
                            <SelectItem value="60000">1분</SelectItem>
                            <SelectItem value="300000">5분</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">교통 정보</label>
                        <Switch checked={showTraffic} onCheckedChange={setShowTraffic} />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">자동 갱신</label>
                        <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">지도 애니메이션</label>
                        <Switch checked={mapAnimation} onCheckedChange={setMapAnimation} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="default"
                onClick={loadVehicleLocations}
                disabled={loading}
                className="mt-2 flex items-center gap-2 bg-blue-600 text-sm hover:bg-blue-700 sm:mt-0"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '로딩 중...' : '새로고침'}
              </Button>
            </div>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">총 차량</p>
                <p className="text-lg font-bold text-gray-800">{vehicles.length}대</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">운행 중</p>
                <p className="text-lg font-bold text-gray-800">
                  {vehicles.filter(v => v.status === 'active').length}대
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 p-2">
                <Settings className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">정비 중</p>
                <p className="text-lg font-bold text-gray-800">
                  {vehicles.filter(v => v.status === 'maintenance').length}대
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-red-50 to-rose-50 p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-2">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">미확인 알림</p>
                <p className="text-lg font-bold text-gray-800">7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs
        value={activeTab}
        onValueChange={val => setActiveTab(val as 'map' | 'alerts' | 'analytics')}
        className="w-full"
      >
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapIcon className="h-4 w-4" />
            지도 보기
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            알림 목록
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* 메인 지도 */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <MapIcon className="mr-2 h-5 w-5 text-blue-600" />
                    차량 위치 지도
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {filteredVehicles.length}대 표시 중
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-b bg-white p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">상태 필터:</span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px] border-gray-300">
                            <SelectValue placeholder="모든 차량" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  {option.icon}
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">교통 정보:</span>
                        <Switch checked={showTraffic} onCheckedChange={setShowTraffic} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">자동 갱신:</span>
                        <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                      </div>
                    </div>
                  </div>

                  <VehicleMap
                    vehicles={filteredVehicles as VehicleLocation[]}
                    height={580}
                    onVehicleClick={handleVehicleClick as (vehicle: VehicleLocation) => void}
                    showTraffic={showTraffic}
                    autoRefresh={autoRefresh}
                    refreshInterval={refreshInterval}
                    animateMarkers={mapAnimation}
                    className="rounded-b-lg"
                  />

                  {error && (
                    <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 차량 목록 사이드바 */}
            <div className="lg:col-span-1">
              <Card className="h-full shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Truck className="mr-2 h-5 w-5 text-blue-600" />
                    차량 목록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-2 text-sm">
                    <span className="font-medium text-blue-700">
                      총 {filteredVehicles.length}대 차량
                    </span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 w-32 border-blue-200 bg-white text-xs">
                        <SelectValue placeholder="모든 차량" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center text-xs">
                              {option.icon}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredVehicles.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                      <Car className="mb-2 h-10 w-10 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        선택한 필터에 해당하는 차량이 없습니다
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[480px] space-y-3 overflow-y-auto pr-2">
                      {filteredVehicles.map(vehicle => (
                        <div
                          key={vehicle.id}
                          onClick={() => handleVehicleClick(vehicle)}
                          className={`group cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md ${
                            selectedVehicle?.id === vehicle.id
                              ? 'border-blue-300 bg-blue-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                vehicle.status === 'active'
                                  ? 'bg-green-500'
                                  : vehicle.status === 'idle'
                                    ? 'bg-blue-500'
                                    : vehicle.status === 'maintenance'
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                              }`}
                            ></div>
                            <span className="font-medium">{vehicle.licensePlate}</span>
                          </div>
                          <div className="mt-2 flex flex-col gap-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              <span>
                                {vehicle.status === 'active'
                                  ? '운행 중'
                                  : vehicle.status === 'idle'
                                    ? '대기 중'
                                    : vehicle.status === 'maintenance'
                                      ? '정비 중'
                                      : '운행 불가'}
                              </span>
                              {vehicle.speed && vehicle.status === 'active' && (
                                <span className="ml-2 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                                  {vehicle.speed} km/h
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-1">
                              <span className="text-gray-400">
                                {new Date(vehicle.timestamp).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 py-0 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleVehicleClick(vehicle);
                                }}
                              >
                                <Locate className="mr-1 h-3 w-3" />
                                위치 보기
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 선택된 차량 상세 정보 */}
          {selectedVehicle && (
            <Card className="relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Truck className="mr-2 h-5 w-5 text-blue-600" />
                  {selectedVehicle.licensePlate} 상세 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="col-span-1 row-span-2 overflow-hidden rounded-lg bg-white p-4 shadow-sm md:col-span-1">
                    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gray-100">
                      <Car className="h-20 w-20 text-gray-400" />
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-semibold">{selectedVehicle.licensePlate}</h3>
                      <p className="text-sm text-gray-500">차량 ID: {selectedVehicle.vehicleId}</p>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          selectedVehicle.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : selectedVehicle.status === 'idle'
                              ? 'bg-blue-100 text-blue-800'
                              : selectedVehicle.status === 'maintenance'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <div
                          className={`mr-1.5 h-2 w-2 rounded-full ${
                            selectedVehicle.status === 'active'
                              ? 'bg-green-500'
                              : selectedVehicle.status === 'idle'
                                ? 'bg-blue-500'
                                : selectedVehicle.status === 'maintenance'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                        ></div>
                        {selectedVehicle.status === 'active'
                          ? '운행 중'
                          : selectedVehicle.status === 'idle'
                            ? '대기 중'
                            : selectedVehicle.status === 'maintenance'
                              ? '정비 중'
                              : '운행 불가'}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 rounded-lg bg-white p-4 shadow-sm md:col-span-3">
                    <h3 className="mb-4 flex items-center text-sm font-medium text-gray-500">
                      <MapPin className="mr-1.5 h-4 w-4 text-blue-500" />
                      위치 정보
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">위치 (위도/경도)</p>
                        <p className="font-medium">
                          {selectedVehicle.latitude.toFixed(6)},{' '}
                          {selectedVehicle.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">마지막 업데이트</p>
                        <p className="font-medium">
                          {new Date(selectedVehicle.timestamp).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">방향</p>
                        <p className="font-medium">{selectedVehicle.heading || 0}°</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 rounded-lg bg-white p-4 shadow-sm md:col-span-3">
                    <h3 className="mb-4 flex items-center text-sm font-medium text-gray-500">
                      <Zap className="mr-1.5 h-4 w-4 text-blue-500" />
                      운행 정보
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">현재 속도</p>
                        <p className="font-medium">{selectedVehicle.speed || 0} km/h</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">운행 시간</p>
                        <p className="font-medium">3시간 24분</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">남은 연료</p>
                        <p className="font-medium">68%</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    닫기
                  </Button>
                  <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Locate className="mr-1.5 h-4 w-4" />
                    지도에서 중앙배치
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <VehicleAlerts
            showHeader={true}
            limit={10}
            onShowMap={handleShowOnMap}
            className="shadow-lg"
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* 분석 대시보드 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* 운행 요약 카드 */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Zap className="mr-2 h-5 w-5 text-green-600" />
                  운행 요약
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">운행 중인 차량</span>
                    <span className="font-semibold">{analyticsData.activeVehicles}대</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">총 등록 차량</span>
                    <span className="font-semibold">{analyticsData.totalVehicles}대</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">평균 속도</span>
                    <span className="font-semibold">
                      {analyticsData.averageSpeed.toFixed(1)} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">운행률</span>
                    <span className="font-semibold">
                      {analyticsData.totalVehicles > 0
                        ? (
                            (analyticsData.activeVehicles / analyticsData.totalVehicles) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${
                          analyticsData.totalVehicles > 0
                            ? (analyticsData.activeVehicles / analyticsData.totalVehicles) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 연료 사용량 */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Fuel className="mr-2 h-5 w-5 text-blue-600" />
                  연료 사용량
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">오늘</span>
                    <span className="font-semibold">{analyticsData.fuelUsage.today} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">어제</span>
                    <span className="font-semibold">{analyticsData.fuelUsage.yesterday} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">주간 평균</span>
                    <span className="font-semibold">{analyticsData.fuelUsage.weekAvg} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">어제 대비</span>
                    <span
                      className={`font-semibold ${analyticsData.fuelUsage.today < analyticsData.fuelUsage.yesterday ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {analyticsData.fuelUsage.today < analyticsData.fuelUsage.yesterday
                        ? '▼'
                        : '▲'}
                      {Math.abs(
                        ((analyticsData.fuelUsage.today - analyticsData.fuelUsage.yesterday) /
                          analyticsData.fuelUsage.yesterday) *
                          100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex h-10 w-full items-end rounded-md bg-gray-100 p-1">
                    <div className="h-5 w-1/3 rounded-sm bg-blue-300"></div>
                    <div className="h-7 w-1/3 rounded-sm bg-blue-500"></div>
                    <div className="h-6 w-1/3 rounded-sm bg-blue-400"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 주행 거리 */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 pb-2">
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="mr-2 h-5 w-5 text-purple-600" />
                  주행 거리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">오늘</span>
                    <span className="font-semibold">{analyticsData.distanceCovered.today} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">어제</span>
                    <span className="font-semibold">
                      {analyticsData.distanceCovered.yesterday} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">주간 평균</span>
                    <span className="font-semibold">
                      {analyticsData.distanceCovered.weekAvg} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">어제 대비</span>
                    <span
                      className={`font-semibold ${analyticsData.distanceCovered.today < analyticsData.distanceCovered.yesterday ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {analyticsData.distanceCovered.today < analyticsData.distanceCovered.yesterday
                        ? '▼'
                        : '▲'}
                      {Math.abs(
                        ((analyticsData.distanceCovered.today -
                          analyticsData.distanceCovered.yesterday) /
                          analyticsData.distanceCovered.yesterday) *
                          100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex h-10 w-full items-end rounded-md bg-gray-100 p-1">
                    <div className="h-6 w-1/3 rounded-sm bg-purple-300"></div>
                    <div className="h-7 w-1/3 rounded-sm bg-purple-500"></div>
                    <div className="h-5 w-1/3 rounded-sm bg-purple-400"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 알림 요약 */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Bell className="mr-2 h-5 w-5 text-red-600" />
                  알림 요약
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">긴급</span>
                    <span className="font-semibold text-red-600">
                      {analyticsData.alerts.critical}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">경고</span>
                    <span className="font-semibold text-amber-600">
                      {analyticsData.alerts.warning}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">정보</span>
                    <span className="font-semibold text-blue-600">{analyticsData.alerts.info}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">총 알림</span>
                    <span className="font-semibold">
                      {analyticsData.alerts.critical +
                        analyticsData.alerts.warning +
                        analyticsData.alerts.info}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="grid-cols-19 grid gap-1">
                    <div className="col-span-2 h-2 rounded-full bg-red-500"></div>
                    <div className="col-span-5 h-2 rounded-full bg-amber-500"></div>
                    <div className="col-span-12 h-2 rounded-full bg-blue-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 지역별 차량 분포 차트 */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                지역별 차량 분포
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex h-64 w-full items-end justify-around space-x-2">
                <div className="flex w-1/5 flex-col items-center">
                  <div className="h-40 w-full rounded-t-lg bg-blue-500"></div>
                  <p className="mt-2 text-sm">서울</p>
                </div>
                <div className="flex w-1/5 flex-col items-center">
                  <div className="h-28 w-full rounded-t-lg bg-blue-500"></div>
                  <p className="mt-2 text-sm">경기</p>
                </div>
                <div className="flex w-1/5 flex-col items-center">
                  <div className="h-20 w-full rounded-t-lg bg-blue-500"></div>
                  <p className="mt-2 text-sm">인천</p>
                </div>
                <div className="flex w-1/5 flex-col items-center">
                  <div className="h-32 w-full rounded-t-lg bg-blue-500"></div>
                  <p className="mt-2 text-sm">부산</p>
                </div>
                <div className="flex w-1/5 flex-col items-center">
                  <div className="h-16 w-full rounded-t-lg bg-blue-500"></div>
                  <p className="mt-2 text-sm">기타</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="text-xs">
                  자세히 보기
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
