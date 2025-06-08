'use client';

import React, { useState } from 'react';
import { Search, Plus, Calendar, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReservationStatus, ReservationStatusType } from '@cargoro/types/schema/reservation';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';
import {
  useReservationsQuery,
  useUpdateReservationStatus,
  useCancelReservation,
} from '../../services/reservation-service';

export default function ReservationList() {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // React Query 훅 사용
  const { data: reservations = [], isLoading, error, refetch } = useReservationsQuery();
  const updateStatusMutation = useUpdateReservationStatus();
  const cancelReservationMutation = useCancelReservation();

  // 필터링된 예약 목록
  const filteredReservations = reservations.filter(reservation => {
    // 상태 필터 적용
    if (activeTab !== 'all' && reservation.status !== activeTab) {
      return false;
    }

    // 검색어 필터 적용
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        reservation.vehicleLicensePlate.toLowerCase().includes(searchLower) ||
        reservation.customerName.toLowerCase().includes(searchLower) ||
        reservation.customerPhone.includes(searchTerm) ||
        (reservation.purpose?.toLowerCase() || '').includes(searchLower)
      );
    }

    return true;
  });

  // 예약 상태 변경 핸들러
  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatusType) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: reservationId,
        data: { status: newStatus },
      });

      toast({
        title: '상태 변경 완료',
        description: '예약 상태가 성공적으로 변경되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '예약 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 예약 취소 핸들러
  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;

    try {
      await cancelReservationMutation.mutateAsync({
        id: reservationId,
        reason: '관리자에 의한 취소',
      });

      toast({
        title: '예약 취소',
        description: '예약이 성공적으로 취소되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '예약 취소에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 예약 상세 페이지로 이동
  const handleViewDetails = (reservationId: string) => {
    router.push(`/dashboard/reservations/${reservationId}`);
  };

  // 새 예약 생성 모달 열기
  const handleCreateReservation = () => {
    setIsCreateModalOpen(true);
  };

  // 날짜 형식화
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 상태 레이블 및 색상
  const getStatusLabel = (status: ReservationStatusType) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return { label: '대기 중', color: 'bg-yellow-100 text-yellow-800' };
      case ReservationStatus.CONFIRMED:
        return { label: '확정됨', color: 'bg-blue-100 text-blue-800' };
      case ReservationStatus.IN_PROGRESS:
        return { label: '진행 중', color: 'bg-green-100 text-green-800' };
      case ReservationStatus.COMPLETED:
        return { label: '완료됨', color: 'bg-gray-100 text-gray-800' };
      case ReservationStatus.CANCELLED:
        return { label: '취소됨', color: 'bg-red-100 text-red-800' };
      default:
        return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">차량 예약 관리</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="예약 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:w-64"
            />
          </div>

          <Button onClick={handleCreateReservation}>
            <Plus className="mr-2 h-4 w-4" />새 예약
          </Button>
        </div>
      </div>

      {/* 상태 필터 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value={ReservationStatus.PENDING}>대기 중</TabsTrigger>
          <TabsTrigger value={ReservationStatus.CONFIRMED}>확정됨</TabsTrigger>
          <TabsTrigger value={ReservationStatus.IN_PROGRESS}>진행 중</TabsTrigger>
          <TabsTrigger value={ReservationStatus.COMPLETED}>완료됨</TabsTrigger>
          <TabsTrigger value={ReservationStatus.CANCELLED}>취소됨</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>오류가 발생했습니다. 다시 시도해주세요.</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            새로고침
          </Button>
        </div>
      )}

      {/* 예약 목록 */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-lg text-gray-500">
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : activeTab !== 'all'
                    ? `${getStatusLabel(activeTab as ReservationStatusType).label} 상태의 예약이 없습니다.`
                    : '등록된 예약이 없습니다.'}
              </p>
              <Button onClick={handleCreateReservation} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />새 예약 만들기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReservations.map(reservation => (
                <Card key={reservation.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col justify-between border-b md:flex-row md:items-center">
                      <div className="flex-grow p-4">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{reservation.customerName}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              getStatusLabel(reservation.status).color
                            }`}
                          >
                            {getStatusLabel(reservation.status).label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{reservation.vehicleLicensePlate}</p>
                      </div>
                      <div className="p-4 md:text-right">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(reservation.startDate)}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>~ {formatDate(reservation.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">목적:</span> {reservation.purpose}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">연락처:</span> {reservation.customerPhone}
                        </p>
                        {reservation.notes && (
                          <p className="mt-1 text-sm text-gray-600">{reservation.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        {reservation.status === ReservationStatus.PENDING && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(reservation.id, ReservationStatus.CONFIRMED)
                              }
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              예약 확정
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              예약 취소
                            </Button>
                          </>
                        )}

                        {reservation.status === ReservationStatus.CONFIRMED && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(reservation.id, ReservationStatus.IN_PROGRESS)
                            }
                          >
                            <Clock className="mr-1 h-4 w-4" />
                            진행 중으로 변경
                          </Button>
                        )}

                        {reservation.status === ReservationStatus.IN_PROGRESS && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(reservation.id, ReservationStatus.COMPLETED)
                            }
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            완료 처리
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewDetails(reservation.id)}
                        >
                          상세 보기
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 예약 생성 모달 - 실제 구현에서는 ReservationForm 컴포넌트 사용 */}
      {/* {isCreateModalOpen && (
        <ReservationForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateReservation}
        />
      )} */}
    </div>
  );
}
