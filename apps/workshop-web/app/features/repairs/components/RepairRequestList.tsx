'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

// 정비 요청 타입 정의
interface RepairRequest {
  id: string;
  requestNumber: string;
  customer: {
    name: string;
    phone: string;
  };

  vehicle: {
    vehicleNumber: string;
    model: string;
    manufacturer: string;
  };

  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  scheduledDate?: string;
  createdAt: string;
}

// 상태별 뱃지 색상
const statusColors = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
} as const;

// 우선순위별 뱃지 색상
const priorityColors = {
  LOW: 'secondary',
  NORMAL: 'default',
  HIGH: 'warning',
  URGENT: 'destructive',
} as const;

// 상태 한글 매핑
const statusLabels = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

// 우선순위 한글 매핑
const priorityLabels = {
  LOW: '낮음',
  NORMAL: '보통',
  HIGH: '높음',
  URGENT: '긴급',
};

export function RepairRequestList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // 정비 요청 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'repairRequests',
      { search: searchQuery, status: statusFilter, priority: priorityFilter },
    ],
    queryFn: async () => {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/repair-requests')
      // return response.json()

      // 임시 더미 데이터
      return {
        items: [
          {
            id: '1',
            requestNumber: 'REQ-202501-001',
            customer: {
              name: '김철수',
              phone: '010-1234-5678',
            },
            vehicle: {
              vehicleNumber: '12가 3456',
              model: '소나타',
              manufacturer: '현대',
            },
            description: '엔진 이상음 발생',
            status: 'PENDING',
            priority: 'HIGH',
            scheduledDate: '2025-01-10T10:00:00',
            createdAt: '2025-01-08T09:00:00',
          },
          {
            id: '2',
            requestNumber: 'REQ-202501-002',
            customer: {
              name: '이영희',
              phone: '010-2345-6789',
            },
            vehicle: {
              vehicleNumber: '34나 5678',
              model: 'K5',
              manufacturer: '기아',
            },
            description: '브레이크 패드 교체',
            status: 'IN_PROGRESS',
            priority: 'NORMAL',
            scheduledDate: '2025-01-09T14:00:00',
            createdAt: '2025-01-07T15:30:00',
          },
        ] as RepairRequest[],
        total: 2,
      };
    },
  });

  // 필터링된 데이터
  const filteredData = data?.items?.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.requestNumber.toLowerCase().includes(query) ||
        item.customer.name.toLowerCase().includes(query) ||
        item.vehicle.vehicleNumber.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>정비 요청 목록</CardTitle>
            <CardDescription>접수된 정비 요청을 확인하고 관리합니다</CardDescription>
          </div>
          <Button asChild>
            <Link href="/repairs/new">새 정비 요청</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 필터 및 검색 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="요청번호, 고객명, 차량번호로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="PENDING">대기중</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
              <SelectItem value="CANCELLED">취소됨</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="우선순위 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 우선순위</SelectItem>
              <SelectItem value="LOW">낮음</SelectItem>
              <SelectItem value="NORMAL">보통</SelectItem>
              <SelectItem value="HIGH">높음</SelectItem>
              <SelectItem value="URGENT">긴급</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>요청번호</TableHead>
                <TableHead>고객정보</TableHead>
                <TableHead>차량정보</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>예약일시</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map(request => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.requestNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.vehicle.vehicleNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.vehicle.manufacturer} {request.vehicle.model}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.description}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[request.status]}>
                        {statusLabels[request.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityColors[request.priority]}>
                        {priorityLabels[request.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.scheduledDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(request.scheduledDate), 'MM/dd HH:mm', {
                            locale: ko,
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/repairs/${request.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/repairs/${request.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    <div className="text-muted-foreground">조건에 맞는 정비 요청이 없습니다</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
