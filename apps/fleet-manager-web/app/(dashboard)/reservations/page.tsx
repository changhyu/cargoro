'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  Plus,
  FileText,
  MoreHorizontal,
  Check,
  X,
  Loader2,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReservationStatus, ReservationStatusType } from '@cargoro/types/schema/reservation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cargoro/ui';

import {
  useReservationsQuery,
  useUpdateReservationStatus,
} from '../../../services/reservation-service';

// ExtendedReservation 타입 정의
interface ExtendedReservation {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: ReservationStatusType;
  purpose?: string;
  destination?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // 추가 필드
  contactNumber: string;
  plateNumber: string;
  type: string;
  scheduledDate: string;
  scheduledTime: string;
}

// 예약 타입에 따른 텍스트 매핑
const reservationTypeText: Record<string, string> = {
  INSPECTION: '점검',
  MAINTENANCE: '정비',
  REPAIR: '수리',
  EMERGENCY: '긴급수리',
  REGULAR: '정기점검',
};

// 상태에 따른 Badge 색상 및 텍스트
const statusConfig: Record<ReservationStatusType, { color: string; text: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', text: '대기중' },
  confirmed: { color: 'bg-blue-100 text-blue-800', text: '확정' },
  completed: { color: 'bg-green-100 text-green-800', text: '완료' },
  cancelled: { color: 'bg-red-100 text-red-800', text: '취소' },
  in_progress: { color: 'bg-green-100 text-green-800', text: '진행중' },
};

