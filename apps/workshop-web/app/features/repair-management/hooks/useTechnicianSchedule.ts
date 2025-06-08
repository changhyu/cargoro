import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// 일정 타입 정의
export interface TechnicianSchedule {
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

// 일정 생성 요청 타입
export interface CreateScheduleRequest {
  technicianId: string;
  startTime: string;
  endTime: string;
  repairId?: string;
  title: string;
  description?: string;
}

// 일정 업데이트 요청 타입
export interface UpdateScheduleRequest {
  technicianId?: string;
  startTime?: string;
  endTime?: string;
  repairId?: string;
  title?: string;
  description?: string;
}

// 일정 필터 타입
export interface ScheduleFilter {
  technicianId?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  page?: number;
  pageSize?: number;
}

/**
 * 정비사 일정 목록 조회 훅
 */
export const useGetTechnicianSchedules = (filters: ScheduleFilter) => {
  const { technicianId, dateFrom, dateTo, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ['technicianSchedules', { technicianId, dateFrom, dateTo, page, pageSize }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();

        if (dateFrom) {
          const formattedDateFrom =
            typeof dateFrom === 'string' ? dateFrom : format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss");
          params.append('date_from', formattedDateFrom);
        }

        if (dateTo) {
          const formattedDateTo =
            typeof dateTo === 'string' ? dateTo : format(dateTo, "yyyy-MM-dd'T'HH:mm:ss");
          params.append('date_to', formattedDateTo);
        }

        params.append('skip', ((page - 1) * pageSize).toString());
        params.append('limit', pageSize.toString());

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const { data } = await axios.get(
          `${API_URL}/schedules/technician/${technicianId}${queryString}`
        );

        return data;
      } catch (error) {
        // TODO: 에러 처리 및 로깅 구현

        // 개발 환경에서 API가 없는 경우 임시 데이터 반환
        if (process.env.NODE_ENV === 'development') {
          return {
            data: Array(5)
              .fill(null)
              .map((_, index) => ({
                id: `schedule-${index + 1}`,
                technicianId: technicianId || 'tech-1',
                startTime: new Date(new Date().setHours(9 + index, 0, 0)).toISOString(),
                endTime: new Date(new Date().setHours(10 + index, 0, 0)).toISOString(),
                repairId: index % 2 === 0 ? `repair-${index}` : undefined,
                title: `정비 작업 일정 ${index + 1}`,
                description: index % 2 === 0 ? '엔진 오일 교체 및 점검' : '브레이크 패드 교체',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })),
            page: page,
            perPage: pageSize,
            totalItems: 5,
            totalPages: 1,
          };
        }

        throw error;
      }
    },
    enabled: !!technicianId,
  });
};

/**
 * 특정 날짜의 일정 조회 훅
 */
export const useGetSchedulesByDate = (targetDate: Date, technicianId?: string) => {
  return useQuery({
    queryKey: ['schedulesByDate', format(targetDate, 'yyyy-MM-dd'), technicianId],
    queryFn: async () => {
      try {
        const formattedDate = format(targetDate, "yyyy-MM-dd'T'HH:mm:ss");
        let url = `${API_URL}/schedules/date/${formattedDate}`;

        if (technicianId) {
          url += `?technician_id=${technicianId}`;
        }

        const { data } = await axios.get(url);
        return data;
      } catch (error) {
        // TODO: 에러 처리 및 로깅 구현

        // 개발 환경에서 API가 없는 경우 임시 데이터 반환
        if (process.env.NODE_ENV === 'development') {
          return {
            data: Array(3)
              .fill(null)
              .map((_, index) => ({
                id: `schedule-${index + 1}`,
                technicianId: technicianId || `tech-${index + 1}`,
                startTime: new Date(
                  new Date(targetDate).setHours(9 + index * 3, 0, 0)
                ).toISOString(),
                endTime: new Date(
                  new Date(targetDate).setHours(12 + index * 3, 0, 0)
                ).toISOString(),
                repairId: index % 2 === 0 ? `repair-${index}` : undefined,
                title: `${format(targetDate, 'yyyy-MM-dd')} 정비 일정 ${index + 1}`,
                description: index % 2 === 0 ? '정기 점검' : '부품 교체',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })),
            page: 1,
            perPage: 10,
            totalItems: 3,
            totalPages: 1,
          };
        }

        throw error;
      }
    },
  });
};

/**
 * 일정 생성 훅
 */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData: CreateScheduleRequest) => {
      const response = await axios.post(
        `${API_URL}/schedules`,
        {
          technician_id: scheduleData.technicianId,
          start_time: scheduleData.startTime,
          end_time: scheduleData.endTime,
          repair_id: scheduleData.repairId,
          title: scheduleData.title,
          description: scheduleData.description,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['technicianSchedules', { technicianId: variables.technicianId }],
      });

      const targetDate = new Date(variables.startTime);
      queryClient.invalidateQueries({
        queryKey: ['schedulesByDate', format(targetDate, 'yyyy-MM-dd')],
      });
    },
  });
};

/**
 * 일정 업데이트 훅
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      data,
    }: {
      scheduleId: string;
      data: UpdateScheduleRequest;
    }) => {
      const response = await axios.patch(
        `${API_URL}/schedules/${scheduleId}`,
        {
          technician_id: data.technicianId,
          start_time: data.startTime,
          end_time: data.endTime,
          repair_id: data.repairId,
          title: data.title,
          description: data.description,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['technicianSchedules'],
      });

      if (variables.data.startTime) {
        const targetDate = new Date(variables.data.startTime);
        queryClient.invalidateQueries({
          queryKey: ['schedulesByDate', format(targetDate, 'yyyy-MM-dd')],
        });
      }
    },
  });
};

/**
 * 일정 삭제 훅
 */
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await axios.delete(`${API_URL}/schedules/${scheduleId}`);
      return response.data;
    },
    onSuccess: () => {
      // 모든 관련 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['technicianSchedules'],
      });
      queryClient.invalidateQueries({
        queryKey: ['schedulesByDate'],
      });
    },
  });
};
