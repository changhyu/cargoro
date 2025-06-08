/**
 * 정비 서비스 요청 목록 컴포넌트
 */
'use client';

import { useState } from 'react';
import { useServiceRequests } from '../hooks/use-service-request-api';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from '@cargoro/ui';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// 상태별 배지 색상 정의
const statusColors = {
  pending: 'bg-yellow-500',
  accepted: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

// 우선순위별 배지 색상 정의
const priorityColors = {
  low: 'bg-blue-400',
  medium: 'bg-yellow-400',
  high: 'bg-orange-500',
  urgent: 'bg-red-600',
};

type StatusKey = keyof typeof statusColors;
type PriorityKey = keyof typeof priorityColors;

export function ServiceRequestList() {
  const router = useRouter();
  const [filter, setFilter] = useState({});
  const { data, isLoading, isError, error } = useServiceRequests(filter);

  // 상태 필터링 처리
  const filterByStatus = (status: StatusKey) => {
    setFilter(prev => ({ ...prev, status }));
  };

  // 모든 필터 초기화
  const resetFilters = () => {
    setFilter({});
  };

  // 상세 페이지로 이동
  const goToDetail = (id: string) => {
    router.push(`/service-requests/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">
          {error instanceof Error
            ? error.message
            : '서비스 요청 목록을 불러오는 중 오류가 발생했습니다.'}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>서비스 요청 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            모든 요청
          </Button>
          <Button variant="outline" size="sm" onClick={() => filterByStatus('pending')}>
            대기 중
          </Button>
          <Button variant="outline" size="sm" onClick={() => filterByStatus('accepted')}>
            수락됨
          </Button>
          <Button variant="outline" size="sm" onClick={() => filterByStatus('in_progress')}>
            진행 중
          </Button>
          <Button variant="outline" size="sm" onClick={() => filterByStatus('completed')}>
            완료됨
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>고객</TableHead>
              <TableHead>차량</TableHead>
              <TableHead>우선순위</TableHead>
              <TableHead>요청일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.serviceRequests.map(request => (
              <TableRow
                key={request.id}
                className="cursor-pointer"
                onClick={() => goToDetail(request.id)}
              >
                <TableCell className="font-mono">{request.id.substring(0, 8)}...</TableCell>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>{request.customerId}</TableCell>
                <TableCell>{request.vehicleId}</TableCell>
                <TableCell>
                  <Badge className={priorityColors[request.priority as PriorityKey]}>
                    {request.priority}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(request.requestedDate), 'yyyy-MM-dd')}</TableCell>
                <TableCell>
                  <Badge className={statusColors[request.status as StatusKey]}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        goToDetail(request.id);
                      }}
                    >
                      상세
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => e.stopPropagation()}>
                      수정
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
