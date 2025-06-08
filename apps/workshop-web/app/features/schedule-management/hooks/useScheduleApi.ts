/**
 * 일정 관리 API 통신용 훅
 * Zod와 React Query를 사용하여 타입 안전한 API 호출을 구현합니다.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  scheduleApi,
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
} from '@cargoro/api-client/lib/schedule-api';
import { format } from 'date-fns';

// 백엔드 스네이크 케이스를 프론트엔드 카멜 케이스로 변환하는 유틸리티 함수
const transformSchedule = (schedule: Schedule) => {
  return {
    id: schedule.id,
    technicianId: schedule.technician_id,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    repairId: schedule.repair_id,
    title: schedule.title,
    description: schedule.description,
    createdAt: schedule.created_at,
    updatedAt: schedule.updated_at,
  };
};

/**
 * 모든 일정 조회 훅
 */
export function useSchedules(filter = {}) {
  return useQuery({
    queryKey: ['schedules', filter],
    queryFn: async () => {
      const response = await scheduleApi.getAllSchedules(filter);
      return {
        schedules: response.data.map(transformSchedule),
        page: response.page,
        perPage: response.per_page,
        totalItems: response.total_items,
        totalPages: response.total_pages,
      };
    },
  });
}

/**
 * 특정 날짜의 일정 조회 훅
 */
export function useSchedulesByDate(date: Date, technicianId?: string) {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const params = technicianId ? { technician_id: technicianId } : {};

  return useQuery({
    queryKey: ['schedules', 'date', formattedDate, technicianId],
    queryFn: async () => {
      const response = await scheduleApi.getSchedulesByDate(formattedDate, params);
      return {
        schedules: response.data.map(transformSchedule),
        page: response.page,
        perPage: response.per_page,
        totalItems: response.total_items,
        totalPages: response.total_pages,
      };
    },
  });
}

/**
 * 특정 정비사의 일정 조회 훅
 */
export function useTechnicianSchedules(technicianId: string, dateFrom?: Date, dateTo?: Date) {
  const params: Record<string, string> = {};

  if (dateFrom) {
    params.date_from = format(dateFrom, 'yyyy-MM-dd');
  }

  if (dateTo) {
    params.date_to = format(dateTo, 'yyyy-MM-dd');
  }

  return useQuery({
    queryKey: ['schedules', 'technician', technicianId, params],
    queryFn: async () => {
      const response = await scheduleApi.getTechnicianSchedules(technicianId, params);
      return {
        schedules: response.data.map(transformSchedule),
        page: response.page,
        perPage: response.per_page,
        totalItems: response.total_items,
        totalPages: response.total_pages,
      };
    },
    enabled: !!technicianId,
  });
}

/**
 * 특정 일정 조회 훅
 */
export function useSchedule(id: string | undefined) {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      if (!id) throw new Error('일정 ID가 필요합니다.');
      const response = await scheduleApi.getScheduleById(id);
      return transformSchedule(response.data);
    },
    enabled: !!id,
  });
}

/**
 * 일정 생성 훅
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData: ScheduleCreate) => {
      const response = await scheduleApi.createSchedule(scheduleData);
      return transformSchedule(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

/**
 * 일정 업데이트 훅
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      updateData,
    }: {
      scheduleId: string;
      updateData: ScheduleUpdate;
    }) => {
      const response = await scheduleApi.updateSchedule(scheduleId, updateData);
      return transformSchedule(response.data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', data.id] });
    },
  });
}

/**
 * 일정 삭제 훅
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      await scheduleApi.deleteSchedule(scheduleId);
      return { id: scheduleId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

// 타입 재정의 (프론트엔드 친화적인 카멜 케이스)
export interface ScheduleData {
  id: string;
  technicianId: string;
  startTime: string;
  endTime: string;
  repairId?: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
