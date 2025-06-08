import { useState, useCallback } from 'react';
import { useToast } from '@cargoro/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repairApi } from '@/app/services/api';
import { RepairOrder, RepairTask } from '@/app/features/repairs/repair-order';

// API 에러 타입 정의
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// API 응답 타입 정의
interface RepairOrderApiResponse {
  data: RepairOrder[];
  success: boolean;
  message?: string;
}

interface SingleRepairOrderApiResponse {
  data: RepairOrder;
  success: boolean;
  message?: string;
}

interface TaskApiResponse {
  data: RepairTask;
  success: boolean;
  message?: string;
}

// 로깅 유틸리티
const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  },
};

/**
 * 정비 작업 관리 커스텀 훅
 *
 * 정비 주문서 조회, 추가, 수정, 삭제 기능을 제공합니다.
 */
export function useRepairs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRepairOrder, setSelectedRepairOrder] = useState<RepairOrder | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // 정비 주문서 목록 조회
  const {
    data: repairOrders = [],
    isLoading,
    isError,
    error,
  } = useQuery<RepairOrder[], ApiError>({
    queryKey: ['repairOrders'],
    queryFn: async (): Promise<RepairOrder[]> => {
      try {
        const response: RepairOrderApiResponse = await repairApi.get('/repair-orders');
        return response.data || [];
      } catch (err) {
        logger.error('정비 주문서 목록 조회 실패:', err);
        throw err instanceof Error
          ? err
          : new Error('정비 주문서 목록을 불러오는 중 오류가 발생했습니다.');
      }
    },
  });

  // 정비 주문서 상세 조회
  const fetchRepairOrderDetail = useCallback(async (orderId: string): Promise<RepairOrder> => {
    try {
      const response: SingleRepairOrderApiResponse = await repairApi.get(
        `/repair-orders/${orderId}`
      );
      return response.data;
    } catch (err) {
      logger.error('정비 주문서 상세 조회 실패:', err);
      throw err instanceof Error
        ? err
        : new Error('정비 주문서 상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, []);

  // 정비 주문서 추가 mutation
  const { mutate: addRepairOrder, isPending: isAddingPending } = useMutation<
    RepairOrder,
    ApiError,
    Omit<RepairOrder, 'id' | 'tasks'>
  >({
    mutationFn: async (newOrder: Omit<RepairOrder, 'id' | 'tasks'>): Promise<RepairOrder> => {
      try {
        const response: SingleRepairOrderApiResponse = await repairApi.post(
          '/repair-orders',
          newOrder
        );
        return response.data;
      } catch (err) {
        logger.error('정비 주문서 생성 실패:', err);
        throw err instanceof Error ? err : new Error('정비 주문서 생성 중 오류가 발생했습니다.');
      }
    },
    onSuccess: () => {
      toast({
        title: '정비 주문서 생성 완료',
        description: '정비 주문서가 성공적으로 생성되었습니다.',
      });
      setIsCreatingOrder(false);
      queryClient.invalidateQueries({ queryKey: ['repairOrders'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '정비 주문서 생성 실패',
        description: error.message || '정비 주문서 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 정비 주문서 수정 mutation
  const { mutate: updateRepairOrder, isPending: isUpdatingPending } = useMutation<
    RepairOrder,
    ApiError,
    RepairOrder
  >({
    mutationFn: async (updatedOrder: RepairOrder): Promise<RepairOrder> => {
      try {
        const response: SingleRepairOrderApiResponse = await repairApi.put(
          `/repair-orders/${updatedOrder.id}`,
          updatedOrder
        );
        return response.data;
      } catch (err) {
        logger.error('정비 주문서 수정 실패:', err);
        throw err instanceof Error ? err : new Error('정비 주문서 수정 중 오류가 발생했습니다.');
      }
    },
    onSuccess: () => {
      toast({
        title: '정비 주문서 업데이트 완료',
        description: '정비 주문서가 성공적으로 수정되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['repairOrders'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '정비 주문서 업데이트 실패',
        description: error.message || '정비 주문서 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 정비 주문서 상태 변경 mutation
  const { mutate: updateRepairOrderStatus, isPending: isStatusChangePending } = useMutation<
    RepairOrder,
    ApiError,
    { id: string; status: RepairOrder['status'] }
  >({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: RepairOrder['status'];
    }): Promise<RepairOrder> => {
      try {
        const response: SingleRepairOrderApiResponse = await repairApi.patch(
          `/repair-orders/${id}/status`,
          { status }
        );
        return response.data;
      } catch (err) {
        logger.error('정비 주문서 상태 변경 실패:', err);
        throw err instanceof Error
          ? err
          : new Error('정비 주문서 상태 변경 중 오류가 발생했습니다.');
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: '정비 주문서 상태 변경 완료',
        description: `정비 주문서 상태가 ${variables.status}(으)로 변경되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ['repairOrders'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '정비 주문서 상태 변경 실패',
        description: error.message || '정비 주문서 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 작업 추가 mutation
  const { mutate: addRepairTask, isPending: isAddingTaskPending } = useMutation<
    RepairTask,
    ApiError,
    { orderId: string; task: Omit<RepairTask, 'id'> }
  >({
    mutationFn: async ({
      orderId,
      task,
    }: {
      orderId: string;
      task: Omit<RepairTask, 'id'>;
    }): Promise<RepairTask> => {
      try {
        const response: TaskApiResponse = await repairApi.post(
          `/repair-orders/${orderId}/tasks`,
          task
        );
        return response.data;
      } catch (err) {
        logger.error('정비 작업 추가 실패:', err);
        throw err instanceof Error ? err : new Error('정비 작업 추가 중 오류가 발생했습니다.');
      }
    },
    onSuccess: () => {
      toast({
        title: '작업 추가 완료',
        description: '정비 작업이 성공적으로 추가되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['repairOrders'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '작업 추가 실패',
        description: error.message || '정비 작업 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 작업 상태 변경 mutation
  const { mutate: updateTaskStatus, isPending: isTaskStatusChangePending } = useMutation<
    RepairTask,
    ApiError,
    { orderId: string; taskId: string; status: RepairTask['status'] }
  >({
    mutationFn: async ({
      orderId,
      taskId,
      status,
    }: {
      orderId: string;
      taskId: string;
      status: RepairTask['status'];
    }): Promise<RepairTask> => {
      try {
        const response: TaskApiResponse = await repairApi.patch(
          `/repair-orders/${orderId}/tasks/${taskId}/status`,
          {
            status,
          }
        );
        return response.data;
      } catch (err) {
        logger.error('작업 상태 변경 실패:', err);
        throw err instanceof Error ? err : new Error('작업 상태 변경 중 오류가 발생했습니다.');
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: '작업 상태 변경 완료',
        description: `작업 상태가 ${variables.status}(으)로 변경되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ['repairOrders'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '작업 상태 변경 실패',
        description: error.message || '작업 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 정비 주문서 선택 핸들러
  const handleSelectRepairOrder = useCallback(
    async (orderId: string): Promise<RepairOrder | null> => {
      try {
        const orderDetail = await fetchRepairOrderDetail(orderId);
        setSelectedRepairOrder(orderDetail);
        return orderDetail;
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast({
          title: '정비 주문서 조회 실패',
          description: apiError.message || '정비 주문서 조회 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [fetchRepairOrderDetail, toast]
  );

  // 정비 주문서 생성 모드 핸들러
  const handleCreateOrderMode = useCallback(() => {
    setIsCreatingOrder(true);
    setSelectedRepairOrder(null);
  }, []);

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    setIsCreatingOrder(false);
    setSelectedRepairOrder(null);
  }, []);

  return {
    repairOrders,
    selectedRepairOrder,
    isLoading,
    isError,
    error,
    isCreatingOrder,
    isPending:
      isAddingPending ||
      isUpdatingPending ||
      isStatusChangePending ||
      isAddingTaskPending ||
      isTaskStatusChangePending,
    addRepairOrder,
    updateRepairOrder,
    updateRepairOrderStatus,
    addRepairTask,
    updateTaskStatus,
    handleSelectRepairOrder,
    handleCreateOrderMode,
    handleCancel,
  };
}
