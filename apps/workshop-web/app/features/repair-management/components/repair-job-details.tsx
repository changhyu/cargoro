'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Badge } from '@cargoro/ui';
import { useRepairJob, useUpdateRepairStatus } from '../hooks/useRepairApi';
import { RepairStatus } from '@cargoro/api-client/lib/repair-api';
import { RepairStatusTimeline } from './repair-status-timeline';

// Badge 컴포넌트의 variant 타입
type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

// 상태별 뱃지 스타일 매핑
const statusStyles: Record<string, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'secondary', label: '대기 중' },
  in_progress: { variant: 'default', label: '진행 중' },
  waiting_parts: { variant: 'outline', label: '부품 대기' },
  completed: { variant: 'outline', label: '완료됨' },
  cancelled: { variant: 'destructive', label: '취소됨' },
};

export function RepairJobDetails() {
  const params = useParams();
  const repairId = params?.id as string;
  const { data: repair, isLoading, error } = useRepairJob(repairId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateRepairStatus();

  const handleStatusChange = (newStatus: RepairStatus) => {
    if (repairId) {
      updateStatus({ repairId, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>정비 작업 정보 로딩 중...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 animate-pulse rounded-md bg-gray-200"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !repair) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>에러 발생</CardTitle>
          <CardDescription>정비 작업 정보를 불러오는 중 오류가 발생했습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 상태에 따른 스타일 가져오기 (기본값 제공)
  const status = statusStyles[repair.status] || { variant: 'secondary', label: '알 수 없음' };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">정비 작업 #{repair.id}</CardTitle>
              <CardDescription>
                등록일: {new Date(repair.createdAt).toLocaleDateString('ko-KR')}
              </CardDescription>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">차량 번호</p>
              <p className="text-base">{repair.vehicleId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">차량 정보</p>
              <p className="text-base">차량 ID: {repair.vehicleId}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">고객 정보</h3>
            <p>차량 ID: {repair.vehicleId}</p>
            <p>예약 ID: {repair.reservationId || '없음'}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">정비 내용</h3>
            <p>{repair.description}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">추가 메모</h3>
            <p>{repair.notes || '추가 메모가 없습니다.'}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">완료 시간</h3>
            <p>
              {repair.completionTime
                ? new Date(repair.completionTime).toLocaleDateString('ko-KR')
                : '미완료'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleStatusChange('in_progress')}
              disabled={
                repair.status === 'in_progress' || isUpdating || repair.status === 'completed'
              }
            >
              작업 시작
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('waiting_parts')}
              disabled={
                repair.status === 'waiting_parts' || isUpdating || repair.status === 'completed'
              }
            >
              부품 대기
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('completed')}
              disabled={repair.status === 'completed' || isUpdating}
            >
              작업 완료
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusChange('cancelled')}
              disabled={
                repair.status === 'cancelled' || isUpdating || repair.status === 'completed'
              }
            >
              작업 취소
            </Button>
          </div>
        </CardContent>
      </Card>

      {repairId && <RepairStatusTimeline repairId={repairId} />}
    </div>
  );
}
