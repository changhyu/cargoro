import { useMutation as useReactMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';

import { apiClient } from '../lib/config/config';

// POST 요청을 위한 mutation 훅
export function usePost<
  TData = unknown,
  TVariables extends Record<string, unknown> | undefined = undefined,
  TError = unknown,
>(
  url: string,
  options?: UseMutationOptions<TData, TError, TVariables>,
  config?: AxiosRequestConfig
) {
  return useReactMutation<TData, TError, TVariables>({
    mutationFn: variables => apiClient.post<TData>(url, variables, config),
    ...options,
  });
}

// PUT 요청을 위한 mutation 훅
export function usePut<
  TData = unknown,
  TVariables extends Record<string, unknown> | undefined = undefined,
  TError = unknown,
>(
  url: string,
  options?: UseMutationOptions<TData, TError, TVariables>,
  config?: AxiosRequestConfig
) {
  return useReactMutation<TData, TError, TVariables>({
    mutationFn: variables => apiClient.put<TData>(url, variables, config),
    ...options,
  });
}

// PATCH 요청을 위한 mutation 훅
export function usePatch<
  TData = unknown,
  TVariables extends Record<string, unknown> | undefined = undefined,
  TError = unknown,
>(
  url: string,
  options?: UseMutationOptions<TData, TError, TVariables>,
  config?: AxiosRequestConfig
) {
  return useReactMutation<TData, TError, TVariables>({
    mutationFn: variables => apiClient.patch<TData>(url, variables, config),
    ...options,
  });
}

// DELETE 요청을 위한 mutation 훅
export function useDelete<TData = unknown, TError = unknown>(
  url: string,
  options?: UseMutationOptions<TData, TError, void>,
  config?: AxiosRequestConfig
) {
  return useReactMutation<TData, TError, void>({
    mutationFn: () => apiClient.delete<TData>(url, config),
    ...options,
  });
}

// ID 기반 DELETE 요청을 위한 mutation 훅
export function useDeleteById<TData = unknown, TError = unknown>(
  baseUrl: string,
  options?: UseMutationOptions<TData, TError, string | number>,
  config?: AxiosRequestConfig
) {
  return useReactMutation<TData, TError, string | number>({
    mutationFn: id => apiClient.delete<TData>(`${baseUrl}/${id}`, config),
    ...options,
  });
}
