'use client';

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientAnalyticsProvider from './analytics-provider';
import { Toaster } from '@cargoro/ui/toaster';

// 동적으로 QueryClient 인스턴스 생성 (hydration 문제 방지)
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        // SSR에서 사용 시 문제 방지 옵션
      },
    },
  });
}

interface RootProviderProps {
  children: ReactNode;
}

const RootProvider = ({ children }: RootProviderProps): JSX.Element => {
  // 클라이언트 사이드에서만 QueryClient 인스턴스 생성
  const [queryClient] = useState(() => createQueryClient());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 서버 사이드 렌더링 중에는 최소한의 컨텐츠만 표시
  if (!isMounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClientAnalyticsProvider>
        {children}
        <Toaster />
      </ClientAnalyticsProvider>
    </QueryClientProvider>
  );
};

export default RootProvider;
