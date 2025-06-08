'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cargoro/ui';

import { useRentalStore } from '../../state/rental-store';

const statusConfig = {
  pending: { label: '대기중', variant: 'secondary' as const, icon: Clock },
  confirmed: { label: '확정', variant: 'success' as const, icon: CheckCircle },
  cancelled: { label: '취소', variant: 'destructive' as const, icon: XCircle },
  completed: { label: '완료', variant: 'default' as const, icon: CheckCircle },
};

export default function ReservationsPage() {
  const {
    reservations,
    customers,
    vehicles,
    loadReservations,
    confirmReservation,
    cancelReservation,
  } = useRentalStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || '알 수 없음';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle
      ? `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`
      : '알 수 없음';
  };

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const todayReservations = reservations.filter(res => {
    const pickupDate = new Date(res.pickupDate);
    const today = new Date();
    return pickupDate.toDateString() === today.toDateString();
  });

  const upcomingReservations = reservations.filter(res => {
    const pickupDate = new Date(res.pickupDate);
    const today = new Date();
    return pickupDate > today && res.status !== 'cancelled';
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">예약 관리</h1>
          <p className="mt-2 text-gray-600">차량 예약 및 배차 스케줄을 관리합니다</p>
        </div>
        <Link href="/features/reservations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />새 예약 등록
          </Button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}건</div>
            <p className="text-xs text-muted-foreground">픽업 예정</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기중 예약</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservations.filter(r => r.status === 'pending').length}건
            </div>
            <p className="text-xs text-muted-foreground">확정 대기</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주 예약</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReservations.length}건</div>
            <p className="text-xs text-muted-foreground">예정된 예약</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">취소율</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservations.length > 0
                ? Math.round(
                    (reservations.filter(r => r.status === 'cancelled').length /
                      reservations.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">전체 예약 대비</p>
          </CardContent>
        </Card>
      </div>

      {/* 보기 모드 전환 */}
      <div className="mb-4 flex justify-end">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            목록 보기
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            캘린더 보기
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        // 목록 보기
        <Card>
          <CardHeader>
            <CardTitle>예약 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>예약번호</TableHead>
                  <TableHead>고객</TableHead>
                  <TableHead>차량</TableHead>
                  <TableHead>픽업 일시</TableHead>
                  <TableHead>픽업 장소</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>예상 금액</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map(reservation => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-sm">{reservation.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {getCustomerName(reservation.customerId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm">{getVehicleInfo(reservation.vehicleId)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <div>
                            {format(new Date(reservation.pickupDate), 'yyyy-MM-dd', { locale: ko })}
                          </div>
                          <div className="text-sm text-gray-500">{reservation.pickupTime}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {reservation.pickupLocation}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reservation.status as keyof typeof statusConfig)}
                    </TableCell>
                    <TableCell>{formatCurrency(reservation.estimatedCost)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmReservation(reservation.id)}
                            >
                              확정
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelReservation(reservation.id)}
                            >
                              취소
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          상세
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        // 캘린더 보기
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>예약 캘린더</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasReservation: date => {
                    return reservations.some(res => {
                      const pickupDate = new Date(res.pickupDate);
                      return pickupDate.toDateString() === date.toDateString();
                    });
                  },
                }}
                modifiersStyles={{
                  hasReservation: {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })
                  : '날짜를 선택하세요'}{' '}
                예약
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <div className="space-y-4">
                  {reservations
                    .filter(res => {
                      const pickupDate = new Date(res.pickupDate);
                      return pickupDate.toDateString() === selectedDate.toDateString();
                    })
                    .map(reservation => (
                      <div key={reservation.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">
                              {getCustomerName(reservation.customerId)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {getVehicleInfo(reservation.vehicleId)}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status as keyof typeof statusConfig)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {reservation.pickupTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {reservation.pickupLocation}
                          </div>
                        </div>
                        {reservation.notes && (
                          <p className="mt-2 text-sm text-gray-600">{reservation.notes}</p>
                        )}
                      </div>
                    ))}
                  {reservations.filter(res => {
                    const pickupDate = new Date(res.pickupDate);
                    return pickupDate.toDateString() === selectedDate.toDateString();
                  }).length === 0 && (
                    <p className="py-8 text-center text-gray-500">선택한 날짜에 예약이 없습니다</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
