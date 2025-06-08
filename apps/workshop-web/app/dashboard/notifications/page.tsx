'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ArrowLeft, Bell, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/app/components/ui/badge';

// 테스트용 알림 데이터
const notificationsData = [
  {
    id: 'n-001',
    title: '차량 정비 필요',
    message: '차량 #3의 엔진 오일 교체 주기가 도래했습니다.',
    timestamp: '2023-05-15T08:30:00Z',
    type: 'maintenance',
    isRead: false,
    vehicleId: 'v-003',
    vehicleName: '차량 #3',
    licensePlate: '서울 56다 7890',
    priority: 'high',
  },
  {
    id: 'n-002',
    title: '주행 거리 알림',
    message: '차량 #5가 월간 주행 거리 한도의 90%에 도달했습니다.',
    timestamp: '2023-05-14T15:20:00Z',
    type: 'mileage',
    isRead: false,
    vehicleId: 'v-005',
    vehicleName: '차량 #5',
    licensePlate: '경기 90마 3456',
    priority: 'medium',
  },
  {
    id: 'n-003',
    title: '배터리 상태 경고',
    message: '차량 #8의 배터리 상태가 양호하지 않습니다. 점검이 필요합니다.',
    timestamp: '2023-05-14T10:15:00Z',
    type: 'battery',
    isRead: false,
    vehicleId: 'v-008',
    vehicleName: '차량 #8',
    licensePlate: '경기 67바 3412',
    priority: 'high',
  },
  {
    id: 'n-004',
    title: '운전자 교체 알림',
    message: '차량 #1의 운전자가 김운전에서 이주행으로 변경되었습니다.',
    timestamp: '2023-05-13T09:45:00Z',
    type: 'driver',
    isRead: false,
    vehicleId: 'v-001',
    vehicleName: '차량 #1',
    licensePlate: '서울 12가 3456',
    priority: 'low',
  },
  {
    id: 'n-005',
    title: '과속 경고',
    message: '차량 #9가 제한 속도를 초과했습니다. 위치: 경부고속도로',
    timestamp: '2023-05-13T14:30:00Z',
    type: 'speed',
    isRead: false,
    vehicleId: 'v-009',
    vehicleName: '차량 #9',
    licensePlate: '인천 56라 1234',
    priority: 'high',
  },
  {
    id: 'n-006',
    title: '타이어 공기압 경고',
    message: '차량 #12의 왼쪽 앞 타이어 공기압이 낮습니다. 점검이 필요합니다.',
    timestamp: '2023-05-12T11:20:00Z',
    type: 'tire',
    isRead: false,
    vehicleId: 'v-012',
    vehicleName: '차량 #12',
    licensePlate: '경기 78마 5678',
    priority: 'medium',
  },
  {
    id: 'n-007',
    title: '연료 부족 경고',
    message: '차량 #7의 연료가 20% 미만입니다. 주유가 필요합니다.',
    timestamp: '2023-05-12T08:10:00Z',
    type: 'fuel',
    isRead: false,
    vehicleId: 'v-007',
    vehicleName: '차량 #7',
    licensePlate: '서울 34다 7890',
    priority: 'medium',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState('all');

  // 알림 읽음 표시 핸들러
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  // 현재 필터에 맞는 알림 가져오기
  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  };

  // 우선순위에 따른 배지 색상
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="border-red-200 bg-red-100 text-red-800">높음</Badge>;
      case 'medium':
        return <Badge className="border-amber-200 bg-amber-100 text-amber-800">중간</Badge>;
      case 'low':
        return <Badge className="border-blue-200 bg-blue-100 text-blue-800">낮음</Badge>;
      default:
        return null;
    }
  };

  // 알림 유형에 따른 아이콘
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return (
          <div className="rounded-full bg-purple-100 p-2">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
        );
      case 'battery':
        return (
          <div className="rounded-full bg-red-100 p-2">
            <Bell className="h-5 w-5 text-red-600" />
          </div>
        );
      case 'mileage':
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
        );
      case 'speed':
        return (
          <div className="rounded-full bg-red-100 p-2">
            <Bell className="h-5 w-5 text-red-600" />
          </div>
        );
      case 'tire':
        return (
          <div className="rounded-full bg-amber-100 p-2">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
        );
      case 'fuel':
        return (
          <div className="rounded-full bg-amber-100 p-2">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
        );
      case 'driver':
        return (
          <div className="rounded-full bg-green-100 p-2">
            <Bell className="h-5 w-5 text-green-600" />
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2">
            <Bell className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">알림</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            모두 읽음 표시
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium text-red-800">
              <div className="mr-2 rounded-full bg-red-100 p-2">
                <Bell className="h-4 w-4 text-red-600" />
              </div>
              미확인 알림 {notifications.filter(n => !n.isRead).length}개
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">
              {notifications.filter(n => !n.isRead).length}개의 미확인 알림이 있습니다. 알림을
              확인하고 필요한 조치를 취하세요.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="unread">읽지 않음</TabsTrigger>
            <TabsTrigger value="maintenance">정비</TabsTrigger>
            <TabsTrigger value="battery">배터리</TabsTrigger>
            <TabsTrigger value="speed">과속</TabsTrigger>
            <TabsTrigger value="fuel">연료</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {getFilteredNotifications().map(notification => (
          <Card
            key={notification.id}
            className={`${notification.isRead ? 'bg-white' : 'border-red-200 bg-red-50'} transition-colors`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {getTypeIcon(notification.type)}

                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h3
                      className={`font-medium ${notification.isRead ? 'text-gray-900' : 'text-red-900'}`}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(notification.priority)}
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`mb-2 text-sm ${notification.isRead ? 'text-gray-600' : 'text-red-700'}`}
                  >
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{notification.vehicleName}</span> (
                      {notification.licensePlate})
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      disabled={notification.isRead}
                    >
                      {notification.isRead ? '읽음' : '읽음 표시'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
