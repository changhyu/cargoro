'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PartFilter, UpdatePartInput } from '../types';
import { useState } from 'react';
import { partsService } from '../services/parts-service';

// 부품 목록 조회 훅
export function useParts(initialFilters = {}) {
  const [filters, setFilters] = useState<PartFilter>(initialFilters);

  const { data, isLoading, error } = useQuery({
    queryKey: ['parts', filters],
    queryFn: () => partsService.getParts(filters),
  });

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
  };
}

// 단일 부품 조회 훅
export function usePart(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['part', id],
    queryFn: () => partsService.getPart(id),
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    error,
  };
}

// 부품 생성 훅
export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partsService.createPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('부품이 성공적으로 등록되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 부품 수정 훅
export function useUpdatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartInput }) =>
      partsService.updatePart(id, data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['part', data.id] });
      toast.success('부품 정보가 성공적으로 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 부품 삭제 훅
export function useDeletePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partsService.deletePart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('부품이 성공적으로 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 재고 이동 이력 조회 훅
export function useStockMovements(partId: string) {
  return useQuery({
    queryKey: ['stock-movements', partId],
    queryFn: () => partsService.getStockMovements(partId),
    enabled: !!partId,
  });
}

// 재고 조정 훅
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: partsService.adjustStock,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['part', data.partId] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements', data.partId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('재고가 성공적으로 조정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// 카테고리 목록 조회 훅
export function useCategories() {
  return useQuery({
    queryKey: ['part-categories'],
    queryFn: partsService.getCategories,
  });
}

// 재고 통계 조회 훅
export function useInventoryStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: partsService.getInventoryStats,
  });

  return {
    data,
    isLoading,
    error,
  };
}
