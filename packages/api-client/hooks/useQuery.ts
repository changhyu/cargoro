import { useQuery as useReactQuery, UseQueryOptions } from '@tanstack/react-query';

import { apiClient } from '../lib/config/config';
import { queryPresets } from '../utils/query-defaults';

// GET 요청에 대한 React Query 훅
export function useQuery<TData = unknown, TError = unknown>(
  url: string,
  options?: UseQueryOptions<TData, TError>
) {
  return useReactQuery<TData, TError>({
    queryKey: [url],
    queryFn: async () => apiClient.get<TData>(url),
    ...options,
  });
}

// 파라미터가 포함된 GET 요청에 대한 React Query 훅
export function useQueryWithParams<TData = unknown, TParams = unknown, TError = unknown>(
  url: string,
  params: TParams,
  options?: UseQueryOptions<TData, TError>
) {
  return useReactQuery<TData, TError>({
    queryKey: [url, params],
    queryFn: async () => apiClient.get<TData>(url, { params }),
    ...options,
  });
}

// ID 기반 항목 조회를 위한 React Query 훅
export function useQueryById<TData = unknown, TError = unknown>(
  url: string,
  id: string | number | undefined,
  options?: UseQueryOptions<TData, TError>
) {
  return useReactQuery<TData, TError>({
    queryKey: [url, id],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required');
      }
      return apiClient.get<TData>(`${url}/${id}`);
    },
    enabled: !!id,
    ...options,
  });
}

// 실시간 업데이트가 필요한 데이터를 위한 GET 요청 훅
export function useRealtimeQuery<TData = unknown, TError = unknown>(
  url: string,
  options?: UseQueryOptions<TData, TError>
) {
  return useReactQuery<TData, TError>({
    queryKey: [url],
    queryFn: async () => apiClient.get<TData>(url),
    ...queryPresets.realtime,
    ...options,
  });
}

// 자주 변경되는 데이터를 위한 GET 요청 훅
export function useFrequentlyUpdatedQuery<TData = unknown, TError = unknown>(
  url: string,
  options?: UseQueryOptions<TData, TError>
) {
  return useReactQuery<TData, TError>({
    queryKey: [url],
    queryFn: async () => apiClient.get<TData>(url),
    ...queryPresets.frequentlyUpdated,
    ...options,
  });
}

// 거의 변경되지 않는 데이터를 위한 GET 요청 훅
export function useRarelyUpdatedQuery<TData = unknown, TError = unknown>(
  url: string,
  options?: UseQueryOptions<TData, TError>
) {
  return useReactQuery<TData, TError>({
    queryKey: [url],
    queryFn: async () => apiClient.get<TData>(url),
    ...queryPresets.rarelyUpdated,
    ...options,
  });
}
