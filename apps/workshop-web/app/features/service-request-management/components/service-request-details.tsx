/**
 * 정비 서비스 요청 상세 컴포넌트
 */
'use client';

import { useState } from 'react';
import { useServiceRequest, useUpdateServiceRequestStatus } from '../hooks/use-service-request-api';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ServiceRequestStatus } from '@cargoro/types/schema/service-request';
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Spinner,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@cargoro/ui';

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

interface ServiceRequestDetailsProps {
  id: string;
  onBack?: () => void;
}

export function ServiceRequestDetails({ id, onBack }: ServiceRequestDetailsProps) {
  const { data: request, isLoading, isError, error } = useServiceRequest(id);
  const [newStatus, setNewStatus] = useState<ServiceRequestStatus | undefined>(undefined);
  const updateStatus = useUpdateServiceRequestStatus();

  const handleStatusChange = () => {
    if (!newStatus || !id) return;

    updateStatus.mutate(
      {
        id,
        status: newStatus,
      },
      {
        onSuccess: () => {
          setNewStatus(undefined);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-500">
          {error instanceof Error
            ? error.message
            : '서비스 요청을 불러오는 중 오류가 발생했습니다.'}
        </p>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            돌아가기
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{request.title}</CardTitle>
            <CardDescription>요청 ID: {request.id}</CardDescription>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              목록으로
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Badge className={statusColors[request.status as StatusKey]}>
            상태: {request.status}
          </Badge>
          <Badge className={priorityColors[request.priority as PriorityKey]}>
            우선순위: {request.priority}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500">고객 정보</h3>
            <p>고객 ID: {request.customerId}</p>
            <p>차량 ID: {request.vehicleId}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500">날짜 정보</h3>
            <p>요청일: {format(new Date(request.requestedDate), 'yyyy-MM-dd')}</p>
            {request.scheduledDate && (
              <p>예정일: {format(new Date(request.scheduledDate), 'yyyy-MM-dd')}</p>
            )}
            {request.completedDate && (
              <p>완료일: {format(new Date(request.completedDate), 'yyyy-MM-dd')}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-500">설명</h3>
          <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-4">{request.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-500">상태 변경</h3>
          <div className="flex items-center gap-2">
            <Select
              value={newStatus || ''}
              onValueChange={value => setNewStatus(value as ServiceRequestStatus)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">대기 중</SelectItem>
                <SelectItem value="accepted">수락됨</SelectItem>
                <SelectItem value="in_progress">진행 중</SelectItem>
                <SelectItem value="completed">완료됨</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
                <SelectItem value="cancelled">취소됨</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleStatusChange} disabled={!newStatus || updateStatus.isPending}>
              {updateStatus.isPending ? '변경 중...' : '상태 변경'}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t bg-gray-50 px-6 py-4">
        <div className="text-sm text-gray-500">
          생성: {format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm')}
        </div>
        <div className="text-sm text-gray-500">
          마지막 수정: {format(new Date(request.updatedAt), 'yyyy-MM-dd HH:mm')}
        </div>
      </CardFooter>
    </Card>
  );
}
