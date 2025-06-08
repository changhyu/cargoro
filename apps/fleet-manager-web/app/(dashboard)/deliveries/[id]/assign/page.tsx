'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Truck,
  User,
  Search,
  MapPin,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Star,
  Phone,
  ClipboardCheck,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Badge,
  Button,
  Input,
  ScrollArea,
  Skeleton,
} from '@cargoro/ui';

// 모의 데이터 - 실제 구현에서는 API 호출로 대체
interface Delivery {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  contactNumber: string;
  driverId?: string;
  driverName?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  distance?: number;
  estimatedDuration?: number;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseType: string;
  rating: number;
  status: 'available' | 'busy' | 'off_duty';
  currentLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  distance?: number;
  totalDeliveries: number;
  completedToday: number;
  specialization?: string[];
  isActive: boolean;
  vehicle?: {
    id: string;
    name: string;
  };
}

// 모의 배송 데이터
const mockDelivery: Delivery = {
  id: 'del002',
  vehicleId: '2',
  vehicleName: '기아 K5 (34나 5678)',
  customerName: '김철수',
  contactNumber: '010-2345-6789',
  status: 'pending',
  pickupLocation: {
    address: '서울시 송파구 올림픽로 300',
    latitude: 37.5139,
    longitude: 127.1005,
  },
  deliveryLocation: {
    address: '서울시 강동구 천호대로 1077',
    latitude: 37.5384,
    longitude: 127.1368,
  },
  requestedDate: '2024-05-25',
  priority: 'medium',
  distance: 8.7,
  estimatedDuration: 35,
};

// 모의 기사 데이터
const mockDrivers: Driver[] = [
  {
    id: 'drv001',
    name: '김기사',
    phone: '010-1111-2222',
    email: 'driver1@example.com',
    licenseType: '1종 대형',
    rating: 4.8,
    status: 'available',
    currentLocation: {
      address: '서울시 송파구 백제고분로 505',
      latitude: 37.5118,
      longitude: 127.0992,
    },
    distance: 1.2,
    totalDeliveries: 328,
    completedToday: 3,
    specialization: ['승용차', 'SUV'],
    isActive: true,
  },
  {
    id: 'drv002',
    name: '박운전',
    phone: '010-2222-3333',
    email: 'driver2@example.com',
    licenseType: '1종 보통',
    rating: 4.5,
    status: 'available',
    currentLocation: {
      address: '서울시 송파구 석촌호수로 268',
      latitude: 37.5079,
      longitude: 127.1066,
    },
    distance: 2.5,
    totalDeliveries: 156,
    completedToday: 2,
    specialization: ['승용차'],
    isActive: true,
  },
  {
    id: 'drv003',
    name: '최택배',
    phone: '010-3333-4444',
    email: 'driver3@example.com',
    licenseType: '1종 대형',
    rating: 4.9,
    status: 'busy',
    currentLocation: {
      address: '서울시 강동구 천호대로 1045',
      latitude: 37.5375,
      longitude: 127.1349,
    },
    distance: 3.8,
    totalDeliveries: 412,
    completedToday: 5,
    specialization: ['승용차', 'SUV', '화물'],
    isActive: true,
    vehicle: {
      id: 'v005',
      name: '쌍용 렉스턴 (90마 1234)',
    },
  },
  {
    id: 'drv004',
    name: '이탁송',
    phone: '010-4444-5555',
    email: 'driver4@example.com',
    licenseType: '1종 보통',
    rating: 4.2,
    status: 'available',
    currentLocation: {
      address: '서울시 송파구 송파대로 345',
      latitude: 37.5152,
      longitude: 127.1095,
    },
    distance: 4.1,
    totalDeliveries: 87,
    completedToday: 1,
    specialization: ['승용차'],
    isActive: true,
  },
  {
    id: 'drv005',
    name: '정배송',
    phone: '010-5555-6666',
    email: 'driver5@example.com',
    licenseType: '1종 대형',
    rating: 4.7,
    status: 'off_duty',
    totalDeliveries: 256,
    completedToday: 0,
    specialization: ['승용차', 'SUV'],
    isActive: true,
  },
];

// 상태에 따른 Badge 색상 및 텍스트
const driverStatusConfig = {
  available: { color: 'bg-green-100 text-green-800', text: '대기중' },
  busy: { color: 'bg-purple-100 text-purple-800', text: '업무중' },
  off_duty: { color: 'bg-gray-100 text-gray-800', text: '비번' },
};

// 우선순위에 따른 Badge 색상 및 텍스트
const priorityConfig = {
  high: { color: 'bg-red-100 text-red-800', text: '높음' },
  medium: { color: 'bg-yellow-100 text-yellow-800', text: '중간' },
  low: { color: 'bg-green-100 text-green-800', text: '낮음' },
};

interface AssignDriverPageProps {
  params: {
    id: string;
  };
}