export default function ReservationsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // React Query 훅 사용
  const { data, isLoading } = useReservationsQuery();
  const updateReservationStatus = useUpdateReservationStatus();

  // 더미 데이터 - 실제로는 API에서 가져올 데이터
  const [reservations, setReservations] = useState<ExtendedReservation[]>([
    {
      id: '1',
      customerName: '김철수',
      contactNumber: '010-1234-5678',
      plateNumber: '12가 3456',
      type: 'INSPECTION',
      scheduledDate: '2023-12-15',
      scheduledTime: '09:00',
      status: 'pending' as ReservationStatusType,
      userId: '1',
      vehicleId: '1',
      startDate: '2023-12-15',
      endDate: '2023-12-15',
      createdAt: '2023-12-10',
      updatedAt: '2023-12-10',
      vehicleLicensePlate: '12가 3456',
      customerPhone: '010-1234-5678',
    },
    {
      id: '2',
      customerName: '이영희',
      contactNumber: '010-2345-6789',
      plateNumber: '34나 5678',
      type: 'MAINTENANCE',
      scheduledDate: '2023-12-16',
      scheduledTime: '14:00',
      status: ReservationStatus.CONFIRMED,
      userId: '2',
      vehicleId: '2',
      startDate: '2023-12-16',
      endDate: '2023-12-16',
      createdAt: '2023-12-11',
      updatedAt: '2023-12-11',
      vehicleLicensePlate: '34나 5678',
      customerPhone: '010-2345-6789',
    },
    {
      id: '3',
      customerName: '박지민',
      contactNumber: '010-3456-7890',
      plateNumber: '56다 7890',
      type: 'REPAIR',
      scheduledDate: '2023-12-17',
      scheduledTime: '10:30',
      status: ReservationStatus.PENDING,
      userId: '3',
      vehicleId: '3',
      startDate: '2023-12-17',
      endDate: '2023-12-17',
      createdAt: '2023-12-12',
      updatedAt: '2023-12-12',
      vehicleLicensePlate: '56다 7890',
      customerPhone: '010-3456-7890',
    },
    {
      id: '4',
      customerName: '최수영',
      contactNumber: '010-4567-8901',
      plateNumber: '78라 9012',
      type: 'EMERGENCY',
      scheduledDate: '2023-12-18',
      scheduledTime: '16:00',
      status: ReservationStatus.CONFIRMED,
      userId: '4',
      vehicleId: '4',
      startDate: '2023-12-18',
      endDate: '2023-12-18',
      createdAt: '2023-12-13',
      updatedAt: '2023-12-13',
      vehicleLicensePlate: '78라 9012',
      customerPhone: '010-4567-8901',
    },
    {
      id: '5',
      customerName: '정민호',
      contactNumber: '010-5678-9012',
      plateNumber: '90마 1234',
      type: 'INSPECTION',
      scheduledDate: '2023-12-19',
      scheduledTime: '11:00',
      status: ReservationStatus.COMPLETED,
      userId: '5',
      vehicleId: '5',
      startDate: '2023-12-19',
      endDate: '2023-12-19',
      createdAt: '2023-12-14',
      updatedAt: '2023-12-14',
      vehicleLicensePlate: '90마 1234',
      customerPhone: '010-5678-9012',
    },
  ]);

  // 데이터 로드 상태 처리
  const loading = isLoading;

  // 필터링된 예약 목록
  const filteredReservations = reservations.filter(reservation => {
    // 상태 필터
    if (statusFilter !== 'all' && reservation.status !== statusFilter) {
      return false;
    }

    // 유형 필터
    if (typeFilter !== 'all' && reservation.type !== typeFilter) {
      return false;
    }

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        reservation.customerName.toLowerCase().includes(query) ||
        reservation.plateNumber.toLowerCase().includes(query) ||
        reservation.contactNumber.includes(query)
      );
    }

    return true;
  });

  // 예약 상태 변경 핸들러
  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatusType) => {
    try {
      await updateReservationStatus.mutate({
        id: reservationId,
        data: { status: newStatus },
      });
    } catch (error) {
      // 에러 처리는 React Query의 onError 핸들러에서 처리됨
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">예약 관리</h1>
        <Button onClick={() => router.push('/dashboard/reservations/create')}>
          <Plus className="mr-2 h-4 w-4" /> 새 예약 등록
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>필터 및 검색</CardTitle>
          <CardDescription>예약 목록을 필터링하거나 검색할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">상태</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="confirmed">확정</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">예약 유형</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="maintenance">정기 점검</SelectItem>
                  <SelectItem value="inspection">검사</SelectItem>
                  <SelectItem value="repair">수리</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">검색</label>
              <Input
                placeholder="고객명, 차량, 연락처 등"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 예약 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>예약 목록</CardTitle>
          <CardDescription>{filteredReservations.length}개의 예약이 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p>표시할 예약이 없습니다.</p>
              {searchQuery && <p className="mt-2 text-sm">검색 조건을 변경해 보세요.</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>예약 ID</TableHead>
                  <TableHead>고객명</TableHead>
                  <TableHead>차량 번호</TableHead>
                  <TableHead>날짜 및 시간</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map(reservation => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.id}</TableCell>
                    <TableCell>
                      <div>{reservation.customerName}</div>
                      <div className="text-xs text-gray-500">{reservation.contactNumber}</div>
                    </TableCell>
                    <TableCell>{reservation.plateNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                        <div>
                          <div>
                            {format(new Date(reservation.scheduledDate), 'yyyy년 M월 d일', {
                              locale: ko,
                            })}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="mr-1 h-3 w-3" /> {reservation.scheduledTime}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{reservationTypeText[reservation.type]}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[reservation.status].color}>
                        {statusConfig[reservation.status].text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">메뉴</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/reservations/${reservation.id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            상세 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/reservations/${reservation.id}/edit`)
                            }
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {reservation.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                            >
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                              확정으로 변경
                            </DropdownMenuItem>
                          )}
                          {(reservation.status === 'pending' ||
                            reservation.status === 'confirmed') && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(reservation.id, 'completed')}
                            >
                              <Check className="mr-2 h-4 w-4 text-blue-600" />
                              완료로 변경
                            </DropdownMenuItem>
                          )}
                          {(reservation.status === 'pending' ||
                            reservation.status === 'confirmed') && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                            >
                              <X className="mr-2 h-4 w-4 text-red-600" />
                              취소
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
