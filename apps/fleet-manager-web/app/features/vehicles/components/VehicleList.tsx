'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Car,
  MapPin,
  Eye,
  Edit,
  MoreVertical,
  Wrench,
  Calendar,
  Gauge,
} from 'lucide-react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cargoro/ui';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// 차량 타입 정의
interface Vehicle {
  id: string;
  vehicleNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  vin?: string;
  engineType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
  color?: string;
  mileage?: number;
  lastServiceMileage?: number;
  registrationDate: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  _count: {
    repairs: number;
    maintenanceRecords: number;
  };
  locations?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
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

export function VehicleList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [engineTypeFilter, setEngineTypeFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  // 차량 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'vehicles',
      { search: searchQuery, engineType: engineTypeFilter, customerId: customerFilter },
    ],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/vehicles')
      // return response.json()

      // 임시 더미 데이터
      return {
        items: [
          {
            id: '1',
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
            },
            _count: {
              repairs: 5,
              maintenanceRecords: 8,
            },
            locations: [
              {
                latitude: 37.5665,
                longitude: 126.978,
                timestamp: '2025-01-10T10:00:00',
              },
            ],
            createdAt: '2023-01-15',
            updatedAt: '2025-01-10',
          },
          {
            id: '2',
            vehicleNumber: '34나 5678',
            manufacturer: '기아',
            model: 'K5',
            year: 2021,
            engineType: 'HYBRID',
            color: '흰색',
            mileage: 32000,
            lastServiceMileage: 30000,
            registrationDate: '2021-06-20',
            customer: {
              id: '2',
              name: '이영희',
              phone: '010-2345-6789',
            },
            _count: {
              repairs: 3,
              maintenanceRecords: 6,
            },
            createdAt: '2023-02-20',
            updatedAt: '2025-01-08',
          },
          {
            id: '3',
            vehicleNumber: '56다 7890',
            manufacturer: '테슬라',
            model: 'Model 3',
            year: 2022,
            engineType: 'ELECTRIC',
            color: '파랑',
            mileage: 25000,
            registrationDate: '2022-09-10',
            customer: {
              id: '3',
              name: '박민수',
              phone: '010-3456-7890',
            },
            _count: {
              repairs: 1,
              maintenanceRecords: 3,
            },
            createdAt: '2023-03-10',
            updatedAt: '2025-01-05',
          },
        ] as Vehicle[],
        total: 3,
      };
    },
  });

  // 필터링된 데이터
  const filteredData = data?.items?.filter(item => {
    if (engineTypeFilter !== 'all' && item.engineType !== engineTypeFilter) return false;
    if (customerFilter !== 'all' && item.customer?.id !== customerFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.vehicleNumber.toLowerCase().includes(query) ||
        item.manufacturer.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.vin?.toLowerCase().includes(query) ||
        item.customer?.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">로딩중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-destructive">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 차량</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <p className="text-xs text-muted-foreground">등록된 차량</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">정비 필요</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {filteredData?.filter(
                v => v.mileage && v.lastServiceMileage && v.mileage - v.lastServiceMileage > 5000
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">5,000km 초과</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전기차</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData?.filter(v => v.engineType === 'ELECTRIC').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">친환경 차량</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 주행거리</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData && filteredData.length > 0
                ? Math.round(
                    filteredData.reduce((sum, v) => sum + (v.mileage || 0), 0) / filteredData.length
                  ).toLocaleString()
                : 0}
              <span className="text-sm font-normal">km</span>
            </div>
            <p className="text-xs text-muted-foreground">차량당 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 차량 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>차량 관리</CardTitle>
              <CardDescription>등록된 차량을 조회하고 관리합니다</CardDescription>
            </div>
            <Button asChild>
              <Link href="/vehicles/new">
                <Plus className="mr-2 h-4 w-4" />
                차량 등록
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 필터 및 검색 */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="차량번호, 제조사, 모델, 고객명으로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={engineTypeFilter} onValueChange={setEngineTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="엔진 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 타입</SelectItem>
                <SelectItem value="GASOLINE">가솔린</SelectItem>
                <SelectItem value="DIESEL">디젤</SelectItem>
                <SelectItem value="HYBRID">하이브리드</SelectItem>
                <SelectItem value="ELECTRIC">전기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>차량번호</TableHead>
                  <TableHead>차종</TableHead>
                  <TableHead>소유자</TableHead>
                  <TableHead>엔진타입</TableHead>
                  <TableHead>주행거리</TableHead>
                  <TableHead>정비이력</TableHead>
                  <TableHead>위치</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map(vehicle => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{vehicle.vehicleNumber}</div>
                          {vehicle.vin && (
                            <div className="text-xs text-muted-foreground">VIN: {vehicle.vin}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {vehicle.manufacturer} {vehicle.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.year}년 {vehicle.color}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vehicle.customer ? (
                          <div>
                            <div className="font-medium">{vehicle.customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vehicle.customer.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={engineTypeColors[vehicle.engineType]}>
                          {engineTypeLabels[vehicle.engineType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vehicle.mileage ? (
                          <div>
                            <div className="font-medium">{vehicle.mileage.toLocaleString()}km</div>
                            {vehicle.lastServiceMileage && (
                              <div className="text-sm text-muted-foreground">
                                마지막 정비: {vehicle.lastServiceMileage.toLocaleString()}km
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            <span className="text-sm">{vehicle._count.repairs}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{vehicle._count.maintenanceRecords}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vehicle.locations && vehicle.locations.length > 0 ? (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/vehicles/${vehicle.id}/location`}>
                              <MapPin className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">메뉴 열기</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/vehicles/${vehicle.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                상세보기
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/vehicles/${vehicle.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/vehicles/${vehicle.id}/maintenance`}>
                                <Wrench className="mr-2 h-4 w-4" />
                                정비 기록
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/vehicles/${vehicle.id}/location`}>
                                <MapPin className="mr-2 h-4 w-4" />
                                위치 추적
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <div className="text-muted-foreground">조건에 맞는 차량이 없습니다</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
