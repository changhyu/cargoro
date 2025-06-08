'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import {
  Wrench,
  Plus,
  FileText,
  MoreHorizontal,
  Check,
  X,
  Loader2,
  CalendarDays,
  Car,
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
  useMaintenancesQuery,
  useUpdateMaintenanceStatus,
  MaintenanceStatus,
  MaintenanceType,
  MaintenanceFilters,
} from '../../services/maintenance-service';

// 모의 데이터 - 실제 구현에서는 API 호출로 대체
interface Maintenance {
  id: string;
  vehicleId: string;
  vehicleName: string;
  maintenanceType: 'regular' | 'repair' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  workshopId?: string;
  workshopName?: string;
  scheduledDate: string;
  completedDate?: string;
  description: string;
  cost?: number;
  technician?: string;
  odometer?: number;
  nextMaintenanceDate?: string;
  notes?: string;
  parts?: MaintenancePart[];
}

interface MaintenancePart {
  id: string;
  maintenanceId: string;
  name: string;
  quantity: number;
  cost: number;
  partNumber?: string;
}

interface MaintenanceRecord {
  id: string;
  type: string;
  status: string;
  vehicle: {
    id: string;
    plateNumber: string;
  };
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  description?: string;
}

interface FilterState {
  status: string;
  type: string;
  dateRange: string;
}

const mockMaintenances: Maintenance[] = [
  {
    id: 'mnt001',
    vehicleId: '1',
    vehicleName: '현대 아반떼 (12가 3456)',
    maintenanceType: 'regular',
    status: 'completed',
    workshopId: 'ws001',
    workshopName: '강남 서비스센터',
    scheduledDate: '2024-05-15',
    completedDate: '2024-05-15',
    description: '정기 점검 및 엔진 오일 교체',
    cost: 180000,
    technician: '이기술',
    odometer: 25000,
    nextMaintenanceDate: '2024-11-15',
    notes: '브레이크 패드 마모 상태 확인 필요',
    parts: [
      {
        id: 'p001',
        maintenanceId: 'mnt001',
        name: '엔진 오일',
        quantity: 1,
        cost: 80000,
        partNumber: 'OIL-1234',
      },
      {
        id: 'p002',
        maintenanceId: 'mnt001',
        name: '오일 필터',
        quantity: 1,
        cost: 30000,
        partNumber: 'FILTER-5678',
      },
    ],
  },
  {
    id: 'mnt002',
    vehicleId: '2',
    vehicleName: '기아 K5 (34나 5678)',
    maintenanceType: 'repair',
    status: 'in_progress',
    workshopId: 'ws002',
    workshopName: '서초 서비스센터',
    scheduledDate: '2024-05-22',
    description: '브레이크 패드 교체 및 디스크 검사',
    technician: '박수리',
    odometer: 42000,
    parts: [
      {
        id: 'p003',
        maintenanceId: 'mnt002',
        name: '브레이크 패드 세트',
        quantity: 1,
        cost: 150000,
        partNumber: 'BRAKE-1234',
      },
    ],
  },
  {
    id: 'mnt003',
    vehicleId: '3',
    vehicleName: 'BMW 5시리즈 (56다 7890)',
    maintenanceType: 'emergency',
    status: 'completed',
    workshopId: 'ws003',
    workshopName: '송파 서비스센터',
    scheduledDate: '2024-05-10',
    completedDate: '2024-05-10',
    description: '엔진 경고등 점검 및 센서 교체',
    cost: 520000,
    technician: '김정비',
    odometer: 38000,
    nextMaintenanceDate: '2024-08-10',
    notes: '엔진 경고등 문제 해결됨. 3개월 후 재점검 권장.',
  },
  {
    id: 'mnt004',
    vehicleId: '4',
    vehicleName: '테슬라 모델 3 (78라 9012)',
    maintenanceType: 'regular',
    status: 'scheduled',
    scheduledDate: '2024-05-28',
    description: '정기 점검 및 소프트웨어 업데이트',
    odometer: 15000,
  },
  {
    id: 'mnt005',
    vehicleId: '5',
    vehicleName: '쌍용 렉스턴 (90마 1234)',
    maintenanceType: 'repair',
    status: 'cancelled',
    workshopId: 'ws001',
    workshopName: '강남 서비스센터',
    scheduledDate: '2024-05-18',
    description: '에어컨 가스 충전 및 필터 교체',
    notes: '고객 요청으로 취소됨',
  },
];

