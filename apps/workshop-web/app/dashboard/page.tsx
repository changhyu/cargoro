'use client';

import React, { Suspense } from 'react';
import type { LucideIcon } from 'lucide-react';
import { UserProfileSummary } from '../components/user-profile-summary';
import { UserDetails } from '../components/user-details';
import { useUser } from '@clerk/clerk-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cargoro/ui';
import {
  CalendarIcon,
  CarIcon,
  DollarSignIcon,
  FilesIcon,
  UserIcon,
  UsersIcon,
  WarehouseIcon,
} from 'lucide-react';
import Link from 'next/link';

// 트렌드 표시를 위한 헬퍼 함수들
function getTrendBadgeClassName(direction: string): string {
  if (direction === 'up') {
    return 'bg-green-100 text-green-800';
  }
  if (direction === 'down') {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-800';
}

function getTrendIcon(direction: string): string {
  if (direction === 'up') {
    return '↑';
  }
  if (direction === 'down') {
    return '↓';
  }
  return '→';
}

// 대시보드 요약 카드 컴포넌트
function DashboardCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <div className="mt-2 flex items-center gap-1">
              {trend && (
                <Badge className={getTrendBadgeClassName(trend.direction)}>
                  {getTrendIcon(trend.direction)} {trend.value}
                </Badge>
              )}
              <p className="text-xs text-gray-500">{subtext}</p>
            </div>
          </div>
          <div className="rounded-lg bg-blue-100 p-3">
            <Icon className="h-6 w-6 text-blue-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 바로가기 링크 컴포넌트
function QuickLinkCard({
  title,
  href,
  icon: Icon,
  description,
}: Readonly<{
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}>) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        <Link href={href} className="flex flex-col items-center p-5 text-center no-underline">
          <div className="mb-3 rounded-full bg-blue-100 p-4 text-blue-700 transition-colors group-hover:bg-blue-200">
            <Icon className="h-6 w-6" />
          </div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {description && <div className="mt-1 text-xs text-gray-500">{description}</div>}
        </Link>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { user } = useUser();
  const userName = user ? user.firstName || user.username || '사용자' : '사용자';
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(currentDate);

  if (!user) {
    return <div className="py-10 text-center">사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <Card className="border-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{userName}님, 안녕하세요! 👋</h1>
              <p className="mt-2 text-blue-100">
                카고로 정비소 관리 시스템에 오신 것을 환영합니다.
              </p>
              <div className="mt-1 text-blue-100">{formattedDate}</div>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-white text-blue-800 hover:bg-blue-50" size="lg" asChild>
                <Link href="/dashboard/new-repair">+ 새 정비 작업 등록</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 요약 지표 섹션 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="오늘의 예약"
          value={12}
          subtext="일일 예약 현황"
          icon={CalendarIcon}
          trend={{ direction: 'up', value: '16%' }}
        />
        <DashboardCard
          title="진행 중인 정비"
          value={5}
          subtext="정비사 4명 작업 중"
          icon={FilesIcon}
          trend={{ direction: 'neutral', value: '0%' }}
        />
        <DashboardCard
          title="대기 중인 차량"
          value={3}
          subtext="평균 대기 시간: 25분"
          icon={CarIcon}
          trend={{ direction: 'down', value: '8%' }}
        />
        <DashboardCard
          title="오늘의 매출"
          value="₩1,450,000"
          subtext="목표의 72% 달성"
          icon={DollarSignIcon}
          trend={{ direction: 'up', value: '12%' }}
        />
      </div>

      {/* 사용자 프로필 요약 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="h-full border-0 shadow-md">
            <CardContent className="flex h-full flex-col p-6">
              <h2 className="mb-4 text-xl font-bold">내 프로필</h2>
              <UserProfileSummary />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full border-0 shadow-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">작업 현황</h2>
              <UserDetails />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div>
        <h2 className="mb-4 flex items-center text-xl font-bold">
          <span className="mr-2">바로가기</span>
          <Badge variant="outline" className="text-xs font-normal">
            자주 사용하는 기능
          </Badge>
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          <QuickLinkCard
            title="예약 관리"
            href="/bookings"
            icon={CalendarIcon}
            description="예약 관리 및 일정 계획"
          />
          <QuickLinkCard
            title="정비 작업"
            href="/repairs"
            icon={FilesIcon}
            description="진행중인 정비 작업 관리"
          />
          <QuickLinkCard
            title="고객 관리"
            href="/customers"
            icon={UserIcon}
            description="고객 정보 및 이력 관리"
          />
          <QuickLinkCard
            title="차량 관리"
            href="/vehicles"
            icon={CarIcon}
            description="차량 정보 및 이력 관리"
          />
          <QuickLinkCard
            title="부품 관리"
            href="/parts"
            icon={WarehouseIcon}
            description="재고 및 부품 주문 관리"
          />
          <QuickLinkCard
            title="직원 관리"
            href="/staff"
            icon={UsersIcon}
            description="직원 일정 및 작업 할당"
          />
        </div>
      </div>

      {/* 오늘의 예약 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center text-xl font-bold">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
            오늘의 예약
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/bookings" className="flex items-center gap-2">
              모두 보기 →
            </Link>
          </Button>
        </div>
        <Card className="overflow-hidden border-0 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>시간</TableHead>
                  <TableHead>고객</TableHead>
                  <TableHead>차량</TableHead>
                  <TableHead>서비스</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 더미 데이터 */}
                <TableRow>
                  <TableCell>09:00</TableCell>
                  <TableCell>김철수</TableCell>
                  <TableCell>현대 아반떼 (2022)</TableCell>
                  <TableCell>정기 점검</TableCell>
                  <TableCell>
                    <Badge variant="success">완료</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>10:30</TableCell>
                  <TableCell>이영희</TableCell>
                  <TableCell>기아 K5 (2021)</TableCell>
                  <TableCell>엔진 오일 교체</TableCell>
                  <TableCell>
                    <Badge variant="primary">진행 중</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>13:00</TableCell>
                  <TableCell>박지민</TableCell>
                  <TableCell>BMW 520d (2020)</TableCell>
                  <TableCell>브레이크 패드 교체</TableCell>
                  <TableCell>
                    <Badge variant="warning">대기 중</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 대시보드 페이지 기본 내보내기
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">데이터를 불러오는 중...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
