'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { Car, User, Calendar, MapPin, Wrench, Edit, Gauge, Fuel, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cargoro/ui';

// 지도 컴포넌트 동적 로드 - 파일이 없으므로 주석 처리
// const Map = dynamic(() => import('./VehicleMap'), { ssr: false })

interface VehicleDetailProps {
  vehicleId: string;
}

// 엔진 타입 색상
const engineTypeColors = {
  GASOLINE: 'default',
  DIESEL: 'secondary',
  HYBRID: 'success',
  ELECTRIC: 'info',
} as const;

// 엔진 타입 한글 매핑
const engineTypeLabels = {
  GASOLINE: '가솔린',
  DIESEL: '디젤',
  HYBRID: '하이브리드',
  ELECTRIC: '전기',
};

// 정비 상태 색상
const repairStatusColors = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

// 정비 상태 한글 매핑
const repairStatusLabels = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

export function VehicleDetail({ vehicleId }: VehicleDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // 차량 상세 정보 조회
  const {
    data: vehicle,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch(`/api/vehicles/${vehicleId}`)
      // return response.json()

      // 임시 더미 데이터
      return {
        id: vehicleId,
        vehicleNumber: '12가 3456',
        manufacturer: '현대',
        model: '소나타',
        year: 2020,
        vin: 'KMHL14JA6LA123456',
        engineType: 'GASOLINE',
        color: '검정',
        mileage: 45000,
        lastServiceMileage: 42000,
        registrationDate: '2020-03-15',
        customer: {
          id: '1',
          name: '김철수',
          phone: '010-1234-5678',
          email: 'kim@example.com',
        },
        repairs: [
          {
            id: '1',
            repairNumber: 'REQ-202501-001',
            description: '엔진오일 교체',
            status: 'COMPLETED',
            actualCost: 85000,
            completedDate: '2024-12-15',
            workshop: {
              name: '현대 서비스센터',
            },
          },
          {
            id: '2',
            repairNumber: 'REQ-202501-002',
            description: '브레이크 패드 교체',
            status: 'IN_PROGRESS',
            estimatedCost: 150000,
            scheduledDate: '2025-01-15',
            workshop: {
              name: '우리정비소',
            },
          },
        ],
        maintenanceRecords: [
          {
            id: '1',
            type: '정기점검',
            description: '10,000km 정기점검',
            mileage: 10000,
            cost: 50000,
            performedAt: '2020-09-15',
          },
          {
            id: '2',
            type: '엔진오일',
            description: '엔진오일 교체',
            mileage: 20000,
            cost: 85000,
            performedAt: '2021-03-20',
          },
        ],
        locations: [
          {
            latitude: 37.5665,
            longitude: 126.978,
            speed: 45,
            heading: 180,
            timestamp: '2025-01-10T10:00:00',
          },
        ],
        statistics: {
          totalRepairs: 5,
          totalMaintenance: 8,
          totalSpent: 580000,
          lastLocation: {
            latitude: 37.5665,
            longitude: 126.978,
            timestamp: '2025-01-10T10:00:00',
          },
        },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">로딩중...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-destructive">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  // 다음 정비 필요 여부 계산
  const needsMaintenance = vehicle.mileage - vehicle.lastServiceMileage > 5000;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <Car className="h-8 w-8" />
            {vehicle.vehicleNumber}
          </h1>
          <p className="text-muted-foreground">
            {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/vehicles/${vehicleId}/maintenance/new`}>
              <Wrench className="mr-2 h-4 w-4" />
              정비 기록 추가
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/vehicles/${vehicleId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
        </div>
      </div>

      {/* 주요 정보 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주행거리</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.mileage?.toLocaleString() || 0}
              <span className="text-sm font-normal">km</span>
            </div>
            <p className="text-xs text-muted-foreground">
              마지막 정비: {vehicle.lastServiceMileage?.toLocaleString() || 0}km
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">엔진 타입</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                engineTypeColors[vehicle.engineType as keyof typeof engineTypeColors] || 'default'
              }
              className="text-base"
            >
              {engineTypeLabels[vehicle.engineType as keyof typeof engineTypeLabels] ||
                vehicle.engineType}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">정비 이력</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicle.statistics.totalRepairs}</div>
            <p className="text-xs text-muted-foreground">
              총 비용: ₩{vehicle.statistics.totalSpent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">정비 필요</CardTitle>
            <AlertCircle
              className={`h-4 w-4 ${needsMaintenance ? 'text-orange-500' : 'text-green-500'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-bold ${needsMaintenance ? 'text-orange-500' : 'text-green-500'}`}
            >
              {needsMaintenance ? '정비 필요' : '정상'}
            </div>
            <p className="text-xs text-muted-foreground">
              {needsMaintenance
                ? `${vehicle.mileage - vehicle.lastServiceMileage}km 주행`
                : '다음 정비까지 여유있음'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="maintenance">정비 기록</TabsTrigger>
          <TabsTrigger value="repairs">정비 이력</TabsTrigger>
          <TabsTrigger value="location">위치</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 차량 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>차량 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">차량번호</p>
                    <p className="text-sm">{vehicle.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">차대번호</p>
                    <p className="text-sm">{vehicle.vin || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">제조사/모델</p>
                    <p className="text-sm">
                      {vehicle.manufacturer} {vehicle.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">연식</p>
                    <p className="text-sm">{vehicle.year}년</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">색상</p>
                    <p className="text-sm">{vehicle.color || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">등록일</p>
                    <p className="text-sm">
                      {format(new Date(vehicle.registrationDate), 'yyyy년 MM월 dd일', {
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 소유자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>소유자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vehicle.customer ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{vehicle.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.customer.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">전화번호</p>
                        <p className="text-sm">{vehicle.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">고객 ID</p>
                        <p className="text-sm">{vehicle.customer.id}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/customers/${vehicle.customer.id}`}>고객 정보 보기</Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">소유자 정보가 없습니다</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>정기 정비 기록</CardTitle>
              <CardDescription>차량의 정기 정비 및 점검 기록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.maintenanceRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        <span className="font-medium">{record.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          {record.mileage.toLocaleString()}km
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(record.performedAt), 'yyyy.MM.dd', { locale: ko })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₩{record.cost.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>정비 요청 이력</CardTitle>
              <CardDescription>정비소에서 진행한 정비 이력입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.repairs.map(repair => (
                  <div
                    key={repair.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repair.repairNumber}</span>
                        <Badge
                          variant={
                            repairStatusColors[repair.status as keyof typeof repairStatusColors] ||
                            'default'
                          }
                        >
                          {repairStatusLabels[repair.status as keyof typeof repairStatusLabels] ||
                            repair.status}
                        </Badge>
                      </div>
                      <p className="text-sm">{repair.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{repair.workshop.name}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {repair.completedDate
                            ? format(new Date(repair.completedDate), 'yyyy.MM.dd', { locale: ko })
                            : repair.scheduledDate
                              ? format(new Date(repair.scheduledDate), 'yyyy.MM.dd 예정', {
                                  locale: ko,
                                })
                              : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₩{(repair.actualCost || repair.estimatedCost || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {repair.actualCost ? '실제 비용' : '예상 비용'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>차량 위치</CardTitle>
              <CardDescription>
                마지막 위치:{' '}
                {vehicle.statistics.lastLocation
                  ? format(
                      new Date(vehicle.statistics.lastLocation.timestamp),
                      'yyyy년 MM월 dd일 HH:mm',
                      { locale: ko }
                    )
                  : '위치 정보 없음'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicle.statistics.lastLocation ? (
                <div className="space-y-4">
                  <div className="h-[400px] overflow-hidden rounded-lg border">
                    {/* <Map 
                      latitude={vehicle.statistics.lastLocation.latitude}
                      longitude={vehicle.statistics.lastLocation.longitude}
                      vehicleNumber={vehicle.vehicleNumber}
                    /> */}
                    <div className="flex h-full items-center justify-center bg-muted">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">위도</p>
                      <p className="text-sm">{vehicle.statistics.lastLocation.latitude}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">경도</p>
                      <p className="text-sm">{vehicle.statistics.lastLocation.longitude}</p>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/vehicles/${vehicleId}/location`}>
                      <MapPin className="mr-2 h-4 w-4" />
                      위치 추적 보기
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <MapPin className="mx-auto mb-4 h-12 w-12" />
                  <p>위치 정보가 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