// 상태에 따른 Badge 색상 및 텍스트
const statusConfig = {
  [MaintenanceStatus.SCHEDULED]: { color: 'bg-blue-100 text-blue-800', text: '예정됨' },
  [MaintenanceStatus.IN_PROGRESS]: { color: 'bg-yellow-100 text-yellow-800', text: '진행중' },
  [MaintenanceStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', text: '완료' },
  [MaintenanceStatus.CANCELLED]: { color: 'bg-red-100 text-red-800', text: '취소' },
};

// 정비 유형에 따른 Badge 색상 및 텍스트
const typeConfig = {
  [MaintenanceType.REGULAR]: { color: 'bg-green-100 text-green-800', text: '정기 점검' },
  [MaintenanceType.REPAIR]: { color: 'bg-blue-100 text-blue-800', text: '수리' },
  [MaintenanceType.EMERGENCY]: { color: 'bg-red-100 text-red-800', text: '긴급 수리' },
};

export default function MaintenancePage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // API 필터 구성
  const getFilters = (): MaintenanceFilters => {
    const filters: MaintenanceFilters = {};

    if (statusFilter !== 'all') {
      filters.status = statusFilter as MaintenanceStatus;
    }

    if (typeFilter !== 'all') {
      filters.maintenanceType = typeFilter as MaintenanceType;
    }

    if (searchQuery) {
      filters.search = searchQuery;
    }

    return filters;
  };

  // React Query 훅 사용
  const { data, isLoading } = useMaintenancesQuery(getFilters());
  const updateMaintenanceStatus = useUpdateMaintenanceStatus();

  // 데이터 로드 상태 처리
  const maintenances = data?.items || [];
  const loading = isLoading;

  // 필터링된 정비 목록
  const filteredMaintenances = maintenances.filter(maintenance => {
    // 탭 필터
    if (activeTab !== 'all') {
      if (
        activeTab === 'active' &&
        (maintenance.status === MaintenanceStatus.COMPLETED ||
          maintenance.status === MaintenanceStatus.CANCELLED)
      ) {
        return false;
      }
      if (activeTab === 'completed' && maintenance.status !== MaintenanceStatus.COMPLETED) {
        return false;
      }
      if (activeTab === 'scheduled' && maintenance.status !== MaintenanceStatus.SCHEDULED) {
        return false;
      }
    }
    return true;
  });

  // 정비 상태 변경 핸들러
  const handleStatusChange = async (id: string, newStatus: MaintenanceStatus) => {
    try {
      await updateMaintenanceStatus.mutateAsync({
        id,
        data: {
          status: newStatus,
          // 완료 상태로 변경 시 완료 날짜 추가
          ...(newStatus === MaintenanceStatus.COMPLETED
            ? { completedDate: new Date().toISOString().split('T')[0] }
            : {}),
        },
      });
    } catch (error) {
      // 에러 처리는 React Query의 onError 핸들러에서 처리됨
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    // Handle filter changes
  };

  // 정비 비용 계산 함수
  const calculateTotalCost = (maintenance: Maintenance): number => {
    let total = maintenance.cost || 0;
    if (maintenance.parts) {
      const partsCost = maintenance.parts.reduce(
        (sum: number, part: MaintenancePart) => sum + part.cost * part.quantity,
        0
      );
      total += partsCost;
    }
    return total;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">차량 정비 관리</h1>
        <Button onClick={() => router.push('/dashboard/maintenance/create')}>
          <Plus className="mr-2 h-4 w-4" /> 새 정비 등록
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="active">진행중</TabsTrigger>
          <TabsTrigger value="scheduled">예정됨</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* 필터 및 검색 */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>필터 및 검색</CardTitle>
              <CardDescription>정비 목록을 필터링하거나 검색할 수 있습니다.</CardDescription>
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
                      <SelectItem value="scheduled">예정됨</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">정비 유형</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="regular">정기 점검</SelectItem>
                      <SelectItem value="repair">수리</SelectItem>
                      <SelectItem value="emergency">긴급 수리</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">검색</label>
                  <Input
                    placeholder="차량, 정비소, 설명 등"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 정비 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>정비 목록</CardTitle>
              <CardDescription>
                {filteredMaintenances.length}개의 정비 기록이 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : filteredMaintenances.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Wrench className="mx-auto mb-4 h-12 w-12 opacity-20" />
                  <p>표시할 정비 기록이 없습니다.</p>
                  {searchQuery && <p className="mt-2 text-sm">검색 조건을 변경해 보세요.</p>}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>차량</TableHead>
                      <TableHead>정비 유형/상태</TableHead>
                      <TableHead>정비소</TableHead>
                      <TableHead>일정</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>비용</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaintenances.map(maintenance => (
                      <TableRow key={maintenance.id}>
                        <TableCell className="font-medium">{maintenance.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4 text-gray-400" />
                            <span>{maintenance.vehicleName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={typeConfig[maintenance.maintenanceType].color}>
                              {typeConfig[maintenance.maintenanceType].text}
                            </Badge>
                            <Badge className={statusConfig[maintenance.status].color}>
                              {statusConfig[maintenance.status].text}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{maintenance.workshopName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm">
                              <CalendarDays className="mr-1 h-3.5 w-3.5 text-gray-400" />
                              <span>
                                {format(new Date(maintenance.scheduledDate), 'yy.MM.dd', {
                                  locale: ko,
                                })}
                              </span>
                            </div>
                            {maintenance.completedDate && (
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <Check className="mr-1 h-3 w-3" />
                                <span>
                                  완료:{' '}
                                  {format(new Date(maintenance.completedDate), 'yy.MM.dd', {
                                    locale: ko,
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="line-clamp-2 text-sm">{maintenance.description}</span>
                        </TableCell>
                        <TableCell>
                          {maintenance.cost !== undefined ? (
                            <span>{calculateTotalCost(maintenance).toLocaleString()}원</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">메뉴</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>작업</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/maintenance/${maintenance.id}`)
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                상세 보기
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/maintenance/${maintenance.id}/edit`)
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {maintenance.status === MaintenanceStatus.SCHEDULED && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(
                                      maintenance.id,
                                      MaintenanceStatus.IN_PROGRESS
                                    )
                                  }
                                >
                                  <Wrench className="mr-2 h-4 w-4 text-yellow-600" />
                                  진행중으로 변경
                                </DropdownMenuItem>
                              )}
                              {(maintenance.status === MaintenanceStatus.SCHEDULED ||
                                maintenance.status === MaintenanceStatus.IN_PROGRESS) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(maintenance.id, MaintenanceStatus.COMPLETED)
                                  }
                                >
                                  <Check className="mr-2 h-4 w-4 text-green-600" />
                                  완료로 변경
                                </DropdownMenuItem>
                              )}
                              {(maintenance.status === MaintenanceStatus.SCHEDULED ||
                                maintenance.status === MaintenanceStatus.IN_PROGRESS) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(maintenance.id, MaintenanceStatus.CANCELLED)
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

        <TabsContent value="scheduled" className="mt-6">
          {/* 동일한 카드 내용이 여기에도 표시됩니다 */}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {/* 동일한 카드 내용이 여기에도 표시됩니다 */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
