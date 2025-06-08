import React, { useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addDays,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@cargoro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@cargoro/ui';
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Clock, User, Car } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// 예약 상태 타입
type ReservationStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';

// 예약 정보 타입
interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleInfo: {
    licensePlate: string;
    manufacturer: string;
    model: string;
  };

  repairType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  status: ReservationStatus;
  contactPhone: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

// 예약 캘린더 컴포넌트 props
interface ReservationCalendarProps {
  workshopId: string;
}

const statusColors = {
  requested: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  confirmed: 'bg-blue-100 border-blue-300 text-blue-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  cancelled: 'bg-red-100 border-red-300 text-red-800',
};

const statusLabels = {
  requested: '요청됨',
  confirmed: '확정됨',
  completed: '완료됨',
  cancelled: '취소됨',
};

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ workshopId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // 현재 보기 모드에 따라 날짜 범위 계산
  const dateRange =
    view === 'month'
      ? { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
      : {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        };

  // 예약 데이터 조회
  const { data: reservationsData, isLoading } = useQuery({
    queryKey: ['reservations', dateRange.start, dateRange.end, workshopId],
    queryFn: async () => {
      try {
        const dateFrom = format(dateRange.start, 'yyyy-MM-dd');
        const dateTo = format(dateRange.end, 'yyyy-MM-dd');
        const response = await axios.get(
          `${API_URL}/reservations?date_from=${dateFrom}&date_to=${dateTo}`
        );
        return response.data;
      } catch (error) {
        // 오류 로깅은 로깅 서비스로 이동하는 것이 좋습니다

        // 개발 환경에서 API가 없는 경우 임시 데이터 반환
        if (process.env.NODE_ENV === 'development') {
          return {
            data: Array(15)
              .fill(null)
              .map((_, index) => {
                const date = addDays(dateRange.start, Math.floor(Math.random() * 30));
                const hour = 9 + Math.floor(Math.random() * 8);
                const status = ['requested', 'confirmed', 'completed', 'cancelled'][
                  Math.floor(Math.random() * 4)
                ] as ReservationStatus;

                return {
                  id: `reservation-${index + 1}`,
                  customerId: `customer-${(index % 5) + 1}`,
                  customerName: `고객 ${(index % 5) + 1}`,
                  vehicleId: `vehicle-${(index % 7) + 1}`,
                  vehicleInfo: {
                    licensePlate: `${(index % 9) + 1}${(index % 10) + 1}가 ${1000 + index}`,
                    manufacturer: ['현대', '기아', 'BMW', '벤츠', '아우디'][index % 5],
                    model: ['소나타', '그랜저', '쏘렌토', 'A4', 'E클래스'][index % 5],
                  },
                  repairType: ['regular', 'repair', 'warranty', 'inspection'][index % 4],
                  description: `${index + 1}번 예약 - ${['엔진 오일 교체', '브레이크 패드 교체', '정기 점검', '타이어 교체'][index % 4]}`,
                  preferredDate: format(date, 'yyyy-MM-dd'),
                  preferredTime: `${hour}:00`,
                  scheduledDate: format(date, 'yyyy-MM-dd'),
                  scheduledTime: `${hour}:00`,
                  estimatedDuration: [1, 2, 3, 4][index % 4],
                  status,
                  contactPhone: `010-${1000 + index}-${2000 + index}`,
                  specialRequests: index % 3 === 0 ? '빠른 처리 부탁드립니다.' : undefined,
                  createdAt: new Date(date.getTime() - 86400000 * 2).toISOString(),
                  updatedAt: new Date(date.getTime() - 86400000).toISOString(),
                };
              }),
            page: 1,
            perPage: 100,
            totalItems: 15,
            totalPages: 1,
          };
        }

        throw error;
      }
    },
  });

  // 날짜 이동 핸들러
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      const days = direction === 'next' ? 7 : -7;
      newDate.setDate(newDate.getDate() + days);
      setCurrentDate(newDate);
    }
  };

  // 날짜별 예약 목록 가져오기
  const getReservationsForDay = (day: Date) => {
    if (!reservationsData?.data) {
      return [];
    }

    return reservationsData.data.filter((reservation: Reservation) =>
      isSameDay(parseISO(reservation.scheduledDate), day)
    );
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // 예약 클릭 핸들러
  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailDialogOpen(true);
  };

  // 예약 상세 다이얼로그 닫기 핸들러
  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedReservation(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">예약 캘린더</CardTitle>
          <div className="flex items-center space-x-2">
            <Tabs value={view} onValueChange={v => setView(v as 'month' | 'week')}>
              <TabsList>
                <TabsTrigger value="month">월별</TabsTrigger>
                <TabsTrigger value="week">주별</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" onClick={() => handleNavigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleNavigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              예약 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-center text-xl font-medium">
              {format(currentDate, view === 'month' ? 'yyyy년 MM월' : "yyyy년 MM월 d일 '주'", {
                locale: ko,
              })}
            </h3>
          </div>

          <TabsContent value="month" className="mt-0">
            <CalendarComponent
              mode="multiple"
              selected={selectedDate ? [selectedDate] : []}
              onSelect={dates => dates && dates.length > 0 && setSelectedDate(dates[0])}
              weekStartsOn={1}
              month={currentDate}
              className="rounded-md border"
            />
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <div className="grid grid-cols-7 gap-1">
              {eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).map(day => {
                const dayReservations = getReservationsForDay(day);

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      'h-96 cursor-pointer rounded-md border p-1 hover:bg-muted/50',
                      selectedDate && isSameDay(day, selectedDate) ? 'bg-primary/10' : ''
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="text-xs font-medium">{format(day, 'E', { locale: ko })}</div>
                    <div className="text-sm font-semibold">{format(day, 'd')}</div>
                    <div className="max-h-88 mt-1 space-y-1 overflow-y-auto">
                      {!isLoading &&
                        dayReservations.map((reservation: Reservation) => (
                          <div
                            key={reservation.id}
                            className={cn(
                              'mb-1 cursor-pointer rounded px-1 py-1 text-xs',
                              statusColors[reservation.status]
                            )}
                            onClick={e => {
                              e.stopPropagation();
                              handleReservationClick(reservation);
                            }}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{reservation.scheduledTime}</span>
                              <span className="text-xs">{statusLabels[reservation.status]}</span>
                            </div>
                            <div className="truncate">{reservation.customerName}</div>
                            <div className="truncate text-xs">
                              {reservation.vehicleInfo.manufacturer} {reservation.vehicleInfo.model}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'yyyy년 MM월 dd일 (E)', { locale: ko })} 예약
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 text-center">예약을 불러오는 중...</div>
            ) : getReservationsForDay(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getReservationsForDay(selectedDate)
                  .sort((a: Reservation, b: Reservation) =>
                    a.scheduledTime.localeCompare(b.scheduledTime)
                  )
                  .map((reservation: Reservation) => (
                    <div
                      key={reservation.id}
                      className={cn(
                        'cursor-pointer rounded-md border p-3 hover:bg-muted/50',
                        `border-l-4 ${statusColors[reservation.status].replace('bg-', 'border-')}`
                      )}
                      onClick={() => handleReservationClick(reservation)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{reservation.scheduledTime}</span>
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                              {reservation.estimatedDuration}시간
                            </span>
                          </div>
                          <div className="mt-1 flex items-center">
                            <User className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{reservation.customerName}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {reservation.contactPhone}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center">
                            <Car className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {reservation.vehicleInfo.manufacturer} {reservation.vehicleInfo.model}{' '}
                              ({reservation.vehicleInfo.licensePlate})
                            </span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'rounded-full px-2 py-1 text-xs',
                            statusColors[reservation.status]
                          )}
                        >
                          {statusLabels[reservation.status]}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">{reservation.description}</div>
                      {reservation.specialRequests && (
                        <div className="mt-1 text-xs italic text-muted-foreground">
                          &ldquo;{reservation.specialRequests}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                해당 날짜에 예정된 예약이 없습니다.
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    예약 추가
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 예약 상세 다이얼로그 */}
      {selectedReservation && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>예약 상세 정보</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 예약 상태 */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">예약 #{selectedReservation.id.slice(-5)}</h3>
                <div
                  className={cn(
                    'rounded-full px-3 py-1 text-sm',
                    statusColors[selectedReservation.status]
                  )}
                >
                  {statusLabels[selectedReservation.status]}
                </div>
              </div>

              {/* 예약 시간 정보 */}
              <div className="space-y-1 rounded-md bg-muted/30 p-3">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">예약 날짜:</span>
                  <span className="ml-2">
                    {format(parseISO(selectedReservation.scheduledDate), 'yyyy년 MM월 dd일 (E)', {
                      locale: ko,
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">예약 시간:</span>
                  <span className="ml-2">{selectedReservation.scheduledTime}</span>
                </div>
                <div className="flex items-center">
                  <span className="ml-6 font-medium">예상 소요 시간:</span>
                  <span className="ml-2">{selectedReservation.estimatedDuration}시간</span>
                </div>
              </div>

              {/* 고객 및 차량 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">고객 정보</h4>
                  <div className="space-y-1 rounded-md bg-muted/30 p-3">
                    <div className="text-sm">
                      <span className="font-medium">이름:</span> {selectedReservation.customerName}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">연락처:</span>{' '}
                      {selectedReservation.contactPhone}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">차량 정보</h4>
                  <div className="space-y-1 rounded-md bg-muted/30 p-3">
                    <div className="text-sm">
                      <span className="font-medium">차량:</span>{' '}
                      {selectedReservation.vehicleInfo.manufacturer}{' '}
                      {selectedReservation.vehicleInfo.model}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">번호판:</span>{' '}
                      {selectedReservation.vehicleInfo.licensePlate}
                    </div>
                  </div>
                </div>
              </div>

              {/* 정비 내용 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">정비 내용</h4>
                <div className="rounded-md bg-muted/30 p-3">
                  <div className="text-sm">{selectedReservation.description}</div>
                </div>
              </div>

              {/* 특별 요청사항 */}
              {selectedReservation.specialRequests && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">특별 요청사항</h4>
                  <div className="rounded-md bg-muted/30 p-3">
                    <div className="text-sm italic">
                      &ldquo;{selectedReservation.specialRequests}&rdquo;
                    </div>
                  </div>
                </div>
              )}

              {/* 작업 버튼 */}
              <div className="flex justify-between pt-4">
                <div>
                  {selectedReservation.status === 'requested' && (
                    <Button variant="destructive" size="sm">
                      예약 거절
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleCloseDetailDialog}>
                    닫기
                  </Button>
                  {selectedReservation.status === 'requested' && (
                    <Button variant="default">예약 확정</Button>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <Button variant="default">정비 작업 생성</Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReservationCalendar;
