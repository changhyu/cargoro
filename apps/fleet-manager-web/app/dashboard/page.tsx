'use client';

// import { useAuth, useUser } from '@clerk/nextjs';
import React, { useState } from 'react';
import { MapPin, Car, Users, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import DashboardStatistics from '../components/dashboard-statistics';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import VehicleAlerts from '../components/vehicle-alerts';
import VehicleMap from '../components/vehicle-map';
import { VehicleLocation } from '../services/vehicle-location';

// 대시보드 최근 활동 데이터 모의 구현
const recentActivities = [
  {
    id: 1,
    type: '차량 등록',
    description: '새로운 차량이 등록되었습니다: 현대 아반떼 (12가 3456)',
    date: '2023-06-01T09:30:00',
  },
  {
    id: 2,
    type: '정비 완료',
    description: '기아 K5 (34나 5678) 정기 점검 완료',
    date: '2023-05-31T16:45:00',
  },
  {
    id: 3,
    type: '운전자 배정',
    description: '홍길동 운전자가 BMW 5시리즈 (56다 7890)에 배정되었습니다',
    date: '2023-05-30T14:20:00',
  },
  {
    id: 4,
    type: '위치 알림',
    description: '테슬라 모델 3 (90마 1234)가 지정 구역을 벗어났습니다',
    date: '2023-05-30T11:15:00',
  },
  {
    id: 5,
    type: '예약 접수',
    description: '렉서스 ES (23거 4567) 내일 오전 9시 예약 접수됨',
    date: '2023-05-29T17:30:00',
  },
];

// 대시보드 임박한 일정 데이터 모의 구현
const upcomingEvents = [
  {
    id: 1,
    title: '정기 점검',
    vehicle: '현대 아반떼 (12가 3456)',
    date: '2023-06-02T10:00:00',
    type: 'maintenance',
  },
  {
    id: 2,
    title: '렌탈 계약 만료',
    vehicle: '기아 K5 (34나 5678)',
    date: '2023-06-05T00:00:00',
    type: 'contract',
  },
  {
    id: 3,
    title: '보험 갱신',
    vehicle: 'BMW 5시리즈 (56다 7890)',
    date: '2023-06-10T00:00:00',
    type: 'insurance',
  },
];

export default function DashboardPage() {
  // const { isLoaded, isSignedIn } = useAuth();
  // const { user } = useUser();

  // 임시로 항상 로그인된 것으로 처리
  const isLoaded = true;
  const isSignedIn = true;
  const _user = { firstName: '관리자' };

  const [_selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null);
  const [mapVisible, setMapVisible] = useState(true);

  // 알림에서 지도로 이동 핸들러
  const handleShowOnMap = (vehicle: VehicleLocation) => {
    setSelectedVehicle(vehicle);
    setMapVisible(true);

    // 만약 지도가 현재 보이지 않는다면 해당 지점으로 스크롤
    if (!mapVisible) {
      const mapElement = document.getElementById('map-preview');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 로딩 중일 때 표시
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않았을 때 표시
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">
          로그인이 필요합니다.{' '}
          <Link href="/sign-in" className="text-blue-500 hover:underline">
            로그인 하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* 통계 섹션 */}
      <DashboardStatistics />

      {/* 지도 미리보기 및 알림 섹션 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 지도 미리보기 */}
        <Card className="lg:col-span-2" id="map-preview">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">차량 위치 미리보기</CardTitle>
              <Link href="/dashboard/map">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  전체보기 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>현재 운행 중인 차량의 위치를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] overflow-hidden rounded-b-lg">
              <VehicleMap height="100%" onVehicleClick={setSelectedVehicle} />
            </div>
          </CardContent>
        </Card>

        {/* 차량 알림 */}
        <VehicleAlerts onShowMap={handleShowOnMap} limit={3} />
      </div>

      {/* 최근 활동 및 임박한 일정 섹션 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.slice(0, 4).map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 text-sm">
                  <div className="mt-0.5 rounded-full bg-blue-100 p-1 text-blue-700">
                    {activity.type === '차량 등록' ? (
                      <Car className="h-3 w-3" />
                    ) : activity.type === '운전자 배정' ? (
                      <Users className="h-3 w-3" />
                    ) : activity.type === '위치 알림' ? (
                      <MapPin className="h-3 w-3" />
                    ) : activity.type === '예약 접수' ? (
                      <Calendar className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-blue-700" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(activity.date).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                모든 활동 보기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 임박한 일정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">임박한 일정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(event.date).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleTimeString('ko-KR', {
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                모든 일정 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 예약 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">최근 예약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-gray-500">최근 예약 내역이 없습니다.</p>
            <Button variant="outline" size="sm" className="mt-4">
              새 예약 만들기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