export default function AssignDriverPage({ params }: AssignDriverPageProps) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // 배송 및 기사 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingDelivery(true);
        setLoadingDrivers(true);

        // 실제 구현에서는 API 호출
        // const deliveryResponse = await fetch(`/api/deliveries/${params.id}`);
        // const deliveryData = await deliveryResponse.json();
        // setDelivery(deliveryData);

        // 모의 데이터 사용
        setTimeout(() => {
          setDelivery(mockDelivery);
          setLoadingDelivery(false);
        }, 800);

        // 실제 구현에서는 API 호출
        // const driversResponse = await fetch('/api/drivers?available=true');
        // const driversData = await driversResponse.json();
        // setDrivers(driversData);

        // 모의 데이터 사용
        setTimeout(() => {
          setDrivers(mockDrivers);
          setFilteredDrivers(mockDrivers);
          setLoadingDrivers(false);
        }, 1000);
      } catch (_error) {
        setLoadingDelivery(false);
        setLoadingDrivers(false);
      }
    };

    fetchData();
  }, [params.id]);

  // 검색어에 따른 기사 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDrivers(drivers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = drivers.filter(
        driver =>
          driver.name.toLowerCase().includes(query) ||
          driver.phone.includes(query) ||
          driver.email.toLowerCase().includes(query) ||
          driver.currentLocation?.address.toLowerCase().includes(query)
      );
      setFilteredDrivers(filtered);
    }
  }, [searchQuery, drivers]);

  // 기사 배정 처리
  const handleAssignDriver = async () => {
    if (!selectedDriver) return;

    setAssigning(true);
    try {
      // 실제 구현에서는 API 호출
      // await fetch(`/api/deliveries/${params.id}/assign`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ driverId: selectedDriver })
      // });

      // 모의 처리
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 성공 후 상세 페이지로 이동
      router.push(`/dashboard/deliveries/${params.id}`);
    } catch (_error) {
      alert('기사 배정 중 오류가 발생했습니다.');
      setAssigning(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">기사 배정</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 배송 정보 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>배송 정보</CardTitle>
            <CardDescription>배송에 대한 상세 정보</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDelivery ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : delivery ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">차량</h3>
                  <p className="text-base">{delivery.vehicleName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">고객</h3>
                  <p className="text-base">{delivery.customerName}</p>
                  <p className="text-sm text-gray-500">{delivery.contactNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">우선순위</h3>
                  <Badge className={priorityConfig[delivery.priority].color}>
                    {priorityConfig[delivery.priority].text}
                  </Badge>
                </div>
                <div className="pt-2">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">위치</h3>
                  <div className="space-y-2 rounded-md bg-gray-50 p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">출발지</p>
                        <p className="text-sm">{delivery.pickupLocation.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">도착지</p>
                        <p className="text-sm">{delivery.deliveryLocation.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {delivery.distance} km (약 {delivery.estimatedDuration}분)
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">예정 날짜</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{format(new Date(delivery.requestedDate), 'PPP', { locale: ko })}</p>
                  </div>
                </div>
                {delivery.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">비고</h3>
                    <p className="mt-1 text-sm">{delivery.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500">배송 정보를 찾을 수 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 기사 목록 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>기사 선택</CardTitle>
            <CardDescription>배송할 기사를 선택하세요</CardDescription>
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="기사 검색 (이름, 연락처, 이메일)"
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDrivers ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredDrivers.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[240px]">기사</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>위치</TableHead>
                      <TableHead>평점</TableHead>
                      <TableHead>전문분야</TableHead>
                      <TableHead>현재 차량</TableHead>
                      <TableHead className="text-right">선택</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map(driver => (
                      <TableRow
                        key={driver.id}
                        className={
                          selectedDriver === driver.id
                            ? 'bg-blue-50'
                            : driver.status !== 'available'
                              ? 'opacity-60'
                              : ''
                        }
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{driver.name}</div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="h-3 w-3" />
                              {driver.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={driverStatusConfig[driver.status].color}>
                            {driverStatusConfig[driver.status].text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {driver.currentLocation ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex cursor-pointer items-center gap-1">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{driver.distance}km 거리</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{driver.currentLocation.address}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-sm text-gray-400">정보 없음</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{driver.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {driver.specialization?.map(spec => (
                              <span
                                key={spec}
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-xs"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {driver.vehicle ? (
                            <span className="text-sm">{driver.vehicle.name}</span>
                          ) : (
                            <span className="text-sm text-gray-400">없음</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={selectedDriver === driver.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedDriver(driver.id)}
                            disabled={driver.status !== 'available'}
                          >
                            {selectedDriver === driver.id ? (
                              <>
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                선택됨
                              </>
                            ) : (
                              '선택'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <User className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p>표시할 기사가 없습니다.</p>
                {searchQuery && <p className="mt-2 text-sm">검색 조건을 변경해 보세요.</p>}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedDriver ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                    {filteredDrivers.find(d => d.id === selectedDriver)?.name} 기사님이
                    선택되었습니다
                  </div>
                ) : (
                  '기사를 선택해주세요'
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.back()} disabled={assigning}>
                  취소
                </Button>
                <Button onClick={handleAssignDriver} disabled={!selectedDriver || assigning}>
                  {assigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      배정 중...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      기사 배정
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
