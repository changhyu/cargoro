import { QueryKey, UseMutationResult, UseQueryResult } from '@tanstack/react-query';

// 테스트용 타입 정의
export interface MockedQueryFn {
  (): Promise<{ data: unknown }>;
}

export interface MockedMutationFn {
  (variables?: unknown): Promise<{ data: unknown }>;
}

// 모의 호출 타입 정의
export interface MockCall {
  queryKey?: QueryKey;
  queryFn?: MockedQueryFn;
  mutationFn?: MockedMutationFn;
  [key: string]: unknown;
}

export interface MockCalls {
  calls: MockCall[][];
}

// useQuery와 useMutation 모킹을 위한 타입
export type MockedQueryResult<TData = { data: { test: string } }> = UseQueryResult<TData, Error> & {
  [key: string]: unknown;
};

export type MockedMutationResult<
  TData = unknown,
  TVariables = unknown,
  TError = Error,
> = UseMutationResult<TData, TError, TVariables, unknown> & {
  [key: string]: unknown;
};
