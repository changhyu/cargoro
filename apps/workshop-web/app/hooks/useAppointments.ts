import React, { useState, useCallback } from 'react';
import { useToast } from '@cargoro/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repairApi } from '@/app/services/api';
import { Appointment } from '@/app/features/appointments/appointment-calendar';
import { formatDateToYYYYMMDD } from '../utils/type-utils';
import { ApiError } from '../types/api-types';

/**
 * 예약 관리 커스텀 훅
 *
 * 예약 목록 조회, 추가, 수정, 삭제 기능을 제공합니다.
 */
export function useAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // 날짜 형식 변환 헬퍼 함수 (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    return formatDateToYYYYMMDD(date);
  };

  // 예약 목록 조회
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['appointments', formatDate(selectedDate)],
    queryFn: async () => {
      const response = await repairApi.get(`/appointments?date=${formatDate(selectedDate)}`);
      return response.data;
    },
  });

  // React Query v5에서는 onError를 제거하고 useEffect나 조건부 로직으로 대체
  // 에러 발생 시 토스트 표시
  React.useEffect(() => {
    if (error) {
      const apiError = error as unknown as ApiError;
      toast({
        variant: 'destructive',
        title: '예약 조회 실패',
        description: apiError.message || '예약 목록을 불러오는 중 오류가 발생했습니다.',
      });
    }
  }, [error, toast]);

  // 예약 추가 mutation
  const { mutate: addAppointment, isPending: isAddingPending } = useMutation({
    mutationFn: async (newAppointment: Omit<Appointment, 'id'>) => {
      const response = await repairApi.post('/appointments', newAppointment);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: '예약 추가 완료',
        description: '예약이 성공적으로 추가되었습니다.',
      });
      setIsAddingAppointment(false);
      queryClient.invalidateQueries({ queryKey: ['appointments', formatDate(selectedDate)] });
    },
    onError: err => {
      const apiError = err as unknown as ApiError;
      toast({
        title: '예약 추가 실패',
        description: apiError.message || '예약 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 예약 수정 mutation
  const { mutate: updateAppointment, isPending: isUpdatingPending } = useMutation({
    mutationFn: async (updatedAppointment: Appointment) => {
      const response = await repairApi.put(
        `/appointments/${updatedAppointment.id}`,
        updatedAppointment
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: '예약 정보 업데이트 완료',
        description: '예약 정보가 성공적으로 수정되었습니다.',
      });
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ['appointments', formatDate(selectedDate)] });
    },
    onError: err => {
      const apiError = err as unknown as ApiError;
      toast({
        title: '예약 정보 업데이트 실패',
        description: apiError.message || '예약 정보 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 예약 상태 변경 mutation
  const { mutate: updateAppointmentStatus, isPending: isStatusChangePending } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment['status'] }) => {
      const response = await repairApi.patch(`/appointments/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      const statusMessages = {
        scheduled: '예약 확정',
        'in-progress': '진행 중',
        completed: '완료',
        cancelled: '취소',
      };

      toast({
        title: `예약 상태 변경 완료`,
        description: `예약 상태가 ${statusMessages[variables.status]}(으)로 변경되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ['appointments', formatDate(selectedDate)] });
    },
    onError: err => {
      const apiError = err as unknown as ApiError;
      toast({
        title: '예약 상태 변경 실패',
        description: apiError.message || '예약 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 예약 삭제 mutation
  const { mutate: deleteAppointment, isPending: isDeletingPending } = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await repairApi.delete(`/appointments/${appointmentId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: '예약 삭제 완료',
        description: '예약이 성공적으로 삭제되었습니다.',
      });
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ['appointments', formatDate(selectedDate)] });
    },
    onError: err => {
      const apiError = err as unknown as ApiError;
      toast({
        title: '예약 삭제 실패',
        description: apiError.message || '예약 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 날짜 변경 핸들러
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // 예약 선택 핸들러
  const handleSelectAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
  }, []);

  // 예약 추가 모드 핸들러
  const handleAddAppointmentMode = useCallback(() => {
    setIsAddingAppointment(true);
    setSelectedAppointment(null);
  }, []);

  // 편집 취소 핸들러
  const handleCancel = useCallback(() => {
    setIsAddingAppointment(false);
    setSelectedAppointment(null);
  }, []);

  return {
    appointments,
    isLoading,
    isError,
    error,
    selectedDate,
    selectedAppointment,
    isAddingAppointment,
    isPending: isAddingPending || isUpdatingPending || isStatusChangePending || isDeletingPending,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    handleDateChange,
    handleSelectAppointment,
    handleAddAppointmentMode,
    handleCancel,
  };
}
