'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Truck,
  Plus,
  File,
  MoreVertical,
  Check,
  X,
  Loader2,
  MapPin,
  User,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  useDeliveriesQuery,
  useUpdateDeliveryStatus,
  DeliveryStatus,
  DeliveryPriority,
  DeliveryFilters,
} from '../../services/delivery-service';

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

const _mockDeliveries: Delivery[] = [
  {
    id: 'del001',
    vehicleId: '1',
    vehicleName: '현대 아반떼 (12가 3456)',
    customerName: '홍길동',
    contactNumber: '010-1234-5678',
    driverId: 'drv001',
    driverName: '김기사',
    status: 'in_progress',
    pickupLocation: {
      address: '서울시 강남구 테헤란로 152',
      latitude: 37.5037,
      longitude: 127.0449,
    },
    deliveryLocation: {
      address: '서울시 서초구 서초대로 398',
      latitude: 37.5024,
      longitude: 127.0243,
    },
    requestedDate: '2024-05-24',
    scheduledDate: '2024-05-25',
    notes: '차량 열쇠는 정문 경비실에 맡겨주세요.',
    priority: 'high',
    distance: 5.2,
    estimatedDuration: 25,
  },
  {
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
  },
  {
    id: 'del003',
    vehicleId: '3',
    vehicleName: 'BMW 5시리즈 (56다 7890)',
    customerName: '이영희',
    contactNumber: '010-3456-7890',
    driverId: 'drv002',
    driverName: '박운전',
    status: 'completed',
    pickupLocation: {
      address: '서울시 용산구 이태원로 217',
      latitude: 37.5407,
      longitude: 126.994,
    },
    deliveryLocation: {
      address: '서울시 마포구 와우산로 94',
      latitude: 37.552,
      longitude: 126.9229,
    },
    requestedDate: '2024-05-20',
    scheduledDate: '2024-05-21',
    completedDate: '2024-05-21',
    notes: '배송 완료 확인됨',
    priority: 'medium',
    distance: 6.3,
    estimatedDuration: 30,
  },
  {
    id: 'del004',
    vehicleId: '4',
    vehicleName: '테슬라 모델 3 (78라 9012)',
    customerName: '박민준',
    contactNumber: '010-4567-8901',
    status: 'cancelled',
    pickupLocation: {
      address: '서울시 중구 을지로 66',
      latitude: 37.5677,
      longitude: 126.985,
    },
    deliveryLocation: {
      address: '서울시 동대문구 왕산로 214',
      latitude: 37.5781,
      longitude: 127.0251,
    },
    requestedDate: '2024-05-22',
    scheduledDate: '2024-05-23',
    notes: '고객 요청으로 취소됨',
    priority: 'low',
    distance: 4.5,
    estimatedDuration: 20,
  },
  {
    id: 'del005',
    vehicleId: '5',
    vehicleName: '쌍용 렉스턴 (90마 1234)',
    customerName: '정수진',
    contactNumber: '010-5678-9012',
    driverId: 'drv003',
    driverName: '최택배',
    status: 'assigned',
    pickupLocation: {
      address: '서울시 성동구 왕십리로 410',
      latitude: 37.548,
      longitude: 127.0451,
    },
    deliveryLocation: {
      address: '서울시 광진구 능동로 120',
      latitude: 37.5542,
      longitude: 127.0756,
    },
    requestedDate: '2024-05-26',
    scheduledDate: '2024-05-27',
    priority: 'high',
    distance: 3.8,
    estimatedDuration: 15,
  },
];

