import { useState, useCallback } from 'react';
import { useToast } from '@cargoro/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partsApi } from '@/app/services/api';
import { Part } from '@/app/features/parts/parts-inventory';

// API 에러 타입 정의
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// 부품 API 응답 타입
interface PartApiResponse {
  data: Part[];
  success: boolean;
  message?: string;
}

interface SinglePartApiResponse {
  data: Part;
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
 * 부품 관리 커스텀 훅
 *
 * 부품 목록 조회, 추가, 수정, 삭제 기능을 제공합니다.
 */
export function useParts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isAddingPart, setIsAddingPart] = useState(false);

  // 부품 목록 조회
  const {
    data: parts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Part[], ApiError>({
    queryKey: ['parts'],
    queryFn: async (): Promise<Part[]> => {
      try {
        const response: PartApiResponse = await partsApi.get('/parts');
        return response.data || [];
      } catch (err) {
        logger.error('부품 목록 조회 실패:', err);
        throw err instanceof Error
          ? err
          : new Error('부품 목록을 불러오는 중 오류가 발생했습니다.');
      }
    },
  });

  // 부품 추가 mutation
  const { mutate: addPart, isPending: isAddingPending } = useMutation<
    Part,
    ApiError,
    Omit<Part, 'id'>
  >({
    mutationFn: async (newPart: Omit<Part, 'id'>): Promise<Part> => {
      try {
        const response: SinglePartApiResponse = await partsApi.post('/parts', newPart);
        return response.data;
      } catch (err) {
        logger.error('부품 추가 실패:', err);
        throw err instanceof Error ? err : new Error('부품 추가 중 오류가 발생했습니다.');
      }
    },
    onSuccess: () => {
      toast({
        title: '부품 추가 완료',
        description: '부품이 성공적으로 추가되었습니다.',
      });
      setIsAddingPart(false);
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '부품 추가 실패',
        description: error.message || '부품 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 부품 수정 mutation
  const { mutate: updatePart, isPending: isUpdatingPending } = useMutation<Part, ApiError, Part>({
    mutationFn: async (updatedPart: Part): Promise<Part> => {
      try {
        const response: SinglePartApiResponse = await partsApi.put(
          `/parts/${updatedPart.id}`,
          updatedPart
        );
        return response.data;
      } catch (err) {
        logger.error('부품 수정 실패:', err);
        throw err instanceof Error ? err : new Error('부품 정보 수정 중 오류가 발생했습니다.');
      }
    },
    onSuccess: () => {
      toast({
        title: '부품 정보 업데이트 완료',
        description: '부품 정보가 성공적으로 수정되었습니다.',
      });
      setSelectedPart(null);
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '부품 정보 업데이트 실패',
        description: error.message || '부품 정보 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 부품 재고 업데이트 mutation
  const { mutate: updatePartStock, isPending: isStockUpdatePending } = useMutation<
    Part,
    ApiError,
    { partId: string; stock: number }
  >({
    mutationFn: async ({ partId, stock }: { partId: string; stock: number }): Promise<Part> => {
      try {
        const response: SinglePartApiResponse = await partsApi.patch(`/parts/${partId}/stock`, {
          stock,
        });
        return response.data;
      } catch (err) {
        logger.error('재고 업데이트 실패:', err);
        throw err instanceof Error ? err : new Error('재고 업데이트 중 오류가 발생했습니다.');
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: '재고 업데이트 완료',
        description: `재고가 ${variables.stock}개로 업데이트되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '재고 업데이트 실패',
        description: error.message || '재고 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 부품 재주문 mutation
  const { mutate: reorderPart, isPending: isReorderingPending } = useMutation<
    Part,
    ApiError,
    string
  >({
    mutationFn: async (partId: string): Promise<Part> => {
      try {
        const response: SinglePartApiResponse = await partsApi.post(`/parts/${partId}/reorder`);
        return response.data;
      } catch (err) {
        logger.error('부품 재주문 실패:', err);
        throw err instanceof Error ? err : new Error('부품 재주문 중 오류가 발생했습니다.');
      }
    },
    onSuccess: () => {
      toast({
        title: '부품 재주문 완료',
        description: '부품 재주문이 성공적으로 요청되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '부품 재주문 실패',
        description: error.message || '부품 재주문 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 부품 삭제 mutation
  const { mutate: deletePart, isPending: isDeletingPending } = useMutation<void, ApiError, string>({
    mutationFn: async (partId: string): Promise<void> => {
      try {
        await partsApi.delete(`/parts/${partId}`);
      } catch (err) {
        logger.error('부품 삭제 실패:', err);
        throw err instanceof Error ? err : new Error('부품 삭제 중 오류가 발생했습니다.');
      }
    },
    onSuccess: () => {
      toast({
        title: '부품 삭제 완료',
        description: '부품이 성공적으로 삭제되었습니다.',
      });
      setSelectedPart(null);
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
    onError: (error: ApiError) => {
      toast({
        title: '부품 삭제 실패',
        description: error.message || '부품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });

  // 부품 선택 핸들러
  const handleSelectPart = useCallback((part: Part) => {
    setSelectedPart(part);
  }, []);

  // 부품 추가 모드 핸들러
  const handleAddPartMode = useCallback(() => {
    setIsAddingPart(true);
    setSelectedPart(null);
  }, []);

  // 편집 취소 핸들러
  const handleCancel = useCallback(() => {
    setIsAddingPart(false);
    setSelectedPart(null);
  }, []);

  return {
    parts,
    selectedPart,
    isLoading,
    isError,
    error,
    isAddingPart,
    isPending:
      isAddingPending ||
      isUpdatingPending ||
      isStockUpdatePending ||
      isReorderingPending ||
      isDeletingPending,
    addPart,
    updatePart,
    updatePartStock,
    reorderPart,
    deletePart,
    handleSelectPart,
    handleAddPartMode,
    handleCancel,
  };
}
