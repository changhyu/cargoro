'use client';

import React, { useState } from 'react';
import { WorkOrderList } from '@/app/features/work-orders/components/work-order-list';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@cargoro/ui';

// import { ChatRoom, LiveTrackingMap, NotificationCenter } from '@cargoro/realtime';
// import { useAuth } from '@clerk/nextjs';
import { MessageSquare, MapPin, ClipboardList, Bell, Users, Car } from 'lucide-react';

export default function RealtimeDashboard() {
  // const { userId, user } = useAuth();
  const [activeTab, setActiveTab] = useState('work-orders');

  // 예시 데이터 - 실제로는 API에서 가져옴
  const chatRooms = [
    { id: 'workshop-general', name: '정비소 일반 채팅' },
    { id: 'customer-support', name: '고객 지원' },
    { id: 'technician-chat', name: '기술자 채팅방' },
  ];

  const trackingEntities = [
    {
      type: 'delivery' as const,
      id: 'delivery-001',
      info: { name: '김배송', image: '/avatars/driver1.jpg', phone: '010-1234-5678' },
      destination: {
        latitude: 37.5665,
        longitude: 126.978,
        address: '서울특별시 중구 세종대로 110',
      },
    },
    {
      type: 'vehicle' as const,
      id: 'vehicle-002',
      info: { name: '서울01가1234', image: '/avatars/car1.jpg' },
    },
  ];

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">실시간 대시보드</h1>
          <p className="mt-1 text-muted-foreground">
            작업 현황, 채팅, 위치 추적을 실시간으로 확인하세요
          </p>
        </div>
        {/* <NotificationCenter /> */}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            작업 오더
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            채팅
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            위치 추적
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            전체 현황
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders" className="space-y-4">
          <WorkOrderList />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {chatRooms.map(room => (
              <div key={room.id} className="rounded-lg border p-4">
                <p>채팅방: {room.name}</p>
                <p className="text-sm text-muted-foreground">ChatRoom 컴포넌트 준비중...</p>
              </div>
              /* <ChatRoom
                key={room.id}
                roomId={room.id}
                roomName={room.name}
                currentUserId={userId || ''}
                currentUserName={user?.fullName || '익명 사용자'}
                currentUserAvatar={user?.imageUrl}
              /> */
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {trackingEntities.map(entity => (
              <div key={entity.id} className="rounded-lg border p-4">
                <p>추적 대상: {entity.info.name}</p>
                <p className="text-sm text-muted-foreground">LiveTrackingMap 컴포넌트 준비중...</p>
              </div>
              /* <LiveTrackingMap
                key={entity.id}
                entityType={entity.type}
                entityId={entity.id}
                entityInfo={entity.info}
                destination={entity.destination}
              /> */
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">진행중인 작업</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 지난 1시간</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 채팅</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">23개 미읽은 메시지</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">배송 추적중</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">평균 속도 45km/h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">온라인 직원</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">총 15명 중</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>정비소의 최근 활동 내역</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">작업 완료</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">서울01가1234 정비 완료</p>
                    <p className="text-xs text-muted-foreground">5분 전</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">메시지</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">고객 문의 도착</p>
                    <p className="text-xs text-muted-foreground">10분 전</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">배송 시작</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">부품 배송 출발</p>
                    <p className="text-xs text-muted-foreground">15분 전</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>직원 현황</CardTitle>
                <CardDescription>현재 근무중인 직원 상태</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">김정비 - 엔진 정비중</span>
                    </div>
                    <Badge variant="secondary">작업중</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">이기술 - 타이어 교체중</span>
                    </div>
                    <Badge variant="secondary">작업중</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-sm">박정비 - 대기중</span>
                    </div>
                    <Badge variant="outline">대기</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
