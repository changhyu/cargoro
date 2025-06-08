'use client';

import { ReactNode } from 'react';

import { ApiProvider } from '@cargoro/api-client';

// 환경 변수에서 API URL 가져오기
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

interface WorkshopApiProviderProps {
  children: ReactNode;
  initialToken?: string;
}

export default function WorkshopApiProvider({ children, initialToken }: WorkshopApiProviderProps) {
  // initialToken이 undefined일 경우 빈 문자열로 처리
  const token = initialToken || '';

  return (
    <ApiProvider
      baseURL={API_URL}
      graphqlURL={GRAPHQL_URL}
      initialToken={token}
      showDevtools={process.env.NODE_ENV === 'development'}
      queryClientOptions={{
        queries: {
          // 정비소용 최적화 설정
          staleTime: 5 * 60 * 1000, // 5분
          gcTime: 15 * 60 * 1000, // 15분
          retry: (failureCount: number) => failureCount < 2,
          refetchOnWindowFocus: true,
          refetchOnMount: true,
          refetchOnReconnect: 'always',
        },
        mutations: {
          retry: 0, // boolean 대신 number 사용
          gcTime: 0, // 뮤테이션은 캐시하지 않음
        },
      }}
    >
      {children}
    </ApiProvider>
  );
}
