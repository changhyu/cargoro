'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Search,
  Plus,
  Users,
  Car,
  Wrench,
  DollarSign,
  Eye,
  Edit,
  MoreVertical,
  Home,
  User,
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

// 고객 타입 정의
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  businessNumber?: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE';
  totalSpent: number;
  createdAt: string;
  _count: {
    vehicles: number;
    repairs: number;
    invoices: number;
  };
}

// 고객 타입 색상
const customerTypeColors = {
  INDIVIDUAL: 'default',
  BUSINESS: 'secondary',
} as const;

// 고객 타입 한글 매핑
const customerTypeLabels = {
  INDIVIDUAL: '개인',
  BUSINESS: '사업자',
};

// 상태 색상
const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'destructive',
} as const;

// 상태 한글 매핑
const statusLabels = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
};

export function CustomerList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 고객 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'customers',
      { search: searchQuery, customerType: customerTypeFilter, status: statusFilter },
    ],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/customers')
      // return response.json()

      // 임시 더미 데이터
      return {
        items: [
          {
            id: '1',
            name: '김철수',
            email: 'kim@example.com',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            customerType: 'INDIVIDUAL',
            status: 'ACTIVE',
            totalSpent: 2500000,
            createdAt: '2023-01-15',
            _count: {
              vehicles: 2,
              repairs: 8,
              invoices: 8,
            },
          },
          {
            id: '2',
            name: '이영희',
            email: 'lee@example.com',
            phone: '010-2345-6789',
            address: '서울시 서초구',
            customerType: 'INDIVIDUAL',
            status: 'ACTIVE',
            totalSpent: 1800000,
            createdAt: '2023-02-20',
            _count: {
              vehicles: 1,
              repairs: 5,
              invoices: 5,
            },
          },
          {
            id: '3',
            name: '(주)우리물류',
            email: 'info@woorilogistics.com',
            phone: '02-1234-5678',
            address: '서울시 중구',
            businessNumber: '123-45-67890',
            customerType: 'BUSINESS',
            status: 'ACTIVE',
            totalSpent: 15000000,
            createdAt: '2023-03-10',
            _count: {
              vehicles: 15,
              repairs: 45,
              invoices: 30,
            },
          },
          {
            id: '4',
            name: '박민수',
            email: 'park@example.com',
            phone: '010-3456-7890',
            customerType: 'INDIVIDUAL',
            status: 'INACTIVE',
            totalSpent: 500000,
            createdAt: '2023-04-05',
            _count: {
              vehicles: 1,
              repairs: 2,
              invoices: 2,
            },
          },
        ] as Customer[],
        total: 4,
      };
    },
  });

  // 필터링된 데이터
  const filteredData = data?.items?.filter(item => {
    if (customerTypeFilter !== 'all' && item.customerType !== customerTypeFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.includes(query) ||
        item.businessNumber?.includes(query)
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

  // 통계 계산
  const totalCustomers = filteredData?.length || 0;
  const activeCustomers = filteredData?.filter(c => c.status === 'ACTIVE').length || 0;
  const businessCustomers = filteredData?.filter(c => c.customerType === 'BUSINESS').length || 0;
  const totalRevenue = filteredData?.reduce((sum, c) => sum + c.totalSpent, 0) || 0;

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 고객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">활성: {activeCustomers}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사업자 고객</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0 ? Math.round((businessCustomers / totalCustomers) * 100) : 0}%
              비율
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 차량</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData?.reduce((sum, c) => sum + c._count.vehicles, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">고객 보유 차량</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{Math.round(totalRevenue / 1000000)}M</div>
            <p className="text-xs text-muted-foreground">누적 거래액</p>
          </CardContent>
        </Card>
      </div>

      {/* 고객 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>고객 관리</CardTitle>
              <CardDescription>등록된 고객을 조회하고 관리합니다</CardDescription>
            </div>
            <Button asChild>
              <Link href="/customers/new">
                <Plus className="mr-2 h-4 w-4" />
                고객 등록
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
                placeholder="이름, 이메일, 전화번호, 사업자번호로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="고객 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                <SelectItem value="INDIVIDUAL">개인</SelectItem>
                <SelectItem value="BUSINESS">사업자</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="ACTIVE">활성</SelectItem>
                <SelectItem value="INACTIVE">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>고객명</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>보유차량</TableHead>
                  <TableHead>누적거래</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {customer.customerType === 'BUSINESS' ? (
                            <Home className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <div>{customer.name}</div>
                            {customer.businessNumber && (
                              <div className="text-xs text-muted-foreground">
                                사업자: {customer.businessNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.phone}</div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customerTypeColors[customer.customerType]}>
                          {customerTypeLabels[customer.customerType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            <span className="text-sm">{customer._count.vehicles}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">₩{customer.totalSpent.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            정비 {customer._count.repairs}건
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[customer.status]}>
                          {statusLabels[customer.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(customer.createdAt), 'yyyy.MM.dd')}
                        </span>
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
                              <Link href={`/customers/${customer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                상세보기
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/customers/${customer.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/customers/${customer.id}/vehicles`}>
                                <Car className="mr-2 h-4 w-4" />
                                차량 목록
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/customers/${customer.id}/repairs`}>
                                <Wrench className="mr-2 h-4 w-4" />
                                정비 이력
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
                      <div className="text-muted-foreground">조건에 맞는 고객이 없습니다</div>
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
