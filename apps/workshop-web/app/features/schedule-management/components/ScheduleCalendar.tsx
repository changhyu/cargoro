'use client';

import React, { useState, useCallback } from 'react';
import { Calendar } from '@cargoro/ui';
import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cargoro/ui';
import { Button } from '@cargoro/ui';
import { useSchedulesByDate, useTechnicianSchedules, ScheduleData } from '../hooks/useScheduleApi';
import { format, addDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CreateScheduleModal } from './CreateScheduleModal';

interface ScheduleCalendarProps {
  onScheduleClick?: (schedule: ScheduleData) => void;
  technicians?: { id: string; name: string }[];
}

export function ScheduleCalendar({ onScheduleClick, technicians = [] }: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 선택한 날짜의 일정 조회
  const { data: dateSchedules, isLoading: isLoadingDateSchedules } = useSchedulesByDate(
    selectedDate,
    selectedTechnicianId
  );

  // 선택한 정비사의 일정 조회 (한 달 범위)
  const { data: technicianSchedules, isLoading: isLoadingTechnicianSchedules } =
    useTechnicianSchedules(
      selectedTechnicianId,
      addDays(selectedDate, -15),
      addDays(selectedDate, 15)
    );

  // 모든 일정 목록 (현재 표시할 수 있는 일정)
  const allSchedules = selectedTechnicianId
    ? technicianSchedules?.schedules || []
    : dateSchedules?.schedules || [];

  // 캘린더에 표시할 일정 날짜 계산
  const scheduleDates = allSchedules.map(schedule => parseISO(schedule.startTime));

  // 정비사 선택 변경 처리
  const handleTechnicianChange = (technicianId: string) => {
    setSelectedTechnicianId(technicianId);
  };

  // 일정 클릭 처리
  const handleScheduleClick = useCallback(
    (schedule: ScheduleData) => {
      if (onScheduleClick) {
        onScheduleClick(schedule);
      }
    },
    [onScheduleClick]
  );

  // 일정 생성 모달 열기
  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>일정 캘린더</CardTitle>
          <CardDescription>일정을 확인하고 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">정비사 선택</label>
              <Select value={selectedTechnicianId} onValueChange={handleTechnicianChange}>
                <SelectTrigger>
                  <SelectValue placeholder="모든 정비사" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">모든 정비사</SelectItem>
                  {technicians.map(technician => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={date => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={ko}
              disabled={isLoadingDateSchedules || isLoadingTechnicianSchedules}
              modifiers={{
                hasSchedule: scheduleDates,
              }}
              modifiersStyles={{
                hasSchedule: {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fontWeight: 'bold',
                },
              }}
            />

            <Button onClick={openCreateModal} className="w-full">
              새 일정 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{format(selectedDate, 'yyyy년 MM월 dd일 (EEEE)', { locale: ko })}</CardTitle>
            <CardDescription>
              {selectedTechnicianId ? `선택한 정비사의 일정` : '이 날짜의 모든 일정'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDateSchedules || isLoadingTechnicianSchedules ? (
            <div className="flex items-center justify-center p-10">
              <p>로딩 중...</p>
            </div>
          ) : allSchedules.length === 0 ? (
            <div className="flex items-center justify-center p-10">
              <p className="text-muted-foreground">표시할 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allSchedules.map(schedule => (
                <div
                  key={schedule.id}
                  className="flex cursor-pointer flex-col rounded-lg border p-4 hover:bg-muted/50"
                  onClick={() => handleScheduleClick(schedule)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{schedule.title}</h3>
                    <Badge variant="outline">
                      {format(parseISO(schedule.startTime), 'HH:mm')} -{' '}
                      {format(parseISO(schedule.endTime), 'HH:mm')}
                    </Badge>
                  </div>
                  {schedule.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{schedule.description}</p>
                  )}
                  {schedule.repairId && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      정비 작업: {schedule.repairId.substring(0, 8)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <CreateScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
          selectedTechnicianId={selectedTechnicianId}
          technicians={technicians}
        />
      )}
    </div>
  );
}
