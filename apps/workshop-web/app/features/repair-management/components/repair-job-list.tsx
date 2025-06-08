'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@cargoro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';
import { Badge } from '@cargoro/ui';
import { Input } from '@cargoro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cargoro/ui';
import { Skeleton } from '@cargoro/ui';
import {
  PlusCircle,
  Search,
  Filter,
  Clock,
  Hammer,
  CheckCircle,
  XCircle,
  Package,
} from 'lucide-react';

import { useRepairJobs } from '../hooks/useRepairJobs';
import { RepairJob } from '../types';
import RepairJobDetailModal from './repair-job-detail-modal';
import { RepairCreateForm } from './repair-create-form';

// 수리 상태 타입 정의
export type RepairStatus = 'pending' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';

// 상태별 배지 스타일 매핑
const statusVariantMap: Record<RepairStatus, string> = {
  pending: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  waiting_parts: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// 상태별 한글 표시
const statusKoreanMap: Record<RepairStatus, string> = {
  pending: '대기 중',
  in_progress: '진행 중',
  waiting_parts: '부품 대기',
  completed: '완료',
  cancelled: '취소됨',
};

// 상태별 아이콘
const statusIconMap: Record<RepairStatus, React.ReactNode> = {
  pending: <Clock className="mr-1 h-3 w-3" />,
  in_progress: <Hammer className="mr-1 h-3 w-3" />,
  waiting_parts: <Package className="mr-1 h-3 w-3" />,
  completed: <CheckCircle className="mr-1 h-3 w-3" />,
  cancelled: <XCircle className="mr-1 h-3 w-3" />,
};

// 명시적으로 빈 props 타입 정의 대신 모든 프로퍼티가 선택적인 타입 정의
interface RepairJobListProps {
  readonly initialFilter?: string; // 초기 필터 설정 (선택적)
}

export function RepairJobList({ initialFilter }: Readonly<RepairJobListProps>) {
  // 상태 관리
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter || 'all');
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState<boolean>(false);

  // 정비 작업 데이터 로드
  const {
    repairJobs: jobs,
    isLoading,
    error,
    refetch,
  } = useRepairJobs({
    page: 1,
    pageSize: 20,
  });

  // 상태 필터 변경 핸들러
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };

  // 정비 작업 선택 핸들러
  const handleJobSelect = (job: RepairJob) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  // 정비 작업 상세 모달 닫기 핸들러
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedJob(null);
  };

  // 정비 작업 생성 폼 열기 핸들러
  const handleOpenCreateForm = () => {
    setIsCreateFormOpen(true);
  };

  // 정비 작업 생성 폼 닫기 핸들러
  const handleCloseCreateForm = () => {
    setIsCreateFormOpen(false);
  };

  // 정비 작업 생성 성공 핸들러
  const handleCreateSuccess = () => {
    refetch();
  };

  // 정비 작업 업데이트 핸들러
  const handleJobUpdated = () => {
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">정비 작업 관리</h1>
        <Button onClick={handleOpenCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" />새 작업
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>정비 작업 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 gap-2">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  refetch();
                }}
                className="flex w-full max-w-sm items-center space-x-2"
              >
                <Input placeholder="차량번호, 고객명, VIN으로 검색" className="flex-1" />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="pending">대기 중</SelectItem>
                  <SelectItem value="in_progress">진행 중</SelectItem>
                  <SelectItem value="waiting_parts">부품 대기</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            // 로딩 상태 UI
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : error ? (
            // 에러 상태 UI
            <div className="py-8 text-center text-muted-foreground">
              정비 작업 목록을 불러오는 중 오류가 발생했습니다.
            </div>
          ) : jobs && Array.isArray(jobs) && jobs.length > 0 ? (
            // 정비 작업 목록 테이블
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">상태</TableHead>
                    <TableHead>차량 정보</TableHead>
                    <TableHead>고객명</TableHead>
                    <TableHead>정비 내용</TableHead>
                    <TableHead className="w-[120px]">등록일</TableHead>
                    <TableHead className="text-right">비용</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map(job => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleJobSelect(job)}
                    >
                      <TableCell>
                        <Badge className={statusVariantMap[job.status as RepairStatus]}>
                          {statusIconMap[job.status as RepairStatus]}
                          {statusKoreanMap[job.status as RepairStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{job.vehicleInfo.licensePlate}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.vehicleInfo.manufacturer} {job.vehicleInfo.model} (
                          {job.vehicleInfo.year})
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{job.customerInfo.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.customerInfo.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-1">{job.description}</div>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(job.createdAt), 'yyyy.MM.dd', { locale: ko })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {new Intl.NumberFormat('ko-KR').format(job.cost.total)}원
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // 데이터 없음 UI
            <div className="py-8 text-center text-muted-foreground">
              조회된 정비 작업이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 정비 작업 상세 모달 */}
      {selectedJob && (
        <RepairJobDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          job={selectedJob}
          onJobUpdated={handleJobUpdated}
        />
      )}

      {/* 정비 작업 생성 폼 */}
      <RepairCreateForm
        isOpen={isCreateFormOpen}
        onClose={handleCloseCreateForm}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
