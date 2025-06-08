import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { graphqlClient } from '../lib/config/config';
import { queryPresets } from '../utils/query-defaults';

import type {
  UseQueryOptions,
  UseMutationOptions,
  UseSuspenseQueryOptions,
  Query,
} from '@tanstack/react-query';
import type { RequestDocument } from 'graphql-request';

// React Query 5.75.8 호환 타입 정의
interface GraphQLQueryOptions<TData = unknown, TError = Error>
  extends Omit<
    UseQueryOptions<TData, TError, unknown, readonly unknown[]>,
    'queryKey' | 'queryFn'
  > {
  enabled?: boolean;
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  staleTime?: number;
  gcTime?: number; // React Query 5.x에서 cacheTime -> gcTime 변경
  refetchOnMount?: boolean | 'always';
  refetchOnWindowFocus?: boolean | 'always';
  refetchOnReconnect?: boolean | 'always';
  refetchInterval?:
    | number
    | false
    | ((query: Query<TData, TError, TData, readonly unknown[]>) => number | false | undefined);
  refetchIntervalInBackground?: boolean;
  select?: (data: TData) => unknown;
  suspense?: boolean;
  keepPreviousData?: boolean; // deprecated but still supported
}

interface GraphQLMutationOptions<TData = unknown, TError = Error, TVariables = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
  onError?: (error: TError, variables: TVariables, context: unknown) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: unknown
  ) => void;
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: TError) => number);
}

// 기본 GraphQL 쿼리 훅 (React Query 5.75.8 최적화)
export function useGraphQLQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(document: RequestDocument, variables?: TVariables, options?: GraphQLQueryOptions<TData>) {
  return useQuery({
    queryKey: ['graphql', document, variables],
    queryFn: async () => graphqlClient.query<TData, TVariables>(document, variables),
    ...options,
  });
}

// Suspense 지원 GraphQL 쿼리 훅 (React 18+ 최적화)
export function useSuspenseGraphQLQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  document: RequestDocument,
  variables?: TVariables,
  options?: Omit<UseSuspenseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  return useSuspenseQuery({
    queryKey: ['graphql', document, variables],
    queryFn: async () => graphqlClient.query<TData, TVariables>(document, variables),
    ...options,
  });
}

// GraphQL 뮤테이션 훅 (React Query 5.75.8 최적화)
export function useGraphQLMutation<TData = unknown, TVariables = unknown>(
  document: RequestDocument,
  options?: GraphQLMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) =>
      graphqlClient.query<TData, Record<string, unknown>>(
        document,
        variables as Record<string, unknown>
      ),
    // 기본 무효화 전략
    onSuccess: (data, variables, context) => {
      // GraphQL 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['graphql'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// 헤더와 함께 GraphQL 쿼리를 위한 훅
export function useGraphQLQueryWithHeaders<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  document: RequestDocument,
  variables?: TVariables,
  headers?: Record<string, string>,
  options?: GraphQLQueryOptions<TData>
) {
  return useQuery({
    queryKey: ['graphql', document, variables, headers],
    queryFn: async () =>
      graphqlClient.queryWithHeaders<TData, TVariables>(document, variables, headers),
    ...options,
  });
}

// 실시간 업데이트가 필요한 데이터를 위한 GraphQL 쿼리 훅
export function useRealtimeGraphQLQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(document: RequestDocument, variables?: TVariables, options?: GraphQLQueryOptions<TData>) {
  return useQuery({
    queryKey: ['graphql', 'realtime', document, variables],
    queryFn: async () => graphqlClient.query<TData, TVariables>(document, variables),
    ...queryPresets.realtime,
    ...options,
  });
}

// 자주 변경되는 데이터를 위한 GraphQL 쿼리 훅
export function useFrequentlyUpdatedGraphQLQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(document: RequestDocument, variables?: TVariables, options?: GraphQLQueryOptions<TData>) {
  return useQuery({
    queryKey: ['graphql', 'frequent', document, variables],
    queryFn: async () => graphqlClient.query<TData, TVariables>(document, variables),
    ...queryPresets.frequentlyUpdated,
    ...options,
  });
}

// 거의 변경되지 않는 데이터를 위한 GraphQL 쿼리 훅
export function useRarelyUpdatedGraphQLQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(document: RequestDocument, variables?: TVariables, options?: GraphQLQueryOptions<TData>) {
  return useQuery({
    queryKey: ['graphql', 'rare', document, variables],
    queryFn: async () => graphqlClient.query<TData, TVariables>(document, variables),
    ...queryPresets.rarelyUpdated,
    ...options,
  });
}

// 배치 쿼리 훅 (성능 최적화)
export function useBatchGraphQLQueries<TData = unknown>(
  queries: Array<{
    document: RequestDocument;
    variables?: Record<string, unknown>;
  }>,
  options?: GraphQLQueryOptions<TData[]>
) {
  return useQuery({
    queryKey: ['graphql', 'batch', queries],
    queryFn: async () => graphqlClient.batchQueries<TData>(queries),
    ...options,
  });
}

// 무한 스크롤을 위한 GraphQL 쿼리 훅
export function useInfiniteGraphQLQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  document: RequestDocument,
  variables?: TVariables,
  options?: {
    getNextPageParam?: (lastPage: TData, allPages: TData[]) => unknown;
    getPreviousPageParam?: (firstPage: TData, allPages: TData[]) => unknown;
    maxPages?: number;
  } & GraphQLQueryOptions<TData>
) {
  const {
    getNextPageParam: _,
    getPreviousPageParam: __,
    maxPages: ___,
    ...queryOptions
  } = options || {};

  return useQuery({
    queryKey: ['graphql', 'infinite', document, variables],
    queryFn: async ({ pageParam = null }) => {
      // TVariables 타입과 호환되도록 pageVariables 타입 처리
      const pageVariables = pageParam
        ? { ...variables, ...(pageParam as Record<string, unknown>) }
        : variables;

      // 타입 안전성 보장
      return graphqlClient.query<TData, TVariables>(document, pageVariables as TVariables);
    },
    ...queryOptions,
  });
}
