'use client';

import { ReactNode } from 'react';

import { ApiProvider } from '@cargoro/api-client';

interface SuperAdminApiProviderProps {
  children: ReactNode;
  baseURL?: string;
  initialToken?: string;
}

export default function SuperAdminApiProvider({
  children,
  baseURL,
  initialToken,
}: SuperAdminApiProviderProps) {
  const apiBaseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  return (
    <ApiProvider
      baseURL={apiBaseURL}
      graphqlURL={`${apiBaseURL.replace('/api', '')}/graphql`}
      initialToken={initialToken}
      showDevtools={process.env.NODE_ENV === 'development'}
      queryClientOptions={{
        queries: {
          // 관리자용 최적화 설정
          staleTime: 1 * 60 * 1000, // 1분 (실시간 모니터링 필요)
          gcTime: 5 * 60 * 1000, // 5분
          retry: (failureCount: number) => failureCount < 3,
          refetchOnWindowFocus: true, // 관리자는 실시간 데이터 중요
          refetchOnMount: true,
          refetchOnReconnect: 'always' as const,
        },
      }}
    >
      {children}
    </ApiProvider>
  );
}