// 상태에 따른 Badge 색상 및 텍스트
const statusConfig = {
  [DeliveryStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-800', text: '대기중' },
  [DeliveryStatus.ASSIGNED]: { color: 'bg-blue-100 text-blue-800', text: '배정됨' },
  [DeliveryStatus.IN_PROGRESS]: { color: 'bg-purple-100 text-purple-800', text: '진행중' },
  [DeliveryStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', text: '완료' },
  [DeliveryStatus.CANCELLED]: { color: 'bg-red-100 text-red-800', text: '취소' },
};

// 우선순위에 따른 Badge 색상 및 텍스트
const priorityConfig = {
  [DeliveryPriority.HIGH]: { color: 'bg-red-100 text-red-800', text: '높음' },
  [DeliveryPriority.MEDIUM]: { color: 'bg-yellow-100 text-yellow-800', text: '중간' },
  [DeliveryPriority.LOW]: { color: 'bg-green-100 text-green-800', text: '낮음' },
};

export default function DeliveriesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // API 필터 구성
  const getFilters = (): DeliveryFilters => {
    const filters: DeliveryFilters = {};

    if (statusFilter !== 'all') {
      filters.status = statusFilter as DeliveryStatus;
    }

    if (priorityFilter !== 'all') {
      filters.priority = priorityFilter as DeliveryPriority;
    }

    if (searchQuery) {
      filters.search = searchQuery;
    }

    return filters;
  };

  // React Query 훅 사용
  const { data, isLoading } = useDeliveriesQuery(getFilters());
  const updateDeliveryStatus = useUpdateDeliveryStatus();

  // 데이터 로드 상태 처리
  const deliveries = data?.items || [];
  const loading = isLoading;

  // 필터링된 배송 목록
  const filteredDeliveries = deliveries.filter(delivery => {
    // 탭 필터
    if (activeTab !== 'all') {
      if (
        activeTab === 'active' &&
        [DeliveryStatus.COMPLETED, DeliveryStatus.CANCELLED].includes(delivery.status)
      ) {
        return false;
      }
      if (activeTab === 'completed' && delivery.status !== DeliveryStatus.COMPLETED) {
        return false;
      }
      if (activeTab === 'cancelled' && delivery.status !== DeliveryStatus.CANCELLED) {
        return false;
      }
    }
    return true;
  });

  // 배송 상태 변경 핸들러
  const handleStatusChange = async (id: string, newStatus: DeliveryStatus) => {
    try {
      await updateDeliveryStatus.mutateAsync({
        id,
        data: {
          status: newStatus,
          // 완료 상태로 변경 시 완료 날짜 추가
          ...(newStatus === DeliveryStatus.COMPLETED
            ? { completedDate: new Date().toISOString().split('T')[0] }
            : {}),
        },
      });
    } catch (_error) {
      // 에러 처리는 React Query의 onError 핸들러에서 처리됨
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">탁송 관리</h1>
        <Button onClick={() => router.push('/dashboard/deliveries/create')}>
          <Plus className="mr-2 h-4 w-4" /> 새 탁송 등록
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="active">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="cancelled">취소</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* 필터 및 검색 */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>필터 및 검색</CardTitle>
              <CardDescription>탁송 목록을 필터링하거나 검색할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">상태</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="pending">대기중</SelectItem>
                      <SelectItem value="assigned">배정됨</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">우선순위</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="우선순위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="medium">중간</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">검색</label>
                  <Input
                    placeholder="고객명, 차량, 주소 등"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 탁송 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>탁송 목록</CardTitle>
              <CardDescription>{filteredDeliveries.length}개의 탁송이 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Truck className="mx-auto mb-4 h-12 w-12 opacity-20" />
                  <p>표시할 탁송이 없습니다.</p>
                  {searchQuery && <p className="mt-2 text-sm">검색 조건을 변경해 보세요.</p>}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>차량</TableHead>
                      <TableHead>고객</TableHead>
                      <TableHead>출발지 → 도착지</TableHead>
                      <TableHead>기사</TableHead>
                      <TableHead>일정</TableHead>
                      <TableHead>우선순위</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map(delivery => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">{delivery.id}</TableCell>
                        <TableCell>{delivery.vehicleName}</TableCell>
                        <TableCell>
                          <div>{delivery.customerName}</div>
                          <div className="text-xs text-gray-500">{delivery.contactNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-700">
                                {delivery.pickupLocation.address}
                              </div>
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <ChevronDown className="mr-1 h-3 w-3" />
                              </div>
                              <div className="text-xs text-gray-700">
                                {delivery.deliveryLocation.address}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {delivery.distance} km (약 {delivery.estimatedDuration}분)
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {delivery.driverName ? (
                            <div className="flex items-center">
                              <User className="mr-1 h-4 w-4 text-gray-400" />
                              {delivery.driverName}
                            </div>
                          ) : (
                            <span className="text-gray-400">미배정</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="mb-1 flex items-center">
                              <span className="mr-1 text-gray-500">요청:</span>
                              {format(new Date(delivery.requestedDate), 'yy.MM.dd', { locale: ko })}
                            </div>
                            {delivery.scheduledDate && (
                              <div className="flex items-center">
                                <span className="mr-1 text-gray-500">예정:</span>
                                {format(new Date(delivery.scheduledDate), 'yy.MM.dd', {
                                  locale: ko,
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityConfig[delivery.priority].color}>
                            {priorityConfig[delivery.priority].text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[delivery.status].color}>
                            {statusConfig[delivery.status].text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">메뉴</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>작업</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/deliveries/${delivery.id}`)}
                              >
                                <File className="mr-2 h-4 w-4" />
                                상세 보기
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/deliveries/${delivery.id}/edit`)
                                }
                              >
                                <File className="mr-2 h-4 w-4" />
                                수정
                              </DropdownMenuItem>
                              {delivery.status === DeliveryStatus.PENDING && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/dashboard/deliveries/${delivery.id}/assign`)
                                  }
                                >
                                  <User className="mr-2 h-4 w-4 text-blue-600" />
                                  기사 배정
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {delivery.status === DeliveryStatus.PENDING && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(delivery.id, DeliveryStatus.ASSIGNED)
                                  }
                                >
                                  <Check className="mr-2 h-4 w-4 text-blue-600" />
                                  배정으로 변경
                                </DropdownMenuItem>
                              )}
                              {delivery.status === DeliveryStatus.ASSIGNED && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(delivery.id, DeliveryStatus.IN_PROGRESS)
                                  }
                                >
                                  <Truck className="mr-2 h-4 w-4 text-purple-600" />
                                  진행중으로 변경
                                </DropdownMenuItem>
                              )}
                              {(delivery.status === DeliveryStatus.ASSIGNED ||
                                delivery.status === DeliveryStatus.IN_PROGRESS) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(delivery.id, DeliveryStatus.COMPLETED)
                                  }
                                >
                                  <Check className="mr-2 h-4 w-4 text-green-600" />
                                  완료로 변경
                                </DropdownMenuItem>
                              )}
                              {(delivery.status === DeliveryStatus.PENDING ||
                                delivery.status === DeliveryStatus.ASSIGNED) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(delivery.id, DeliveryStatus.CANCELLED)
                                  }
                                >
                                  <X className="mr-2 h-4 w-4 text-red-600" />
                                  취소
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {/* 동일한 카드 내용이 여기에도 표시됩니다 */}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {/* 동일한 카드 내용이 여기에도 표시됩니다 */}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {/* 동일한 카드 내용이 여기에도 표시됩니다 */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
