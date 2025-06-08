'use client';

import React, { useState, useEffect } from 'react';
import { Car, Clock, AlertTriangle, TrendingUp, Activity, Truck, Calendar } from 'lucide-react';

import { vehicleService } from '../services/api';
import { vehicleLocationService, VehicleLocation } from '../services/vehicle-location';

import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

// StatisticsCardProps interface는 사용하지 않음

interface DashboardData {
  totalVehicles: number;
  availableVehicles: number;
  maintenanceVehicles: number;
  totalDrivers: number;
  // other properties...
}

interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
}

interface StatisticCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  colorClass?: string;
  isLoading?: boolean;
}

function StatisticCard({
  title,
  value,
  description,
  icon,
  colorClass = 'bg-blue-100 text-blue-700',
  isLoading = false,
}: StatisticCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <div className="mt-1 h-8 w-24 animate-pulse rounded bg-gray-200"></div>
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
          </div>
          <div className={`rounded-full p-2 ${colorClass}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardStatistics() {
  const [_vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [activeVehicles, setActiveVehicles] = useState(0);
  const [maintenanceVehicles, setMaintenanceVehicles] = useState(0);
  const [idleVehicles, setIdleVehicles] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  // 차량 위치 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 차량 위치 정보 가져오기
        const locationData = await vehicleLocationService.getVehicleLocations();
        setVehicles(locationData);

        // 차량 상태별 통계
        const active = locationData.filter((v: VehicleLocation) => v.status === 'active').length;
        const maintenance = 0; // maintenance 상태는 현재 VehicleLocation에 없음
        const idle = locationData.filter((v: VehicleLocation) => v.status === 'idle').length;

        setActiveVehicles(active);
        setMaintenanceVehicles(maintenance);
        setIdleVehicles(idle);

        // 총 차량 대수 (API 호출)
        const vehicleData = await vehicleService.getVehicles();
        setTotalVehicles(vehicleData.total || locationData.length);

        // 평균 속도 계산
        const activeVehiclesData = locationData.filter(
          (v: VehicleLocation) => v.status === 'active'
        );
        if (activeVehiclesData.length > 0) {
          const totalSpeed = activeVehiclesData.reduce(
            (sum: number, v: VehicleLocation) => sum + (v.speed || 0),
            0
          );
          setAvgSpeed(Math.round(totalSpeed / activeVehiclesData.length));
        } else {
          setAvgSpeed(0);
        }
      } catch (error) {
        // 에러는 무시
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // 주기적인 데이터 갱신 (5분마다)
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">차량 운영 현황</h2>
        <Tabs
          defaultValue={period}
          onValueChange={value => setPeriod(value as 'day' | 'week' | 'month')}
        >
          <TabsList>
            <TabsTrigger value="day">오늘</TabsTrigger>
            <TabsTrigger value="week">이번 주</TabsTrigger>
            <TabsTrigger value="month">이번 달</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="총 보유 차량"
          value={totalVehicles}
          icon={<Car className="h-5 w-5" />}
          colorClass="bg-blue-100 text-blue-700"
          isLoading={isLoading}
        />
        <StatisticCard
          title="운행 중인 차량"
          value={activeVehicles}
          description={`전체의 ${totalVehicles ? Math.round((activeVehicles / totalVehicles) * 100) : 0}%`}
          icon={<Activity className="h-5 w-5" />}
          colorClass="bg-green-100 text-green-700"
          isLoading={isLoading}
        />
        <StatisticCard
          title="정비 중인 차량"
          value={maintenanceVehicles}
          icon={<AlertTriangle className="h-5 w-5" />}
          colorClass="bg-yellow-100 text-yellow-700"
          isLoading={isLoading}
        />
        <StatisticCard
          title="대기 중인 차량"
          value={idleVehicles}
          icon={<Clock className="h-5 w-5" />}
          colorClass="bg-gray-100 text-gray-700"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatisticCard
          title="평균 주행 속도"
          value={`${avgSpeed} km/h`}
          icon={<TrendingUp className="h-5 w-5" />}
          colorClass="bg-indigo-100 text-indigo-700"
          isLoading={isLoading}
        />
        <StatisticCard
          title="이번 달 운행 거리"
          value="4,285 km"
          description={
            period === 'day' ? '오늘: 145 km' : period === 'week' ? '이번 주: 987 km' : ''
          }
          icon={<Truck className="h-5 w-5" />}
          colorClass="bg-purple-100 text-purple-700"
          isLoading={isLoading}
        />
        <StatisticCard
          title="예약된 차량"
          value="8대"
          description="다음 24시간 내"
          icon={<Calendar className="h-5 w-5" />}
          colorClass="bg-pink-100 text-pink-700"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default DashboardStatistics;

const processChartData = (data: DashboardData): ChartDataPoint[] => {
  // Chart data processing logic
  return [
    { name: 'Active', value: data.availableVehicles },
    { name: 'Maintenance', value: data.maintenanceVehicles },
    { name: 'Total', value: data.totalVehicles },
  ];
};
