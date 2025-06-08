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
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@cargoro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import {
  useGetTechnicianSchedules,
  useGetSchedulesByDate,
  TechnicianSchedule,
} from '../hooks/useTechnicianSchedule';
import { cn } from '../../../utils/cn';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@cargoro/ui';
import TechnicianScheduleForm from './technician-schedule-form';

interface TechnicianScheduleCalendarProps {
  technicianId: string;
  technicianName: string;
}

const TechnicianScheduleCalendar: React.FC<TechnicianScheduleCalendarProps> = ({
  technicianId,
  technicianName,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<TechnicianSchedule | null>(null);
  const [isScheduleDetailOpen, setIsScheduleDetailOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 현재 보기 모드에 따라 날짜 범위 계산
  const dateRange =
    view === 'month'
      ? { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
      : {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        };

  // 정비사 일정 조회
  const {
    data: technicianSchedules,
    isLoading,
    refetch: refetchSchedules,
  } = useGetTechnicianSchedules({
    technicianId,
    dateFrom: dateRange.start,
    dateTo: dateRange.end,
  });

  // 선택한 날짜의 일정 조회
  const {
    data: daySchedules,
    isLoading: isDaySchedulesLoading,
    refetch: refetchDaySchedules,
  } = useGetSchedulesByDate(selectedDate || new Date(), technicianId);

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

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // 일정 클릭 핸들러
  const handleScheduleClick = (schedule: TechnicianSchedule) => {
    setSelectedSchedule(schedule);
    setIsScheduleDetailOpen(true);
  };

  // 일정 추가 버튼 클릭 핸들러
  const handleAddSchedule = () => {
    setIsAddDialogOpen(true);
  };

  // 일정 추가 폼 닫기 핸들러
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    refetchSchedules();
    if (selectedDate) {
      refetchDaySchedules();
    }
  };

  // 일정 상세 다이얼로그 닫기 핸들러
  const handleCloseDetailDialog = () => {
    setIsScheduleDetailOpen(false);
    setSelectedSchedule(null);
  };

  // 일정 수정 버튼 클릭 핸들러
  const handleEditSchedule = () => {
    setIsScheduleDetailOpen(false);
    setIsEditDialogOpen(true);
  };

  // 일정 수정 폼 닫기 핸들러
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedSchedule(null);
    refetchSchedules();
    if (selectedDate) {
      refetchDaySchedules();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">{technicianName}의 일정</CardTitle>
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
            <Button variant="default" size="sm" onClick={handleAddSchedule}>
              <Plus className="mr-1 h-4 w-4" />
              일정 추가
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
              {eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).map(day => (
                <div
                  key={day.toString()}
                  className={cn(
                    'h-24 cursor-pointer rounded-md border p-1 hover:bg-muted/50',
                    selectedDate && isSameDay(day, selectedDate) ? 'bg-primary/10' : ''
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-xs font-medium">{format(day, 'E', { locale: ko })}</div>
                  <div className="text-sm font-semibold">{format(day, 'd')}</div>
                  <div className="mt-1 max-h-16 space-y-1 overflow-y-auto">
                    {!isLoading &&
                      technicianSchedules?.data
                        .filter((schedule: TechnicianSchedule) =>
                          isSameDay(parseISO(schedule.startTime), day)
                        )
                        .slice(0, 2)
                        .map((schedule: TechnicianSchedule) => (
                          <div
                            key={schedule.id}
                            className="truncate rounded bg-primary/20 px-1 py-0.5 text-xs"
                            onClick={e => {
                              e.stopPropagation();
                              handleScheduleClick(schedule);
                            }}
                          >
                            {format(parseISO(schedule.startTime), 'HH:mm')} {schedule.title}
                          </div>
                        ))}
                    {!isLoading &&
                      technicianSchedules?.data.filter((schedule: TechnicianSchedule) =>
                        isSameDay(parseISO(schedule.startTime), day)
                      ).length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +
                          {technicianSchedules.data.filter((schedule: TechnicianSchedule) =>
                            isSameDay(parseISO(schedule.startTime), day)
                          ).length - 2}{' '}
                          더 보기
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'yyyy년 MM월 dd일 (E)', { locale: ko })} 일정
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDaySchedulesLoading ? (
              <div className="py-4 text-center">일정을 불러오는 중...</div>
            ) : daySchedules?.data && daySchedules.data.length > 0 ? (
              <div className="space-y-3">
                {daySchedules.data.map((schedule: TechnicianSchedule) => (
                  <div
                    key={schedule.id}
                    className="cursor-pointer rounded-md border p-3 hover:bg-muted/50"
                    onClick={() => handleScheduleClick(schedule)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{schedule.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(schedule.startTime), 'HH:mm')} -{' '}
                        {format(parseISO(schedule.endTime), 'HH:mm')}
                      </span>
                    </div>
                    {schedule.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{schedule.description}</p>
                    )}
                    {schedule.repairId && (
                      <div className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        정비 작업 연결됨
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                해당 날짜에 예정된 일정이 없습니다.
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={handleAddSchedule}>
                    <Plus className="mr-1 h-4 w-4" />
                    일정 추가
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 일정 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>일정 추가</DialogTitle>
          </DialogHeader>
          <TechnicianScheduleForm
            technicianId={technicianId}
            initialDate={selectedDate || new Date()}
            onClose={handleCloseAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* 일정 상세 다이얼로그 */}
      {selectedSchedule && (
        <Dialog open={isScheduleDetailOpen} onOpenChange={setIsScheduleDetailOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>일정 상세 정보</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedSchedule.title}</h3>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span>
                    {format(parseISO(selectedSchedule.startTime), 'yyyy년 MM월 dd일 (E) HH:mm', {
                      locale: ko,
                    })}{' '}
                    -{format(parseISO(selectedSchedule.endTime), ' HH:mm', { locale: ko })}
                  </span>
                </div>
              </div>

              {selectedSchedule.description && (
                <div>
                  <h4 className="text-sm font-medium">설명</h4>
                  <p className="mt-1 text-sm">{selectedSchedule.description}</p>
                </div>
              )}

              {selectedSchedule.repairId && (
                <div>
                  <h4 className="text-sm font-medium">연결된 정비 작업</h4>
                  <div className="mt-1 text-sm">
                    <Button variant="link" className="h-auto p-0">
                      정비 작업 #{selectedSchedule.repairId} 보기
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCloseDetailDialog}>
                  닫기
                </Button>
                <Button variant="default" onClick={handleEditSchedule}>
                  수정
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 일정 수정 다이얼로그 */}
      {selectedSchedule && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>일정 수정</DialogTitle>
            </DialogHeader>
            <TechnicianScheduleForm
              technicianId={technicianId}
              schedule={selectedSchedule}
              onClose={handleCloseEditDialog}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TechnicianScheduleCalendar;
