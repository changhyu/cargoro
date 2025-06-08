'use client';

import React from 'react';
import { Bell, Calendar, FileSpreadsheet, Activity, Car } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cargoro/ui';

import ExportDriverData from './export-driver-data';
import LicenseExpiryManagement from './license-expiry-management';
import NotificationSystem from './notification-system';

export default function DriverManagementDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">운전자 관리 대시보드</h2>
          <p className="mt-2 text-muted-foreground">
            운전자 알림, 면허증 만료, 성과 관리 및 데이터 내보내기 기능을 통합적으로 관리하세요.
          </p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            알림 센터
          </TabsTrigger>
          <TabsTrigger value="licenses" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            면허증 관리
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            데이터 내보내기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSystem />
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <LicenseExpiryManagement />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportDriverData />
        </TabsContent>
      </Tabs>

      {/* 통계 요약 카드 */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 운전자</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32명</div>
            <p className="text-xs text-muted-foreground">전월 대비 +3명</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 안전점수</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5점</div>
            <p className="text-xs text-muted-foreground">전월 대비 +2.3점</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배정된 차량</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28대</div>
            <p className="text-xs text-muted-foreground">총 35대 중 80%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
