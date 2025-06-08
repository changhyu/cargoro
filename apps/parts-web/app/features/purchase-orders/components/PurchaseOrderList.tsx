'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Search,
  Plus,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  MoreVertical,
  Package,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { format } from 'date-fns';
// ko locale은 필요 시에만 import
import { cn } from '@/lib/utils';

// 구매 주문 타입 정의
interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  supplierContact?: string;
  expectedDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  itemCount: number;
  progressPercentage: number;
  isOverdue: boolean;
}

// 상태 색상 매핑
const statusColors = {
  DRAFT: 'secondary',
  ORDERED: 'default',
  PARTIALLY_RECEIVED: 'warning',
  RECEIVED: 'success',
  CANCELLED: 'destructive',
} as const;

// 상태 한글 매핑
const statusLabels = {
  DRAFT: '임시저장',
  ORDERED: '주문완료',
  PARTIALLY_RECEIVED: '부분입고',
  RECEIVED: '입고완료',
  CANCELLED: '취소됨',
};

export function PurchaseOrderList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 구매 주문 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['purchaseOrders', { search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/purchase-orders')
      // return response.json()

      // 임시 더미 데이터
      return {
        items: [
          {
            id: '1',
            orderNumber: 'PO-20250110-0001',
            supplierName: '한국모빌',
            supplierContact: '02-1234-5678',
            expectedDate: '2025-01-15',
            totalAmount: 500000,
            status: 'ORDERED',
            notes: '긴급 발주',
            createdAt: '2025-01-10T09:00:00',
            createdBy: {
              id: '1',
              name: '김구매',
            },
            itemCount: 5,
            progressPercentage: 0,
            isOverdue: false,
          },
          {
            id: '2',
            orderNumber: 'PO-20250108-0003',
            supplierName: '보쉬코리아',
            expectedDate: '2025-01-12',
            totalAmount: 1200000,
            status: 'PARTIALLY_RECEIVED',
            createdAt: '2025-01-08T14:00:00',
            createdBy: {
              id: '2',
              name: '이관리',
            },
            itemCount: 8,
            progressPercentage: 60,
            isOverdue: false,
          },
          {
            id: '3',
            orderNumber: 'PO-20250105-0002',
            supplierName: '오일뱅크',
            expectedDate: '2025-01-08',
            totalAmount: 800000,
            status: 'RECEIVED',
            createdAt: '2025-01-05T10:00:00',
            createdBy: {
              id: '1',
              name: '김구매',
            },
            itemCount: 10,
            progressPercentage: 100,
            isOverdue: false,
          },
          {
            id: '4',
            orderNumber: 'PO-20250103-0001',
            supplierName: '파츠프로',
            expectedDate: '2025-01-05',
            totalAmount: 450000,
            status: 'ORDERED',
            createdAt: '2025-01-03T11:00:00',
            createdBy: {
              id: '2',
              name: '이관리',
            },
            itemCount: 3,
            progressPercentage: 0,
            isOverdue: true,
          },
        ] as PurchaseOrder[],
        total: 4,
      };
    },
  });

  // 필터링된 데이터
  const filteredData = data?.items?.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.orderNumber.toLowerCase().includes(query) ||
        item.supplierName.toLowerCase().includes(query)
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
  const totalOrders = filteredData?.length || 0;
  const pendingOrders = filteredData?.filter(o => o.status === 'ORDERED').length || 0;
  const overdueOrders = filteredData?.filter(o => o.isOverdue).length || 0;
  const totalAmount = filteredData?.reduce((sum, o) => sum + o.totalAmount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 주문</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">구매 주문 건수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">입고 대기중</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지연</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueOrders}</div>
            <p className="text-xs text-muted-foreground">예정일 초과</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주문 금액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{Math.round(totalAmount / 1000000)}M</div>
            <p className="text-xs text-muted-foreground">총 주문액</p>
          </CardContent>
        </Card>
      </div>

      {/* 구매 주문 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>구매 주문 관리</CardTitle>
              <CardDescription>부품 구매 주문을 관리합니다</CardDescription>
            </div>
            <Button asChild>
              <Link href="/purchase-orders/new">
                <Plus className="mr-2 h-4 w-4" />새 주문
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
                placeholder="주문번호, 공급업체명으로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="DRAFT">임시저장</SelectItem>
                <SelectItem value="ORDERED">주문완료</SelectItem>
                <SelectItem value="PARTIALLY_RECEIVED">부분입고</SelectItem>
                <SelectItem value="RECEIVED">입고완료</SelectItem>
                <SelectItem value="CANCELLED">취소됨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문번호</TableHead>
                  <TableHead>공급업체</TableHead>
                  <TableHead>주문일</TableHead>
                  <TableHead>예정일</TableHead>
                  <TableHead>항목</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>진행률</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {order.orderNumber}
                          {order.isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.supplierName}</div>
                          {order.supplierContact && (
                            <div className="text-sm text-muted-foreground">
                              {order.supplierContact}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), 'MM.dd')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn('text-sm', order.isOverdue && 'font-medium text-red-500')}
                        >
                          {format(new Date(order.expectedDate), 'MM.dd')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span className="text-sm">{order.itemCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₩{order.totalAmount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        {order.status !== 'DRAFT' && order.status !== 'CANCELLED' && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={cn(
                                    'h-full transition-all',
                                    order.progressPercentage === 100 && 'bg-green-500',
                                    order.progressPercentage > 0 &&
                                      order.progressPercentage < 100 &&
                                      'bg-blue-500',
                                    order.progressPercentage === 0 && 'bg-gray-300'
                                  )}
                                  style={{ width: `${order.progressPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {order.progressPercentage}%
                              </span>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
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
                              <Link href={`/purchase-orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                상세보기
                              </Link>
                            </DropdownMenuItem>
                            {order.status === 'DRAFT' && (
                              <DropdownMenuItem asChild>
                                <Link href={`/purchase-orders/${order.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  수정
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {(order.status === 'ORDERED' ||
                              order.status === 'PARTIALLY_RECEIVED') && (
                              <DropdownMenuItem asChild>
                                <Link href={`/purchase-orders/${order.id}/receive`}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  입고 처리
                                </Link>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center">
                      <div className="text-muted-foreground">조건에 맞는 주문이 없습니다</div>
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
