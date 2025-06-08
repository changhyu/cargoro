'use client';

import { useEffect, useRef } from 'react';
import {
  Car,
  FileText,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

import { useRentalStore } from '@/app/state/rental-store';
import { loadSampleData } from '@/app/utils/sample-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RentalDashboard() {
  const store = useRentalStore();
  const {
    getFleetStatistics,
    loadVehicles,
    loadRentalContracts,
    loadLeaseContracts,
    loadPayments,
    vehicles,
    customers,
    isLoading,
  } = store;

  const stats = getFleetStatistics();
  const isDataLoaded = useRef(false);

  useEffect(() => {
    // 초기 데이터가 없으면 샘플 데이터 로드
    if (!isDataLoaded.current && vehicles.length === 0 && customers.length === 0) {
      loadSampleData(store);
      isDataLoaded.current = true;
    }

    // 기존 데이터 로드
    Promise.all([loadVehicles(), loadRentalContracts(), loadLeaseContracts(), loadPayments()]);
  }, [
    store,
    vehicles.length,
    customers.length,
    loadVehicles,
    loadRentalContracts,
    loadLeaseContracts,
    loadPayments,
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">렌터카/리스 관리 대시보드</h1>
        <p className="mt-2 text-gray-600">차량 및 계약 현황을 한눈에 확인하세요</p>
      </div>

      {/* 주요 통계 카드 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 차량</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}대</div>
            <p className="text-xs text-muted-foreground">이용 가능: {stats.availableVehicles}대</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 계약</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRentals + stats.activeLeases}건</div>
            <p className="text-xs text-muted-foreground">
              렌탈: {stats.activeRentals} | 리스: {stats.activeLeases}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">전월 대비 +12.5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연체금액</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">즉시 처리 필요</p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 버튼 */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/features/rental/new">
          <Button className="w-full" variant="default">
            <Car className="mr-2 h-4 w-4" />새 렌탈 계약
          </Button>
        </Link>

        <Link href="/features/lease/new">
          <Button className="w-full" variant="outline">
            <FileText className="mr-2 h-4 w-4" />새 리스 계약
          </Button>
        </Link>

        <Link href="/features/reservations/new">
          <Button className="w-full" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            예약 등록
          </Button>
        </Link>

        <Link href="/vehicles/new">
          <Button className="w-full" variant="outline">
            <Car className="mr-2 h-4 w-4" />
            차량 등록
          </Button>
        </Link>
      </div>

      {/* 주요 섹션 링크 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link href="/vehicles">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                차량 관리
                <Car className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">보유 차량 현황 및 상태 관리</p>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>대여 중</span>
                  <span className="font-medium">{stats.rentedVehicles}대</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>정비 중</span>
                  <span className="font-medium">{stats.maintenanceVehicles}대</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link href="/features/contracts">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                계약 관리
                <FileText className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">렌탈 및 리스 계약 통합 관리</p>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>활성 렌탈</span>
                  <span className="font-medium">{stats.activeRentals}건</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>활성 리스</span>
                  <span className="font-medium">{stats.activeLeases}건</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link href="/customers">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                고객 관리
                <Users className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">개인 및 법인 고객 정보 관리</p>
              <div className="mt-4">
                <Button variant="link" className="h-auto p-0">
                  고객 목록 보기 →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link href="/features/reservations">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                예약 관리
                <Calendar className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">차량 예약 및 배차 스케줄 관리</p>
              <div className="mt-4">
                <Button variant="link" className="h-auto p-0">
                  예약 현황 보기 →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link href="/features/finance">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                재무 관리
                <DollarSign className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">결제, 청구 및 수익 분석</p>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>이번 달 매출</span>
                  <span className="font-medium">{formatCurrency(stats.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>연체 금액</span>
                  <span className="font-medium">{formatCurrency(stats.overdueAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link href="/features/reports">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                보고서 및 분석
                <TrendingUp className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">운영 현황 분석 및 보고서 생성</p>
              <div className="mt-4">
                <Button variant="link" className="h-auto p-0">
                  분석 대시보드 보기 →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            최근 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">새 렌탈 계약 체결</p>
                <p className="text-sm text-gray-600">김민수 고객 - 소나타 DN8</p>
              </div>
              <span className="text-sm text-gray-500">5분 전</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">차량 반납 완료</p>
                <p className="text-sm text-gray-600">이영희 고객 - K5 DL3</p>
              </div>
              <span className="text-sm text-gray-500">1시간 전</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">리스 계약 갱신</p>
                <p className="text-sm text-gray-600">(주)테크솔루션 - 카니발 5대</p>
              </div>
              <span className="text-sm text-gray-500">3시간 전</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
