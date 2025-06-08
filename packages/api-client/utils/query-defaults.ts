// import { QueryClient } from '@tanstack/react-query';

/**
 * React Query 5.75.8 최적화된 기본 옵션
 * - gcTime: cacheTime에서 변경된 새로운 옵션명
 * - 성능 최적화된 설정
 */
export const defaultQueryOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (cacheTime에서 변경)
    retry: (failureCount: number, error: Error) => {
      // 401, 403은 재시도하지 않음
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: 'always' as const,
  },
  mutations: {
    retry: 1,
    gcTime: 0, // 뮤테이션은 캐시하지 않음
  },
};

/**
 * 데이터 업데이트 빈도별 쿼리 프리셋
 * React Query 5.75.8 호환
 */
export const queryPresets = {
  // 실시간 업데이트 (탁송 위치, 차량 상태 등)
  realtime: {
    staleTime: 0,
    gcTime: 30 * 1000, // 30초
    refetchInterval: 10 * 1000, // 10초마다
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  },

  // 자주 업데이트 (예약 상태, 재고 등)
  frequentlyUpdated: {
    staleTime: 30 * 1000, // 30초
    gcTime: 2 * 60 * 1000, // 2분
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // 1분마다
  },

  // 가끔 업데이트 (사용자 정보, 설정 등)
  rarelyUpdated: {
    staleTime: 30 * 60 * 1000, // 30분
    gcTime: 60 * 60 * 1000, // 1시간
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // 정적 데이터 (코드표, 상수 등)
  static: {
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24시간
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
};

/**
 * GraphQL 특화 쿼리 키 생성 유틸리티
 */
export const createGraphQLQueryKey = (
  operation: string,
  variables?: Record<string, unknown>,
  metadata?: Record<string, unknown>
) => ['graphql', operation, variables, metadata].filter(Boolean);

/**
 * REST API 쿼리 키 생성 유틸리티
 */
export const createRestQueryKey = (
  endpoint: string,
  params?: Record<string, unknown>,
  metadata?: Record<string, unknown>
) => ['rest', endpoint, params, metadata].filter(Boolean);
