'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Truck,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReservationStatusType } from '@cargoro/types/schema/reservation';
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@cargoro/ui';

import {
  useReservation,
  useCancelReservation,
  useUpdateReservationStatus,
} from '../../../services/reservation-service';

// 예약 타입 정의
type ReservationTypeType = 'rental' | 'maintenance' | 'inspection';

interface ReservationDetailsProps {
  params: {
    id: string;
  };
}

export default function ReservationDetailsPage({ params }: ReservationDetailsProps) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReservationStatusType | null>(null);
  const [statusNote, setStatusNote] = useState('');

  // React Query 훅 사용
  const { data: reservation, isLoading, error } = useReservation(id);
  const updateStatusMutation = useUpdateReservationStatus();
  const cancelReservationMutation = useCancelReservation();

  // 상태 변경 핸들러
  const handleStatusChange = async () => {
    if (!newStatus || !reservation) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: reservation.id,
        data: {
          status: newStatus,
          notes: statusNote || undefined,
        },
      });

      toast({
        title: '상태 변경 완료',
        description: '예약 상태가 성공적으로 변경되었습니다.',
      });

      setIsStatusChangeModalOpen(false);
      setNewStatus(null);
      setStatusNote('');
    } catch (error) {
      toast({
        title: '오류',
        description: '예약 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 예약 취소 핸들러
  const handleCancelReservation = async () => {
    if (!reservation) return;

    if (!confirm('예약을 취소하시겠습니까?')) return;

    try {
      await cancelReservationMutation.mutateAsync({
        id: reservation.id,
        reason: '관리자에 의한 취소',
      });

      toast({
        title: '예약 취소',
        description: '예약이 성공적으로 취소되었습니다.',
      });

      router.push('/dashboard/reservations');
    } catch (error) {
      toast({
        title: '오류',
        description: '예약 취소에 실패했습니다.',
        variant: 'destructive',
      });
    }
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
      case 'pending':
        return { label: '대기 중', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle /> };
      case 'confirmed':
        return { label: '확정됨', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle /> };
      case 'in_progress':
        return { label: '진행 중', color: 'bg-green-100 text-green-800', icon: <Clock /> };
      case 'completed':
        return { label: '완료됨', color: 'bg-gray-100 text-gray-800', icon: <CheckCircle /> };
      case 'cancelled':
        return { label: '취소됨', color: 'bg-red-100 text-red-800', icon: <XCircle /> };
      default:
        return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle /> };
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <p>예약 정보를 불러오는데 실패했습니다.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusLabel(reservation.status);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">예약 상세 정보</h1>
            <p className="text-muted-foreground">예약 ID: {reservation.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {reservation.status === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setNewStatus('confirmed');
                  setIsStatusChangeModalOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                예약 확정
              </Button>
              <Button variant="outline" onClick={handleCancelReservation}>
                <XCircle className="mr-2 h-4 w-4" />
                예약 취소
              </Button>
            </>
          )}

          {reservation.status === 'confirmed' && (
            <Button
              variant="outline"
              onClick={() => {
                setNewStatus('in_progress');
                setIsStatusChangeModalOpen(true);
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              진행 중으로 변경
            </Button>
          )}

          {reservation.status === 'in_progress' && (
            <Button
              variant="outline"
              onClick={() => {
                setNewStatus('completed');
                setIsStatusChangeModalOpen(true);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              완료 처리
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 기본 정보 */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                예약 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">예약 상태</div>
                  <div>
                    <span
                      className={`inline-flex items-center space-x-1 rounded-full px-2 py-1 text-sm font-medium ${statusInfo.color}`}
                    >
                      <span className="h-4 w-4">{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">예약 목적</div>
                  <p className="font-medium">{reservation.purpose}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">시작 일시</div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(reservation.startDate)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">종료 일시</div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(reservation.endDate)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">예약 생성일</div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(reservation.createdAt)}</p>
                  </div>
                </div>

                {reservation.updatedAt && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">마지막 업데이트</div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(reservation.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {reservation.notes && (
                <div className="mt-4 border-t pt-4">
                  <div className="text-sm font-medium text-muted-foreground">비고</div>
                  <p className="mt-1 whitespace-pre-line">{reservation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 예약 기록 */}
          {reservation.history && reservation.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  예약 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reservation.history.map((item, index) => (
                    <div
                      key={item.id}
                      className={`relative pb-4 pl-6 ${
                        index !== reservation.history!.length - 1 ? 'border-l border-gray-200' : ''
                      }`}
                    >
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
                      <div className="text-sm font-medium">{item.action}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(item.timestamp)} - {item.userName}
                      </div>
                      {(item.oldStatus || item.newStatus) && (
                        <div className="mt-1 text-xs">
                          {item.oldStatus && (
                            <span className="mr-2 inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">
                              {getStatusLabel(item.oldStatus).label}
                            </span>
                          )}
                          {item.oldStatus && item.newStatus && <span className="mx-1">→</span>}
                          {item.newStatus && (
                            <span
                              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs ${
                                getStatusLabel(item.newStatus).color
                              }`}
                            >
                              {getStatusLabel(item.newStatus).label}
                            </span>
                          )}
                        </div>
                      )}
                      {item.notes && <div className="mt-1 text-xs text-gray-600">{item.notes}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 고객 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                고객 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">이름</div>
                  <p className="font-medium">{reservation.customerName}</p>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">연락처</div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{reservation.customerPhone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 차량 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                차량 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">차량 번호</div>
                  <p className="font-medium">{reservation.vehicleLicensePlate}</p>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">차량 ID</div>
                  <p className="text-sm">{reservation.vehicleId}</p>
                </div>

                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => router.push(`/dashboard/vehicles/${reservation.vehicleId}`)}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  차량 상세 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
